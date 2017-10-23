/**
 * Copyright 2017 PhenixP2P Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
define([
    'phenix-web-lodash-light',
    'phenix-web-assert',
    'phenix-web-observable',
    './logging/pcastLoggerFactory',
    'phenix-web-http',
    './PCastProtocol',
    './PCastEndPoint',
    './ScreenShareExtensionManager',
    './PeerConnectionMonitor',
    './DimensionsChangedMonitor',
    './telemetry/metricsTransmitterFactory',
    './telemetry/StreamTelemetry',
    './telemetry/SessionTelemetry',
    'phenix-rtc'
], function (_, assert, observable, pcastLoggerFactory, http, PCastProtocol, PCastEndPoint, ScreenShareExtensionManager, PeerConnectionMonitor, DimensionsChangedMonitor, metricsTransmitterFactory, StreamTelemetry, SessionTelemetry, phenixRTC) {
    'use strict';

    var NetworkStates = _.freeze({
        'NETWORK_EMPTY': 0,
        'NETWORK_IDLE': 1,
        'NETWORK_LOADING': 2,
        'NETWORK_NO_SOURCE': 3
    });
    var sdkVersion = '%SDKVERSION%';
    var widevineServiceCertificate = null;
    var defaultBandwidthEstimateForPlayback = 2000000; // 2Mbps will select 720p by default
    var numberOfTimesToRetryHlsStalledHlsStream = 5;

    function PCast(options) {
        options = options || {};
        this._observableStatus = new observable.Observable('offline');
        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
        this._deviceId = options.deviceId || '';
        this._version = sdkVersion;
        this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri, options.disableConsoleLogging);
        this._metricsTransmitter = options.metricsTransmitter || metricsTransmitterFactory.createMetricsTransmitter(this._baseUri);
        this._sessionTelemetry = new SessionTelemetry(this._logger, this._metricsTransmitter);
        this._endPoint = new PCastEndPoint(this._version, this._baseUri, this._logger, this._sessionTelemetry);
        this._screenShareExtensionManager = new ScreenShareExtensionManager(options, this._logger);
        this._shaka = options.shaka || window.shaka;
        this._videojs = options.videojs || window.videojs;
        this._status = 'offline';

        var that = this;

        _.addEventListener(window, 'unload', function () {
            that._logger.info('Window Unload Event Triggered');

            return that.stop();
        });

        if (!options.disableBeforeUnload) {
            _.addEventListener(window, 'beforeunload', function() {
                that._logger.info('Window Before Unload Event Triggered');

                return that.stop();
            });
        }
    }

    PCast.prototype.getBaseUri = function () {
        return this._endPoint.getBaseUri();
    };

    PCast.prototype.getStatus = function () {
        return this._observableStatus.getValue();
    };

    PCast.prototype.getObservableStatus = function () {
        return this._observableStatus;
    };

    PCast.prototype.start = function (authToken, authenticationCallback, onlineCallback, offlineCallback) {
        if (typeof authToken !== 'string') {
            throw new Error('"authToken" must be a string');
        }

        if (typeof authenticationCallback !== 'function') {
            throw new Error('"authenticationCallback" must be a function');
        }

        if (typeof onlineCallback !== 'function') {
            throw new Error('"onlineCallback" must be a function');
        }

        if (typeof offlineCallback !== 'function') {
            throw new Error('"offlineCallback" must be a function');
        }

        if (this._started) {
            throw new Error('"Already started"');
        }

        this._stopped = false;
        this._started = true;
        this._authToken = authToken;
        this._authenticationCallback = authenticationCallback;
        this._onlineCallback = onlineCallback;
        this._offlineCallback = offlineCallback;

        transitionToStatus.call(this, 'connecting');

        this._peerConnections = {};
        this._mediaStreams = {};
        this._publishers = {};
        this._gumStreams = [];

        var that = this;

        that._endPoint.resolveUri(function (err, endPoint) {
            if (err) {
                that._logger.error('Failed to connect to [%s]', that._baseUri, err);

                transitionToStatus.call(that, 'offline');

                switch (err.code) {
                case 0:
                    that._authenticationCallback.call(that, that, 'network-unavailable', '');

                    break;
                case 503:
                    that._authenticationCallback.call(that, that, 'capacity', '');

                    break;
                default:
                    that._authenticationCallback.call(that, that, 'failed', '');

                    break;
                }

                that._stopped = true;
                that._started = false;

                return;
            }

            that._logger.info('Discovered end point [%s] with RTT [%s]', endPoint.uri, endPoint.roundTripTime);

            that._networkOneWayLatency = endPoint.roundTripTime / 2;
            that._resolvedEndPoint = endPoint.uri;

            instantiateProtocol.call(that, endPoint.uri);
        });
    };

    PCast.prototype.stop = function () {
        if (!this._started) {
            return;
        }

        this._stopped = true;
        this._started = false;

        delete this._authenticationCallback;

        try {
            var reason = '';
            var that = this;

            _.forOwn(this._mediaStreams, function(mediaStream, streamId) {
                endStream.call(that, streamId, reason);
            });
            _.forOwn(this._publishers, function(publisher, publisherStreamId) {
                endStream.call(that, publisherStreamId, reason);

                if (!_.includes(publisher.getOptions(), 'detached')) {
                    publisher.stop(reason);
                }
            });
            _.forOwn(this._peerConnections, function(mediaStream, peerConnectionStreamId) {
                endStream.call(that, peerConnectionStreamId, reason);
            });
            _.forEach(this._gumStreams, function(gumStream) {
                var tracks = gumStream.getTracks();

                _.forEach(tracks, function(track) {
                    track.stop();
                });
            });
        } finally {
            if (this._protocol) {
                this._protocol.disconnect();

                this._protocol = null;
            }

            if (this._logger.setObservableSessionId) {
                this._logger.setObservableSessionId(null);
            }

            if (this._sessionTelemetrySubscription) {
                this._sessionTelemetrySubscription.dispose();
                this._sessionTelemetry.setSessionId(null);
            }
        }
    };

    PCast.prototype.getUserMedia = function (options, callback) {
        if (phenixRTC.browser === 'IE') {
            throw new Error('Publishing not supported on IE');
        }

        if (typeof options !== 'object') {
            throw new Error('"options" must be an object');
        }

        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        return getUserMedia.call(this, options, callback);
    };

    PCast.prototype.publish = function (streamToken, streamToPublish, callback, tags, options) {
        if (phenixRTC.browser === 'Edge') {
            throw new Error('Publishing not supported on Edge');
        }

        if (phenixRTC.browser === 'IE') {
            throw new Error('Publishing not supported on IE');
        }

        if (!this._started) {
            throw new Error('PCast not started. Unable to publish. Please start pcast first.');
        }

        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }

        if (typeof streamToPublish !== 'object' && typeof streamToPublish !== 'string') {
            throw new Error('"streamToPublish" must be an object or URI');
        }

        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        tags = tags || [];

        if (!Array.isArray(tags)) {
            throw new Error('"tags" must be an array');
        }

        options = options || {};

        if (typeof options !== 'object') {
            throw new Error('"options" must be an object');
        }

        var that = this;
        var streamType = 'upload';
        var setupStreamOptions = _.assign({}, options, {negotiate: true});

        if (typeof streamToPublish === 'string') {
            setupStreamOptions.negotiate = false;
            setupStreamOptions.connectUri = streamToPublish;
        } else {
            setupStreamOptions.connectUri = options.connectUri;
        }

        if (tags.length > 0) {
            setupStreamOptions.tags = tags;
        }

        var streamTelemetry = new StreamTelemetry(this.getProtocol().getSessionId(), this._logger, this._metricsTransmitter);

        streamTelemetry.setProperty('resource', streamType);

        this._protocol.setupStream(streamType, streamToken, setupStreamOptions, function (error, response) {
            if (error) {
                that._logger.error('Failed to create uploader [%s]', error);

                return callback.call(that, that, 'failed');
            } else if (response.status !== 'ok') {
                that._logger.warn('Failed to create uploader, status [%s]', response.status);

                switch (response.status) {
                case 'capacity':
                case 'unauthorized':
                    return callback.call(that, that, response.status);
                default:
                    return callback.call(that, that, 'failed');
                }
            } else {
                var streamId = response.createStreamResponse.streamId;

                streamTelemetry.setStreamId(streamId);
                streamTelemetry.setStartOffset(response.createStreamResponse.offset);
                streamTelemetry.recordMetric('Provisioned');
                streamTelemetry.recordMetric('RoundTripTime', {uint64: that._networkOneWayLatency * 2}, null, {
                    resource: that._resolvedEndPoint,
                    kind: 'https'
                });

                if (setupStreamOptions.negotiate === true) {
                    var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;
                    var peerConnectionConfig = applyVendorSpecificLogic(parseProtobufMessage(response.createStreamResponse.rtcConfiguration));

                    return createPublisherPeerConnection.call(that, peerConnectionConfig, streamToPublish, streamId, offerSdp, streamTelemetry, function (phenixPublisher, error) {
                        streamTelemetry.recordMetric('SetupCompleted', {string: error ? 'failed' : 'ok'});

                        if (error) {
                            callback.call(that, that, 'failed', null);
                        } else {
                            callback.call(that, that, 'ok', phenixPublisher);
                        }
                    }, options, response.createStreamResponse.options);
                }

                return createPublisher.call(that, streamId, function (phenixPublisher, error) {
                    streamTelemetry.recordMetric('SetupCompleted', {string: error ? 'failed' : 'ok'});

                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixPublisher);
                    }
                }, response.createStreamResponse.options);
            }
        });
    };

    PCast.prototype.subscribe = function (streamToken, callback, options) {
        if (!this._started) {
            throw new Error('PCast not started. Unable to subscribe. Please start pcast first.');
        }

        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }

        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        options = options || {};

        if (typeof options !== 'object') {
            throw new Error('"options" must be an object');
        }

        var that = this;
        var streamType = 'download';
        var setupStreamOptions = _.assign({}, options, {negotiate: options.negotiate !== false});
        var streamTelemetry = new StreamTelemetry(this.getProtocol().getSessionId(), this._logger, this._metricsTransmitter);

        streamTelemetry.setProperty('resource', streamType);

        this._protocol.setupStream(streamType, streamToken, setupStreamOptions, function (error, response) {
            if (error) {
                that._logger.error('Failed to create downloader [%s]', error);

                return callback.call(that, that, 'failed');
            } else if (response.status !== 'ok') {
                that._logger.warn('Failed to create downloader, status [%s]', response.status);

                switch (response.status) {
                case 'capacity':
                case 'stream-ended':
                case 'origin-stream-ended':
                case 'streaming-not-available':
                case 'unauthorized':
                    return callback.call(that, that, response.status);
                default:
                    return callback.call(that, that, 'failed');
                }
            } else {
                var streamId = response.createStreamResponse.streamId;
                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;
                var peerConnectionConfig = applyVendorSpecificLogic(parseProtobufMessage(response.createStreamResponse.rtcConfiguration));
                var create = _.bind(createViewerPeerConnection, that, peerConnectionConfig);

                if (offerSdp.match(/a=x-playlist:/)) {
                    create = createLiveViewer;
                }

                streamTelemetry.setStreamId(streamId);
                streamTelemetry.setStartOffset(response.createStreamResponse.offset);
                streamTelemetry.recordMetric('Provisioned');
                streamTelemetry.recordMetric('RoundTripTime', {uint64: that._networkOneWayLatency * 2}, null, {
                    resource: that.getBaseUri(),
                    kind: 'https'
                });

                options.originStartTime = _.now() - response.createStreamResponse.offset + that._networkOneWayLatency;

                return create.call(that, streamId, offerSdp, streamTelemetry, function (phenixMediaStream, error) {
                    streamTelemetry.recordMetric('SetupCompleted', {string: error ? 'failed' : 'ok'});

                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixMediaStream);
                    }
                }, options);
            }
        });
    };

    PCast.prototype.getProtocol = function () {
        return this._protocol;
    };

    PCast.prototype.getLogger = function () {
        return this._logger;
    };

    PCast.prototype.toString = function () {
        var protocol = this.getProtocol();
        var sessionId = protocol ? protocol.getSessionId() : '';

        return 'PCast[' + sessionId || 'unauthenticated' + ',' + (protocol ? protocol.toString() : 'uninitialized') + ']';
    };

    function getUserMediaConstraints(options, callback) {
        var that = this;

        if (options.screen) {
            return that._screenShareExtensionManager.isScreenSharingEnabled(function (isEnabled) {
                if (isEnabled) {
                    return that._screenShareExtensionManager.getScreenSharingConstraints(options, callback);
                }

                return that._screenShareExtensionManager.installExtension(function(error, response) {
                    if (error || (response && response.status !== 'ok')) {
                        return callback(error, response);
                    }

                    return that._screenShareExtensionManager.getScreenSharingConstraints(options, callback);
                });
            });
        }

        var constraints = {
            audio: options.audio || false,
            video: options.video || false
        };

        callback(null, {
            status: 'ok',
            constraints: constraints
        });
    }

    function getUserMedia(options, callback) {
        var that = this;

        var onUserMediaSuccess = function onUserMediaSuccess(status, stream) {
            if (that._gumStreams) {
                that._gumStreams.push(stream);
            }

            callback(that, status, stream);
        };

        var onUserMediaFailure = function onUserMediaFailure(status, stream, error) {
            callback(that, status, stream, error);
        };

        var hasScreen = options.screen;
        var hasVideoOrAudio = options.video || options.audio;

        if (!(hasScreen && hasVideoOrAudio)) {
            return getUserMediaStream.call(that, options, onUserMediaSuccess, onUserMediaFailure);
        }

        return getUserMediaStream.call(that, {screen: options.screen}, function success(status, screenStream) {
            return getUserMediaStream.call(that, {
                audio: options.audio,
                video: options.video
            }, function screenSuccess(status, stream) {
                addTracksToWebRTCStream(stream, screenStream.getTracks());

                onUserMediaSuccess(status, stream);
            }, function failure(status, stream, error) {
                stopWebRTCStream(screenStream);

                onUserMediaFailure(status, stream, error);
            });
        }, onUserMediaFailure);
    }

    function getUserMediaStream(options, successCallback, failureCallback) {
        var onUserMediaCancelled = function onUserMediaCancelled() {
            failureCallback('cancelled', null);
        };

        var onUserMediaFailure = function onUserMediaFailure(e) {
            failureCallback(getUserMediaErrorStatus(e), undefined, e);
        };

        var onUserMediaSuccess = function onUserMediaSuccess(stream) {
            successCallback('ok', stream);
        };

        return getUserMediaConstraints.call(this, options, function (error, response) {
            if (response.status === 'cancelled') {
                return onUserMediaCancelled();
            }

            if (response.status !== 'ok') {
                return onUserMediaFailure(error);
            }

            try {
                phenixRTC.getUserMedia(response.constraints, onUserMediaSuccess, onUserMediaFailure);
            } catch (e) {
                onUserMediaFailure(e);
            }
        });
    }

    var getUserMediaErrorStatus = function getUserMediaErrorStatus(e) {
        var status;

        if (e.code === 'unavailable') {
            status = 'conflict';
        } else if (e.message === 'permission-denied') {
            status = 'permission-denied';
        } else if (e.name === 'PermissionDeniedError') { // Chrome
            status = 'permission-denied';
        } else if (e.name === 'InternalError' && e.message === 'Starting video failed') { // FF (old getUserMedia API)
            status = 'conflict';
        } else if (e.name === 'SourceUnavailableError') { // FF
            status = 'conflict';
        } else if (e.name === 'SecurityError' && e.message === 'The operation is insecure.') { // FF
            status = 'permission-denied';
        } else {
            status = 'failed';
        }

        return status;
    };

    function instantiateProtocol(uri) {
        this._protocol = new PCastProtocol(uri, this._deviceId, this._version, this._logger);

        this._protocol.onEvent('connected', _.bind(connected, this));
        this._protocol.onEvent('reconnecting', _.bind(reconnecting, this));
        this._protocol.onEvent('reconnected', _.bind(reconnected, this));
        this._protocol.onEvent('disconnected', _.bind(disconnected, this));
        this._protocol.onEvent('pcast.StreamEnded', _.bind(streamEnded, this));
        this._protocol.onEvent('pcast.StreamDataQuality', _.bind(dataQuality, this));

        if (this._logger.setObservableSessionId) {
            this._logger.setObservableSessionId(this._protocol.getObservableSessionId());
        }

        if (this._sessionTelemetrySubscription) {
            this._sessionTelemetrySubscription.dispose();
            this._sessionTelemetry.setSessionId(null);
        }

        this._sessionTelemetrySubscription = this._protocol.getObservableSessionId().subscribe(_.bind(this._sessionTelemetry.setSessionId, this._sessionTelemetry));
    }

    function connected() {
        var that = this;

        this._connected = true;

        if (!that._stopped) {
            that._protocol.authenticate(that._authToken, function (error, response) {
                if (that._authenticationCallback) {
                    if (error) {
                        that._logger.error('Failed to authenticate [%s]', error);
                        transitionToStatus.call(that, 'offline');
                        that._authenticationCallback.call(that, that, 'unauthorized', '');
                        that.stop('unauthorized');
                    } else if (response.status !== 'ok') {
                        that._logger.warn('Failed to authenticate, status [%s]', response.status);
                        transitionToStatus.call(that, 'offline');
                        that._authenticationCallback.call(that, that, 'unauthorized', '');
                        that.stop('unauthorized');
                    } else {
                        transitionToStatus.call(that, 'online');

                        that._authenticationCallback.call(that, that, response.status, response.sessionId);
                    }
                }
            });
        }
    }

    function reconnecting() {
        transitionToStatus.call(this, 'reconnecting');
    }

    function reconnected() {
        transitionToStatus.call(this, 'reconnected');

        this._logger.info('Attempting to re-authenticate after reconnect event');

        var that = this;

        if (!that._stopped) {
            that._protocol.authenticate(that._authToken, function (error, response) {
                var suppressCallback = that._connected === true;

                if (error) {
                    that._logger.error('Unable to authenticate after reconnect to WebSocket [%s]', error);

                    return transitionToStatus.call(that, 'offline');
                }

                if (response.status !== 'ok') {
                    that._logger.warn('Unable to authenticate after reconnect to WebSocket, status [%s]', response.status);

                    return transitionToStatus.call(that, 'offline');
                }

                that._connected = true;

                that._logger.info('Successfully authenticated after reconnect to WebSocket');

                return transitionToStatus.call(that, 'online', suppressCallback);
            });
        }
    }

    function disconnected() {
        this._connected = false;
        transitionToStatus.call(this, 'offline');
    }

    function getStreamEndedReason(value) {
        switch (value) {
        case '':
        case 'none':
        case 'ended':
            return 'ended';
        case 'server-error':
        case 'session-error':
        case 'not-ready':
        case 'error':
        case 'died':
            return 'failed';
        case 'censored':
            return 'censored';
        case 'maintenance':
            return 'maintenance';
        case 'capacity':
            return 'capacity';
        case 'app-background':
            return 'app-background';
        default:
            return 'custom';
        }
    }

    function streamEnded(event) {
        var streamId = event.streamId;
        var reason = event.reason;

        return endStream.call(this, streamId, reason);
    }

    function dataQuality(event) {
        var streamId = event.streamId;
        var status = event.status;
        var reason = event.reason;

        var internalMediaStream = this._mediaStreams[streamId];

        if (internalMediaStream) {
            internalMediaStream.dataQualityChangedCallback(status, reason);
        }

        var publisher = this._publishers[streamId];

        if (publisher && typeof publisher.dataQualityChangedCallback === 'function') {
            publisher.dataQualityChangedCallback(publisher, status, reason);
        }
    }

    function endStream(streamId, reason) {
        this._logger.info('[%s] Stream ended with reason [%s]', streamId, reason);

        var internalMediaStream = this._mediaStreams[streamId];

        if (internalMediaStream) {
            internalMediaStream.streamEndedCallback(getStreamEndedReason(reason), reason, true);
        }

        delete this._mediaStreams[streamId];

        var publisher = this._publishers[streamId];

        if (publisher && typeof publisher.publisherEndedCallback === 'function') {
            publisher.publisherEndedCallback(publisher, getStreamEndedReason(reason), reason);
        }

        delete this._publishers[streamId];

        var peerConnection = this._peerConnections[streamId];

        if (peerConnection) {
            closePeerConnection.call(this, streamId, peerConnection, 'ended');
        }

        delete this._peerConnections[streamId];
    }

    function setupStreamAddedListener(streamId, state, peerConnection, streamTelemetry, callback, options) {
        var that = this;
        var onAddStream = function onAddStream(event) {
            if (state.failed) {
                return;
            }

            var masterStream = event.stream;

            if (!masterStream) {
                state.failed = true;
                that._logger.warn('[%s] No remote stream', streamId);

                return callback.call(that, undefined, 'failed');
            }

            that._logger.info('[%s] Got remote stream', streamId);

            streamTelemetry.setProperty('kind', 'real-time');

            var createMediaStream = function createMediaStream(stream) {
                var internalMediaStream = {
                    children: [],
                    renderer: null,
                    isStopped: false,
                    isStreamEnded: false,

                    mediaStream: {
                        createRenderer: function createRenderer() {
                            var element = null;
                            var dimensionsChangedMonitor = new DimensionsChangedMonitor(that._logger);

                            return {
                                start: function start(elementToAttachTo) {
                                    element = phenixRTC.attachMediaStream(elementToAttachTo, stream);

                                    streamTelemetry.recordTimeToFirstFrame(element);
                                    streamTelemetry.recordRebuffering(element);
                                    streamTelemetry.recordVideoResolutionChanges(element);

                                    if (options.receiveAudio === false) {
                                        element.muted = true;
                                    }

                                    internalMediaStream.renderer = this;

                                    dimensionsChangedMonitor.start(this, element);

                                    return element;
                                },

                                stop: function stop() {
                                    dimensionsChangedMonitor.stop();

                                    streamTelemetry.stop();

                                    if (element) {
                                        if (typeof element.pause === 'function') {
                                            element.pause();
                                        }

                                        if (phenixRTC.browser === 'Edge') {
                                            element.src = '';
                                        }

                                        if (element.src && (phenixRTC.browser === 'IE')) {
                                            element.src = null;
                                        } else if (element.src) {
                                            element.src = '';
                                        }

                                        if (element.srcObject) {
                                            element.srcObject = null;
                                        }

                                        element = null;
                                    }

                                    internalMediaStream.renderer = null;
                                },

                                getStats: function getStats() {
                                    if (!element) {
                                        return {
                                            width: 0,
                                            height: 0,
                                            currentTime: 0.0,
                                            lag: 0.0,
                                            networkState: NetworkStates.NETWORK_NO_SOURCE
                                        };
                                    }

                                    var trueCurrentTime = (_.now() - options.originStartTime) / 1000;
                                    var lag = that._networkOneWayLatency / 1000; // Check RTC stats instead

                                    return {
                                        width: element.videoWidth || element.width,
                                        height: element.videoHeight || element.height,
                                        currentTime: trueCurrentTime,
                                        lag: lag,
                                        networkState: element.networkState
                                    };
                                },

                                setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                                    if (typeof callback !== 'function') {
                                        throw new Error('"callback" must be a function');
                                    }

                                    this.dataQualityChangedCallback = callback;
                                },

                                setVideoDisplayDimensionsChangedCallback: function setVideoDisplayDimensionsChangedCallback(callback, options) {
                                    dimensionsChangedMonitor.setVideoDisplayDimensionsChangedCallback(callback, options);
                                }
                            };
                        },

                        setStreamEndedCallback: function setStreamEndedCallback(callback) {
                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            this.streamEndedCallback = callback;
                        },

                        setStreamErrorCallback: function setStreamErrorCallback(callback) {
                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            this.streamErrorCallback = callback;
                        },

                        stop: function stop(reason) {
                            if (internalMediaStream.isStopped) {
                                return;
                            }

                            stopWebRTCStream(stream);

                            if (noTracksAreActiveInMaster() || phenixRTC.browser === 'Edge' || phenixRTC.browser === 'IE') {
                                destroyMasterMediaStream(reason);
                            }

                            internalMediaStream.isStopped = true;
                        },

                        monitor: function monitor(options, callback) {
                            if (typeof options !== 'object') {
                                throw new Error('"options" must be an object');
                            }

                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            var monitor = new PeerConnectionMonitor(streamId, peerConnection, that._logger);

                            options.direction = 'inbound';

                            monitor.start(options, function activeCallback() {
                                return internalMediaStream.mediaStream.isActive();
                            }, function monitorCallback(reason) {
                                that._logger.warn('[%s] Media stream triggered monitor condition for [%s]', streamId, reason);

                                return callback(internalMediaStream.mediaStream, 'client-side-failure', reason);
                            });
                        },

                        getStats: function getStats(callback) {
                            assert.isFunction(callback, 'callback');

                            if (!this._lastStats) {
                                this._lastStats = {};
                            }

                            var that = this;

                            return phenixRTC.getStats(peerConnection, null, function (stats) {
                                callback(convertPeerConnectionStats(stats, that._lastStats));
                            });
                        },

                        getStream: function getStream() {
                            return stream;
                        },

                        isActive: function isActive() {
                            var isMasterStreamStopped = state.stopped;
                            var isMasterStreamDestroyed = typeof that._mediaStreams[streamId] !== 'object';
                            var isCurrentStreamStopped = internalMediaStream.isStopped;

                            return !isMasterStreamStopped && !isMasterStreamDestroyed && !isCurrentStreamStopped;
                        },

                        getStreamId: function getStreamId() {
                            return streamId;
                        },

                        select: function select(trackSelectCallback) {
                            if (typeof trackSelectCallback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            if (typeof window.MediaStream !== 'function') {
                                throw new Error('MediaStream not supported in current browser');
                            }

                            var tracks = masterStream.getTracks();
                            var streamToAttach = new window.MediaStream();

                            for (var i = 0; i < tracks.length; i++) {
                                if (trackSelectCallback(tracks[i], i)) {
                                    streamToAttach.addTrack(tracks[i]);
                                }
                            }

                            if (streamToAttach.getTracks().length === 0) {
                                return that._logger.warn('No tracks selected');
                            }

                            var newMediaStream = createMediaStream(streamToAttach);
                            internalMediaStream.children.push(newMediaStream);

                            return newMediaStream.mediaStream;
                        }
                    },

                    streamErrorCallback: function (status, reason) {
                        // Recursively calls all children error callbacks
                        for (var i = 0; i < internalMediaStream.children.length; i++) {
                            internalMediaStream.children[i].streamErrorCallback(status, reason);
                        }

                        var mediaStream = internalMediaStream.mediaStream;

                        if (typeof mediaStream.streamErrorCallback === 'function') {
                            mediaStream.streamErrorCallback(mediaStream, status, reason);
                        }
                    },

                    streamEndedCallback: function (status, reason) {
                        // Recursively calls all children ended callbacks
                        for (var i = 0; i < internalMediaStream.children.length; i++) {
                            internalMediaStream.children[i].streamEndedCallback(status, reason);
                        }

                        if (internalMediaStream.isStreamEnded) {
                            return;
                        }

                        var mediaStream = internalMediaStream.mediaStream;

                        internalMediaStream.isStreamEnded = true;

                        if (typeof mediaStream.streamEndedCallback === 'function') {
                            mediaStream.streamEndedCallback(mediaStream, status, reason);
                        }

                        mediaStream.stop();

                        if (internalMediaStream.renderer) {
                            internalMediaStream.renderer.stop();
                        }
                    },

                    dataQualityChangedCallback: function (status, reason) {
                        for (var i = 0; i < internalMediaStream.children.length; i++) {
                            internalMediaStream.children[i].dataQualityChangedCallback(status, reason);
                        }

                        var renderer = internalMediaStream.renderer;

                        if (!renderer) {
                            return;
                        }

                        if (typeof renderer.dataQualityChangedCallback === 'function') {
                            renderer.dataQualityChangedCallback(renderer, status, reason);
                        }
                    }
                };

                return internalMediaStream;
            };

            function noTracksAreActiveInMaster() {
                var tracks = masterStream.getTracks();

                for (var i = 0; i < tracks.length; i++) {
                    var track = tracks[i];

                    if (!isTrackStopped(track)) {
                        return false;
                    }
                }

                return true;
            }

            function destroyMasterMediaStream(reason) {
                if (state.stopped) {
                    return;
                }

                that._logger.info('[%s] stop media stream', streamId);

                closePeerConnection.call(that, streamId, peerConnection, 'stop');

                that._protocol.destroyStream(streamId, reason || '', function (error, response) {
                    if (error) {
                        that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);

                        return;
                    } else if (response.status !== 'ok') {
                        that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);

                        return;
                    }

                    that._logger.info('[%s] destroyed stream', streamId);
                });

                state.stopped = true;
            }

            var internalMediaStream = createMediaStream(masterStream);

            that._mediaStreams[streamId] = internalMediaStream;

            callback.call(that, internalMediaStream.mediaStream);
        };

        _.addEventListener(peerConnection, 'addstream', onAddStream);
    }

    function setupIceCandidateListener(streamId, peerConnection, callback) {
        var that = this;
        var onIceCandidate = function onIceCandidate(event) {
            var candidate = event.candidate;

            if (candidate) {
                that._logger.debug('[%s] ICE candidate: [%s] [%s] [%s]', streamId, candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
            } else {
                that._logger.info('[%s] ICE candidate discovery complete', streamId);
            }

            if (callback) {
                callback(candidate);
            }
        };

        _.addEventListener(peerConnection, 'icecandidate', onIceCandidate);
    }

    function setupStateListener(streamId, peerConnection) {
        var that = this;
        var onNegotiationNeeded = function onNegotiationNeeded(event) { // eslint-disable-line no-unused-vars
            that._logger.info('[%s] Negotiation needed');
        };

        var onIceConnectionStateChanged = function onIceConnectionStateChanged(event) { // eslint-disable-line no-unused-vars
            that._logger.info('[%s] ICE connection state changed [%s]', streamId, peerConnection.iceConnectionState);
        };

        var onIceGatheringStateChanged = function onIceGatheringStateChanged(event) { // eslint-disable-line no-unused-vars
            that._logger.info('[%s] ICE gathering state changed [%s]', streamId, peerConnection.iceGatheringState);
        };

        var onSignalingStateChanged = function onSignalingStateChanged(event) { // eslint-disable-line no-unused-vars
            that._logger.info('[%s] Signaling state changed [%s]', streamId, peerConnection.signalingState);
        };

        var onConnectionStateChanged = function onConnectionStateChanged(event) { // eslint-disable-line no-unused-vars
            that._logger.info('[%s] Connection state changed [%s]', streamId, peerConnection.connectionState);
        };

        _.addEventListener(peerConnection, 'negotiationneeded', onNegotiationNeeded);
        _.addEventListener(peerConnection, 'iceconnectionstatechange', onIceConnectionStateChanged);
        _.addEventListener(peerConnection, 'icegatheringstatechange ', onIceGatheringStateChanged);
        _.addEventListener(peerConnection, 'signalingstatechange', onSignalingStateChanged);
        _.addEventListener(peerConnection, 'connectionstatechange', onConnectionStateChanged);
    }

    function createPublisher(streamId, callback, streamOptions) {
        var that = this;
        var state = {stopped: false};

        var publisher = {
            getStreamId: function getStreamId() {
                return streamId;
            },

            getStream: function getStream() {
                that._logger.debug('[%s] Unable to get stream on publisher of remote origin.', streamId);

                return null;
            },

            getStats: function getStats() {
                that._logger.debug('[%s] Unable to get stream stats on publisher of remote origin.', streamId);

                return null;
            },

            isActive: function isActive() {
                return !state.stopped;
            },

            hasEnded: function hasEnded() {
                return state.stopped;
            },

            stop: function stop(reason) {
                if (state.stopped) {
                    return;
                }

                that._protocol.destroyStream(streamId, reason || '', function (error, response) {
                    if (error) {
                        that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);

                        return;
                    } else if (response.status !== 'ok') {
                        that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);

                        return;
                    }

                    that._logger.info('[%s] destroyed stream', streamId);
                });

                state.stopped = true;
            },

            setPublisherEndedCallback: function setPublisherEndedCallback(callback) {
                if (typeof callback !== 'function') {
                    throw new Error('"callback" must be a function');
                }

                this.publisherEndedCallback = callback;
            },

            setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                if (typeof callback !== 'function') {
                    throw new Error('"callback" must be a function');
                }

                this.dataQualityChangedCallback = callback;
            },

            getOptions: function getOptions() {
                return streamOptions;
            },

            monitor: function monitor(options, callback) {
                if (typeof options !== 'object') {
                    throw new Error('"options" must be an object');
                }

                if (typeof callback !== 'function') {
                    throw new Error('"callback" must be a function');
                }
            }
        };

        that._publishers[streamId] = publisher;

        callback(publisher);
    }

    function createPublisherPeerConnection(peerConnectionConfig, mediaStream, streamId, offerSdp, streamTelemetry, callback, createOptions, streamOptions) {
        var that = this;
        var state = {
            failed: false,
            stopped: false
        };
        var hasCrypto = offerSdp.match(/a=crypto:/i);
        var hasDataChannel = offerSdp.match(/m=application /i);
        var peerConnection = new phenixRTC.RTCPeerConnection(peerConnectionConfig, {
            'optional': [
                {DtlsSrtpKeyAgreement: !hasCrypto}, {RtpDataChannels: hasDataChannel}
            ]
        });
        var remoteMediaStream = null;
        var onIceCandidateCallback = null;

        that._peerConnections[streamId] = peerConnection;

        peerConnection.addStream(mediaStream);

        if (phenixRTC.browser === 'Firefox' || phenixRTC.browser === 'Edge') {
            if (offerSdp.match(/(\nm=video)/g) && offerSdp.match(/(\nm=audio)/g)) {
                var firstSection = /(a=candidate)((.|\n)*)(?=m=)/g;

                offerSdp = offerSdp.replace(firstSection, offerSdp.match(firstSection) + 'a=end-of-candidates\n');
            }

            offerSdp += 'a=end-of-candidates';

            offerSdp = offerSdp.replace(/(\na=ice-options:trickle)/g, '');
        }

        var onFailure = function onFailure() {
            if (state.failed) {
                return;
            }

            state.failed = true;
            state.stopped = true;

            delete that._peerConnections[streamId];

            closePeerConnection.call(that, streamId, peerConnection, 'failure');

            callback.call(that, undefined, 'failed');
        };

        function onSetRemoteDescriptionSuccess() {
            that._logger.info('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                that._logger.info('Created answer [%s]', answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (error, response) {
                    if (error) {
                        that._logger.error('Failed to set answer description [%s]', error);

                        return onFailure();
                    } else if (response.status !== 'ok') {
                        that._logger.warn('Failed to set answer description, status [%s]', response.status);

                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        var bandwidthAttribute = /(b=AS:([0-9]*)[\n\r]*)/gi;
                        var video = /(mid:video)([\n\r]*)/gi;

                        that._logger.info('Set local description (answer)');

                        var limit = 0;
                        var bandwithAttribute = bandwidthAttribute.exec(offerSdp);

                        if (bandwithAttribute && bandwithAttribute.length >= 3) {
                            limit = bandwithAttribute[2] * 1000;
                        }

                        var publisher = {
                            getStreamId: function getStreamId() {
                                return streamId;
                            },

                            getStream: function getStream() {
                                return mediaStream;
                            },

                            isActive: function isActive() {
                                return !state.stopped;
                            },

                            hasEnded: function hasEnded() {
                                switch (peerConnection.iceConnectionState) {
                                case 'new':
                                case 'checking':
                                case 'connected':
                                case 'completed':
                                    return false;
                                case 'disconnected':
                                case 'failed':
                                case 'closed':
                                    return true;
                                default:
                                    return true;
                                }
                            },

                            stop: function stop(reason) {
                                if (state.stopped) {
                                    return;
                                }

                                closePeerConnection.call(that, streamId, peerConnection, 'closed');

                                that._protocol.destroyStream(streamId, reason || '', function (error, response) {
                                    if (error) {
                                        that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);

                                        return;
                                    } else if (response.status !== 'ok') {
                                        that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);

                                        return;
                                    }

                                    that._logger.info('[%s] destroyed stream', streamId);
                                });

                                state.stopped = true;
                            },

                            setPublisherEndedCallback: function setPublisherEndedCallback(callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.publisherEndedCallback = callback;
                            },

                            setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.dataQualityChangedCallback = callback;
                            },

                            limitBandwidth: function limitBandwidth(bandwidthLimit) {
                                if (phenixRTC.browser === 'Edge') {
                                    return that._logger.warn('Limit bandwidth not support on [%s]', phenixRTC.browser);
                                }

                                if (typeof bandwidthLimit !== 'number') {
                                    throw new Error('"bandwidthLimit" must be a number');
                                }

                                var newLimit = limit ? Math.min(bandwidthLimit, limit) : bandwidthLimit;
                                var remoteDescription = peerConnection.remoteDescription;

                                that._logger.info('Changing bandwidth limit to [%s]', newLimit);

                                var updatedSdp = remoteDescription.sdp.replace(bandwidthAttribute, '');

                                // Add new limit in kbps
                                updatedSdp = updatedSdp.replace(video, function (match, videoLine, lineEnding, offset, sdp) { // eslint-disable-line no-unused-vars
                                    return [videoLine, lineEnding, 'b=AS:', Math.ceil(newLimit / 1000), lineEnding].join('');
                                });

                                var updatedRemoteDescription = new phenixRTC.RTCSessionDescription({
                                    type: remoteDescription.type,
                                    sdp: updatedSdp
                                });

                                peerConnection.setRemoteDescription(updatedRemoteDescription);

                                return {
                                    dispose: function () {
                                        peerConnection.setRemoteDescription(remoteDescription);
                                    }
                                };
                            },

                            monitor: function monitor(options, callback) {
                                if (typeof options !== 'object') {
                                    throw new Error('"options" must be an object');
                                }

                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                var monitor = new PeerConnectionMonitor(streamId, peerConnection, that._logger);

                                options.direction = 'outbound';

                                monitor.start(options, function activeCallback() {
                                    return that._publishers[streamId] === publisher && !state.stopped;
                                }, function monitorCallback(reason) {
                                    that._logger.warn('[%s] Publisher triggered monitor condition for [%s]', streamId, reason);

                                    return callback(publisher, 'client-side-failure', reason);
                                });
                            },

                            setRemoteMediaStreamCallback: function setRemoteMediaStreamCallback(callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.remoteMediaStreamCallback = callback;

                                if (remoteMediaStream) {
                                    callback(publisher, remoteMediaStream);
                                }
                            },

                            getOptions: function getOptions() {
                                return streamOptions;
                            },

                            getStats: function getStats(callback) {
                                assert.isFunction(callback, 'callback');

                                if (!this._lastStats) {
                                    this._lastStats = {};
                                }

                                var that = this;

                                return phenixRTC.getStats(peerConnection, null, function (stats) {
                                    callback(convertPeerConnectionStats(stats, that._lastStats));
                                });
                            }
                        };

                        that._publishers[streamId] = publisher;

                        callback.call(that, publisher);
                    }

                    if (_.includes(response.options, 'ice-candidates')) {
                        onIceCandidateCallback = function (candidate) {
                            var candidates = [];
                            var options = [];

                            if (candidate) {
                                candidates.push(candidate);
                            } else {
                                options.push('completed');
                            }

                            that._protocol.addIceCandidates(streamId, candidates, options, function (error, response) {
                                if (error) {
                                    that._logger.error('Failed to add ICE candidate [%s]', error);

                                    return;
                                } else if (response.status !== 'ok') {
                                    that._logger.warn('Failed to add ICE candidate, status [%s]', response.status);

                                    return;
                                }

                                if (_.includes(response.options, 'cancel')) {
                                    onIceCandidateCallback = null;
                                }
                            });
                        };
                    }

                    var sessionDescription = new phenixRTC.RTCSessionDescription({
                        type: 'answer',
                        sdp: response.sessionDescription.sdp
                    });

                    peerConnection.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
                });
            }

            var mediaConstraints = {mandatory: {}};

            if (phenixRTC.browser === 'Chrome') {
                mediaConstraints.mandatory.OfferToReceiveVideo = createOptions.receiveVideo === true;
                mediaConstraints.mandatory.OfferToReceiveAudio = createOptions.receiveAudio === true;
            } else {
                mediaConstraints.mandatory.offerToReceiveVideo = createOptions.receiveVideo === true;
                mediaConstraints.mandatory.offerToReceiveAudio = createOptions.receiveAudio === true;
            }

            peerConnection.createAnswer(onCreateAnswerSuccess, onFailure, mediaConstraints);
        }

        setupStreamAddedListener.call(that, streamId, state, peerConnection, streamTelemetry, function (mediaStream) {
            var publisher = that._publishers[streamId];

            remoteMediaStream = mediaStream;

            if (publisher && publisher.remoteMediaStreamCallback) {
                publisher.remoteMediaStreamCallback(publisher, mediaStream);
            }
        }, createOptions);
        setupIceCandidateListener.call(that, streamId, peerConnection, function onIceCandidate(candidate) {
            if (onIceCandidateCallback) {
                onIceCandidateCallback(candidate);
            }
        });
        setupStateListener.call(that, streamId, peerConnection);

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({
            type: 'offer',
            sdp: offerSdp
        });

        peerConnection.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
    }

    function createViewerPeerConnection(peerConnectionConfig, streamId, offerSdp, streamTelemetry, callback, createOptions) {
        if (phenixRTC.browser === 'IE') {
            throw new Error('Subscribing in real-time not supported on IE without the PhenixP2P Plugin');
        }

        var that = this;
        var state = {
            failed: false,
            stopped: false
        };
        var hasCrypto = offerSdp.match(/a=crypto:/i);
        var hasDataChannel = offerSdp.match(/m=application /i);
        var peerConnection = new phenixRTC.RTCPeerConnection(peerConnectionConfig, {
            'optional': [
                {DtlsSrtpKeyAgreement: !hasCrypto}, {RtpDataChannels: hasDataChannel}
            ]
        });
        var onIceCandidateCallback = null;

        that._peerConnections[streamId] = peerConnection;

        if (phenixRTC.browser === 'Firefox' || phenixRTC.browser === 'Edge') {
            if (offerSdp.match(/(\nm=video)/g) && offerSdp.match(/(\nm=audio)/g)) {
                var firstSection = /(a=candidate)((.|\n)*)(?=m=)/g;

                offerSdp = offerSdp.replace(firstSection, offerSdp.match(firstSection) + 'a=end-of-candidates\n');
            }

            offerSdp += 'a=end-of-candidates';

            offerSdp = offerSdp.replace(/(\na=ice-options:trickle)/g, '');
        }

        var onFailure = function onFailure() {
            if (state.failed) {
                return;
            }

            state.failed = true;
            state.stopped = true;

            delete that._peerConnections[streamId];

            closePeerConnection.call(that, streamId, peerConnection, 'failure');

            callback.call(that, undefined, 'failed');
        };

        function onSetRemoteDescriptionSuccess() {
            that._logger.debug('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                that._logger.info('Created answer [%s]', answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (error, response) {
                    if (error) {
                        that._logger.error('Failed to set answer description [%s]', error);

                        return onFailure();
                    } else if (response.status !== 'ok') {
                        that._logger.warn('Failed to set answer description, status [%s]', response.status);

                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        that._logger.debug('Set local description (answer)');
                    }

                    if (_.includes(response.options, 'ice-candidates')) {
                        onIceCandidateCallback = function (candidate) {
                            var candidates = [];
                            var iceCandidatesOptions = [];

                            if (candidate) {
                                candidates.push(candidate);
                            } else {
                                iceCandidatesOptions.push('completed');
                            }

                            that._protocol.addIceCandidates(streamId, candidate, iceCandidatesOptions, function (error, response) {
                                if (error) {
                                    that._logger.error('Failed to add ICE candidate [%s]', error);

                                    return;
                                } else if (response.status !== 'ok') {
                                    that._logger.warn('Failed to add ICE candidate, status [%s]', response.status);

                                    return;
                                }

                                if (_.includes(response.options, 'cancel')) {
                                    onIceCandidateCallback = null;
                                }
                            });
                        };
                    }

                    var sessionDescription = new phenixRTC.RTCSessionDescription({
                        type: 'answer',
                        sdp: response.sessionDescription.sdp
                    });

                    peerConnection.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
                });
            }

            var mediaConstraints = {mandatory: {}};

            if (phenixRTC.browser === 'Chrome') {
                mediaConstraints.mandatory.OfferToReceiveVideo = createOptions.receiveVideo !== false;
                mediaConstraints.mandatory.OfferToReceiveAudio = createOptions.receiveAudio !== false;
            } else {
                mediaConstraints.mandatory.offerToReceiveVideo = createOptions.receiveVideo !== false;
                mediaConstraints.mandatory.offerToReceiveAudio = createOptions.receiveAudio !== false;
            }

            peerConnection.createAnswer(onCreateAnswerSuccess, onFailure, mediaConstraints);
        }

        setupStreamAddedListener.call(that, streamId, state, peerConnection, streamTelemetry, callback, createOptions);
        setupIceCandidateListener.call(that, streamId, peerConnection, function onIceCandidate(candidate) {
            if (onIceCandidateCallback) {
                onIceCandidateCallback(candidate);
            }
        });
        setupStateListener.call(that, streamId, peerConnection);

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({
            type: 'offer',
            sdp: offerSdp
        });

        peerConnection.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
    }

    function createLiveViewer(streamId, offerSdp, streamTelemetry, callback, options) {
        var that = this;

        var dashMatch = offerSdp.match(/a=x-playlist:([^\n]*[.]mpd\??[^\s]*)/m);
        var hlsMatch = offerSdp.match(/a=x-playlist:([^\n]*[.]m3u8)/m);

        if (dashMatch && dashMatch.length === 2 && that._shaka && that._shaka.Player.isBrowserSupported()) {
            options.isDrmProtectedContent = /[?&]drmToken=([^&]*)/.test(dashMatch[1]) || /x-widevine-service-certificate/.test(offerSdp);

            if (options.isDrmProtectedContent) {
                options.widevineServiceCertificateUrl = offerSdp.match(/a=x-widevine-service-certificate:([^\n][^\s]*)/m)[1];
            }

            return createShakaLiveViewer.call(that, streamId, dashMatch[1], streamTelemetry, callback, options);
        } else if (hlsMatch && hlsMatch.length === 2 && document.createElement('video').canPlayType('application/vnd.apple.mpegURL') === 'maybe') {
            return createHlsLiveViewer.call(that, streamId, hlsMatch[1], streamTelemetry, callback, options);
        }

        that._logger.warn('[%s] Offer does not contain a supported manifest', streamId, offerSdp);

        return callback.call(that, undefined, 'failed');
    }

    function createShakaLiveViewer(streamId, uri, streamTelemetry, callback, options) {
        var that = this;

        if (!that._shaka) {
            that._logger.warn('[%s] Shaka player not available', streamId);

            return callback.call(that, undefined, 'live-player-missing');
        }

        if (!that._shaka.Player.isBrowserSupported()) {
            that._logger.warn('[%s] Shaka does not support this browser', streamId);

            return callback.call(that, undefined, 'browser-unsupported');
        }

        var shaka = that._shaka;
        var manifestUri = encodeURI(uri).replace(/[#]/g, '%23');

        var onPlayerError = function onPlayerError(event) {
            var mediaStream = internalMediaStream;

            if (!mediaStream.streamErrorCallback) {
                that._logger.error('[%s] DASH live stream error event [%s]', streamId, event.detail);
            } else {
                that._logger.debug('[%s] DASH live stream error event [%s]', streamId, event.detail);

                mediaStream.streamErrorCallback(mediaStream, 'shaka', event.detail);
            }
        };

        streamTelemetry.setProperty('kind', 'dash');

        var internalMediaStream = {
            renderer: null,
            isStreamEnded: false,
            isStopped: false,
            waitingForLastChunk: false,

            mediaStream: {
                createRenderer: function createRenderer() {
                    var player = null;
                    var element = null;
                    var dimensionsChangedMonitor = new DimensionsChangedMonitor(that._logger);
                    var lastProgress = {
                        time: 0,
                        buffered: null,
                        averageLength: 0,
                        count: 0
                    };

                    function onProgress() {
                        lastProgress.time = _.now();

                        if (element.buffered.length === 0) {
                            return that._logger.debug('[%s] Dash stream progress event fired without any buffered content', streamId);
                        }

                        var bufferedEnd = element.buffered.end(element.buffered.length - 1);

                        if (lastProgress.buffered === bufferedEnd) {
                            return;
                        }

                        // Start and end times are unreliable for overall length of stream.
                        if (lastProgress.buffered !== null) {
                            var oldTimeElapsed = lastProgress.averageLength * lastProgress.count;
                            var newTimeElapsed = oldTimeElapsed + (bufferedEnd - lastProgress.buffered);

                            lastProgress.count += 1;
                            lastProgress.averageLength = newTimeElapsed / lastProgress.count;
                        }

                        lastProgress.buffered = bufferedEnd;
                    }

                    function stalled() {
                        that._logger.info('[%s] Loading Dash stream stalled.', streamId);

                        if (lastProgress.time === 0) {
                            return;
                        }

                        setTimeout(function () {
                            if (_.now() - lastProgress.time > getTimeoutOrMinimum() && internalMediaStream.waitingForLastChunk) {
                                internalMediaStream.renderer.stop('ended');
                            }
                        }, getTimeoutOrMinimum());
                    }

                    function getTimeoutOrMinimum() {
                        return lastProgress.averageLength * 1.5 < 2000 ? 2000 : lastProgress.averageLength * 1.5;
                    }

                    function ended() {
                        that._logger.info('[%s] Dash stream ended.', streamId);
                    }

                    return {
                        start: function start(elementToAttachTo) {
                            player = new shaka.Player(elementToAttachTo);
                            internalMediaStream.renderer = this;

                            streamTelemetry.recordTimeToFirstFrame(elementToAttachTo);
                            streamTelemetry.recordRebuffering(elementToAttachTo);
                            streamTelemetry.recordVideoResolutionChanges(elementToAttachTo);

                            var playerConfig = {
                                abr: {defaultBandwidthEstimate: defaultBandwidthEstimateForPlayback},
                                manifest: {retryParameters: {timeout: 10000}},
                                streaming: {
                                    rebufferingGoal: 2,
                                    bufferingGoal: 10,
                                    bufferBehind: 30,
                                    retryParameters: {timeout: 10000}
                                }
                            };

                            if (options.isDrmProtectedContent) {
                                checkBrowserSupportForWidevineDRM.call(that);
                                unwrapLicenseResponse.call(that, player);
                                addDrmSpecificsToPlayerConfig.call(that, playerConfig, options, function (err, updatedPlayerConfig) {
                                    if (!err) {
                                        loadPlayer(updatedPlayerConfig);
                                    } else {
                                        that._logger.error('Failed to add DRM configuration to shaka player', err);

                                        throw err;
                                    }
                                });
                            } else {
                                loadPlayer(playerConfig);
                            }

                            function loadPlayer(config) {
                                player.configure(config);

                                if (options.receiveAudio === false) {
                                    elementToAttachTo.muted = true;
                                }

                                _.addEventListener(player, 'error', onPlayerError);

                                _.addEventListener(elementToAttachTo, 'stalled', stalled, false);
                                _.addEventListener(elementToAttachTo, 'pause', stalled, false);
                                _.addEventListener(elementToAttachTo, 'suspend', stalled, false);
                                _.addEventListener(elementToAttachTo, 'progress', onProgress, false);
                                _.addEventListener(elementToAttachTo, 'ended', ended, false);

                                player.load(manifestUri).then(function () {
                                    that._logger.info('[%s] DASH live stream has been loaded', streamId);

                                    if (_.isFunction(elementToAttachTo.play)) {
                                        elementToAttachTo.play();
                                    }
                                }).catch(function (e) {
                                    that._logger.error('[%s] Error while loading DASH live stream [%s]', streamId, e.code, e);

                                    internalMediaStream.streamErrorCallback('shaka', e);
                                });

                                dimensionsChangedMonitor.start(this, elementToAttachTo);
                                element = elementToAttachTo;
                            }

                            return elementToAttachTo;
                        },

                        stop: function stop() {
                            dimensionsChangedMonitor.stop();

                            streamTelemetry.stop();

                            if (player) {
                                var finalizeStreamEnded = function finalizeStreamEnded() {
                                    var reason = '';

                                    if (element) {
                                        _.removeEventListener(element, 'stalled', stalled, false);
                                        _.removeEventListener(element, 'pause', stalled, false);
                                        _.removeEventListener(element, 'suspend', stalled, false);
                                        _.removeEventListener(element, 'progress', onProgress, false);
                                        _.removeEventListener(element, 'ended', ended, false);

                                        if (phenixRTC.browser === 'Edge') {
                                            element.src = '';
                                        }
                                    }

                                    internalMediaStream.streamEndedCallback(getStreamEndedReason(reason), reason);

                                    player = null;
                                    element = null;
                                };

                                var destroy = player.destroy() // eslint-disable-line no-unused-vars
                                    .then(function () {
                                        that._logger.info('[%s] DASH live stream has been destroyed', streamId);
                                    }).then(function () {
                                        finalizeStreamEnded();
                                    }).catch(function (e) {
                                        that._logger.error('[%s] Error while destroying DASH live stream [%s]', streamId, e.code, e);

                                        finalizeStreamEnded();

                                        internalMediaStream.streamErrorCallback('shaka', e);
                                    });
                            }

                            internalMediaStream.renderer = null;
                        },

                        getStats: function getStats() {
                            if (!player) {
                                return {
                                    width: 0,
                                    height: 0,
                                    currentTime: 0.0,
                                    lag: 0.0,
                                    networkState: NetworkStates.NETWORK_NO_SOURCE
                                };
                            }

                            var stat = _.assign(player.getStats(), {
                                currentTime: 0,
                                lag: 0
                            });
                            var currentTime = _.get(element, ['currentTime'], 0);
                            var trueCurrentTime = (_.now() - options.originStartTime) / 1000;
                            var lag = Math.max(0.0, trueCurrentTime - currentTime);

                            if (element) {
                                stat.currentTime = currentTime;
                                stat.lag = lag;
                            }

                            if (stat.estimatedBandwidth > 0) {
                                stat.networkState = NetworkStates.NETWORK_LOADING;
                            } else if (stat.playTime > 0) {
                                stat.networkState = NetworkStates.NETWORK_IDLE;
                            } else if (stat.video) {
                                stat.networkState = NetworkStates.NETWORK_EMPTY;
                            } else {
                                stat.networkState = NetworkStates.NETWORK_NO_SOURCE;
                            }

                            return stat;
                        },

                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            this.dataQualityChangedCallback = callback;
                        },

                        getPlayer: function getPlayer() {
                            return player;
                        },

                        setVideoDisplayDimensionsChangedCallback: function setVideoDisplayDimensionsChangedCallback(callback, options) {
                            dimensionsChangedMonitor.setVideoDisplayDimensionsChangedCallback(callback, options);
                        }
                    };
                },

                select: function select(trackSelectCallback) { // eslint-disable-line no-unused-vars
                    that._logger.warn('[%s] selection of tracks not supported for shaka live streams', streamId);

                    return this;
                },

                setStreamEndedCallback: function setStreamEndedCallback(callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamEndedCallback = callback;
                },

                setStreamErrorCallback: function setStreamErrorCallback(callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamErrorCallback = callback;
                },

                stop: function stop(reason) {
                    if (internalMediaStream.isStopped) {
                        return;
                    }

                    that._logger.info('[%s] stop media stream', streamId);

                    that._protocol.destroyStream(streamId, reason || '', function (error, response) {
                        if (error) {
                            that._logger.error('[%s] failed to destroy stream, [%s]', streamId, error);

                            return;
                        } else if (response.status !== 'ok') {
                            that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);

                            return;
                        }

                        that._logger.info('[%s] destroyed stream', streamId);
                    });

                    internalMediaStream.isStopped = true;
                },

                monitor: function monitor(options, callback) {
                    if (typeof options !== 'object') {
                        throw new Error('"options" must be an object');
                    }

                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }
                },

                getStream: function getStream() {
                    that._logger.debug('[%s] stream not available for shaka live streams', streamId);

                    return null;
                },

                isActive: function isActive() {
                    return !internalMediaStream.isStopped;
                },

                getStreamId: function getStreamId() {
                    return streamId;
                },

                getStats: function getStats() {
                    that._logger.debug('[%s] stats not available for shaka live streams', streamId);

                    return null;
                }
            },

            streamErrorCallback: function (status, reason) {
                var mediaStream = internalMediaStream.mediaStream;

                if (typeof mediaStream.streamErrorCallback === 'function') {
                    mediaStream.streamErrorCallback(mediaStream, status, reason);
                }
            },

            streamEndedCallback: function (status, reason, waitForLastChunk) {
                if (waitForLastChunk && !internalMediaStream.waitingForLastChunk && !internalMediaStream.isStopped) {
                    internalMediaStream.waitingForLastChunk = true;

                    return that._logger.info('[%s] Shaka stream ended. Waiting for end of content.');
                }

                if (internalMediaStream.isStreamEnded) {
                    return;
                }

                var mediaStream = internalMediaStream.mediaStream;

                internalMediaStream.isStreamEnded = true;

                if (typeof mediaStream.streamEndedCallback === 'function') {
                    mediaStream.streamEndedCallback(mediaStream, status, reason);
                }

                mediaStream.stop();

                if (internalMediaStream.renderer) {
                    internalMediaStream.renderer.stop();
                }
            },

            dataQualityChangedCallback: function (status, reason) {
                var renderer = internalMediaStream.renderer;

                if (!renderer) {
                    return;
                }

                if (typeof renderer.dataQualityChangedCallback === 'function') {
                    renderer.dataQualityChangedCallback(renderer, status, reason);
                }
            }
        };

        that._mediaStreams[streamId] = internalMediaStream;

        callback.call(that, internalMediaStream.mediaStream);
    }

    function checkBrowserSupportForWidevineDRM() {
        var error;

        if (!_.isFunction(Uint8Array)) {
            error = 'Uint8Array support required for DRM';
            this._logger.error(error);

            throw new Error(error);
        }

        if (!_.isFunction(window.atob)) {
            error = 'window.atob support required for DRM';
            this._logger.error(error);

            throw new Error(error);
        }
    }

    function unwrapLicenseResponse(player) {
        var that = this;

        player.getNetworkingEngine().registerResponseFilter(function (type, response) {
            // Only manipulate license responses:
            if (type.toString() === that._shaka.net.NetworkingEngine.RequestType.LICENSE.toString()) {
                var binaryResponseAsTypedArray = new Uint8Array(response.data);
                var responseAsString = String.fromCharCode.apply(null, binaryResponseAsTypedArray);
                var parsedResponse = JSON.parse(responseAsString);
                var base64License = parsedResponse.license;
                var decodedLicense = window.atob(base64License);

                response.data = new Uint8Array(decodedLicense.length);

                for (var i = 0; i < decodedLicense.length; ++i) {
                    response.data[i] = decodedLicense.charCodeAt(i);
                }

                if (parsedResponse.trackRestrictions) {
                    player.configure({restrictions: parsedResponse.trackRestrictions});
                }
            }
        });
    }

    function addDrmSpecificsToPlayerConfig(playerConfig, options, callback) {
        if (!playerConfig.drm) {
            playerConfig.drm = {};
        }

        if (!playerConfig.drm.advanced) {
            playerConfig.drm.advanced = {};
        }

        if (!playerConfig.manifest) {
            playerConfig.manifest = {};
        }

        if (!playerConfig.manifest.dash) {
            playerConfig.manifest.dash = {};
        }

        // Add browser specific DRM calls here
        // Currently we support Widevine only
        addWidevineConfigToPlayerConfig.call(this, playerConfig, options, callback);
    }

    function addWidevineConfigToPlayerConfig(playerConfig, options, callback) {
        playerConfig['manifest']['dash']['customScheme'] = function (element) {
            if (element.getAttribute('schemeIdUri') === 'com.phenixp2p.widevine') {
                return [{
                    keySystem: 'com.widevine.alpha',
                    licenseServerUri: decodeURIComponent(element.getAttribute('widevineLicenseServerUrl'))
                }];
            }
        };

        function addToPlayerconfig(error, serverCertificate) {
            if (error) {
                callback(error);

                return;
            }

            widevineServiceCertificate = serverCertificate; // Cache so that we can reuse

            playerConfig.drm.advanced['com.widevine.alpha'] = {serverCertificate: convertBinaryStringToUint8Array(serverCertificate)};

            callback(null, playerConfig);
        }

        if (widevineServiceCertificate) {
            addToPlayerconfig(null, widevineServiceCertificate);
        } else {
            http.get(options.widevineServiceCertificateUrl, {mimeType: 'text/plain; charset=x-user-defined'}, addToPlayerconfig);
        }
    }

    function convertBinaryStringToUint8Array(bStr) {
        var len = bStr.length;
        var u8Array = new Uint8Array(len); // eslint-disable-line no-undef

        for (var i = 0; i < len; i++) {
            u8Array[i] = bStr.charCodeAt(i);
        }

        return u8Array;
    }

    function createHlsLiveViewer(streamId, uri, streamTelemetry, callback, options) {
        var that = this;

        var manifestUri = encodeURI(uri).replace(/[#]/g, '%23');

        var onPlayerError = function onPlayerError(event, e) { // eslint-disable-line no-unused-vars
            var mediaStream = internalMediaStream.mediaStream;

            if (!mediaStream.streamErrorCallback) {
                that._logger.error('[%s] HLS live stream error event [%s]', streamId, event.detail);
            } else {
                that._logger.debug('[%s] HLS live stream error event [%s]', streamId, event.detail);
                mediaStream.streamErrorCallback(mediaStream, 'hls', event.detail);
            }
        };

        streamTelemetry.setProperty('kind', 'hls');

        var internalMediaStream = {
            renderer: null,
            isStreamEnded: false,
            isStopped: false,
            waitingForLastChunk: false,

            mediaStream: {
                createRenderer: function createRenderer() {
                    var element = null;
                    var bufferSizeHistory = [];
                    var dimensionsChangedMonitor = new DimensionsChangedMonitor(that._logger);
                    var lastProgress = {
                        time: 0,
                        buffered: null,
                        averageLength: 0,
                        count: 0,
                        setupRetry: 0
                    };

                    function onProgress() {
                        lastProgress.time = _.now();

                        if (element.buffered.length === 0) {
                            return that._logger.debug('[%s] Hls stream progress event fired without any buffered content', streamId);
                        }

                        var bufferedEnd = element.buffered.end(element.buffered.length - 1);

                        if (lastProgress.buffered === bufferedEnd) {
                            return;
                        }

                        // Start and end times are unreliable for overall length of stream.
                        if (lastProgress.buffered !== null) {
                            var oldTimeElapsed = lastProgress.averageLength * lastProgress.count;
                            var newTimeElapsed = oldTimeElapsed + (bufferedEnd - lastProgress.buffered);

                            lastProgress.count += 1;
                            lastProgress.averageLength = newTimeElapsed / lastProgress.count;
                        }

                        lastProgress.buffered = bufferedEnd;
                        lastProgress.setupRetry = 0;
                    }

                    function stalled() {
                        that._logger.info('[%s] Loading Hls stream stalled.', streamId);

                        if (lastProgress.setupRetry > numberOfTimesToRetryHlsStalledHlsStream) {
                            return that._logger.warn('[%s] Unable to recover from stalled Hls Stream.', streamId);
                        }

                        if (lastProgress.count === 0) {
                            lastProgress.setupRetry++;
                            reload();
                        } else {
                            setTimeout(function () {
                                if (lastProgress.count === 0) {
                                    lastProgress.setupRetry++;
                                    reload();
                                }
                            }, getTimeoutOrMinimum());

                            var streamEndedBeforeSetupTimeout = 5000;

                            setTimeout(endIfReady, streamEndedBeforeSetupTimeout);
                        }
                    }

                    function ended() {
                        that._logger.info('[%s] Hls stream ended', streamId);

                        if (internalMediaStream.renderer) {
                            internalMediaStream.renderer.stop('ended');
                        }
                    }

                    function waiting() {
                        that._logger.info('Time elapsed since last progress [%s]', _.now() - lastProgress.time);

                        setTimeout(endIfReady, getTimeoutOrMinimum());
                    }

                    function reload() {
                        that._logger.info('[%s] Attempting to reload Hls stream.', streamId);

                        element.pause();
                        element.src = '';
                        element.currentTime = 0;

                        element.src = manifestUri;
                        element.load();
                        element.play();
                    }

                    function getTimeoutOrMinimum() {
                        return lastProgress.averageLength * 1.5 < 2000 ? 2000 : lastProgress.averageLength * 1.5;
                    }

                    function endIfReady() {
                        if (_.now() - lastProgress.time > getTimeoutOrMinimum() && internalMediaStream.waitingForLastChunk && internalMediaStream.renderer) {
                            internalMediaStream.renderer.stop('ended');
                        }
                    }

                    return {
                        start: function start(elementToAttachTo) {
                            try {
                                phenixRTC.attachUriStream(elementToAttachTo, manifestUri);

                                if (options.receiveAudio === false) {
                                    elementToAttachTo.muted = true;
                                }

                                streamTelemetry.recordTimeToFirstFrame(elementToAttachTo);
                                streamTelemetry.recordRebuffering(elementToAttachTo);
                                streamTelemetry.recordVideoResolutionChanges(elementToAttachTo);

                                internalMediaStream.renderer = this;

                                _.addEventListener(elementToAttachTo, 'error', onPlayerError, true);
                                _.addEventListener(elementToAttachTo, 'stalled', stalled, false);
                                _.addEventListener(elementToAttachTo, 'pause', stalled, false);
                                _.addEventListener(elementToAttachTo, 'suspend', stalled, false);
                                _.addEventListener(elementToAttachTo, 'progress', onProgress, false);
                                _.addEventListener(elementToAttachTo, 'ended', ended, false);
                                _.addEventListener(elementToAttachTo, 'waiting', waiting, false);

                                element = elementToAttachTo;

                                dimensionsChangedMonitor.start(this, element);

                                return elementToAttachTo;
                            } catch (e) {
                                that._logger.error('[%s] Error while loading HLS live stream [%s]', streamId, e.code, e);

                                internalMediaStream.streamErrorCallback('hls', e);
                            }
                        },

                        stop: function stop() {
                            dimensionsChangedMonitor.stop();

                            streamTelemetry.stop();

                            if (element) {
                                var finalizeStreamEnded = function finalizeStreamEnded() {
                                    if (element) {
                                        _.removeEventListener(element, 'error', onPlayerError, true);
                                        _.removeEventListener(element, 'stalled', stalled, false);
                                        _.removeEventListener(element, 'pause', stalled, false);
                                        _.removeEventListener(element, 'suspend', stalled, false);
                                        _.removeEventListener(element, 'progress', onProgress, false);
                                        _.removeEventListener(element, 'ended', ended, false);
                                        _.removeEventListener(element, 'waiting', waiting, false);

                                        if (phenixRTC.browser === 'Safari' && phenixRTC.browserVersion >= 11) {
                                            element.setAttribute('src', '');
                                        } else {
                                            element.src = '';
                                        }

                                        element = null;
                                    }

                                    var reason = '';

                                    internalMediaStream.streamEndedCallback(getStreamEndedReason(reason), reason);
                                };

                                try {
                                    element.pause();

                                    that._logger.info('[%s] HLS live stream has been destroyed', streamId);

                                    finalizeStreamEnded();
                                } catch (e) {
                                    that._logger.error('[%s] Error while destroying HLS live stream [%s]', streamId, e.code, e);

                                    finalizeStreamEnded();

                                    internalMediaStream.streamErrorCallback('hls', e);
                                }
                            }

                            internalMediaStream.renderer = null;
                        },

                        getStats: function getStats() {
                            if (!element) {
                                return {
                                    width: 0,
                                    height: 0,
                                    currentTime: 0.0,
                                    lag: 0.0,
                                    networkState: NetworkStates.NETWORK_NO_SOURCE
                                };
                            }

                            var currentTime = element ? element.currentTime || 0.0 : 0.0;
                            var buffered = (element && element.buffered && element.buffered.length > 0) ? element.buffered.end(element.buffered.length - 1) : 0;
                            var currentBufferSize = Math.max(0, buffered - currentTime);

                            bufferSizeHistory.push(currentBufferSize);

                            if (bufferSizeHistory.length > 15) {
                                bufferSizeHistory.shift();
                            }

                            var estimatedBufferSize = 0.0;

                            for (var i = 0, len = bufferSizeHistory.length; i < len; i++) {
                                estimatedBufferSize = Math.max(estimatedBufferSize, bufferSizeHistory[i]);
                            }

                            var chunkDuration = 2.0; // TODO (sbi) Parse chunk duration from manifest
                            var trueCurrentTime = (_.now() - options.originStartTime) / 1000;
                            var lag = 2.0 * chunkDuration + estimatedBufferSize;
                            var estimatedCurrentTime = trueCurrentTime - lag;

                            return {
                                width: element.videoWidth || element.width,
                                height: element.videoHeight || element.height,
                                currentTime: estimatedCurrentTime,
                                originTime: trueCurrentTime,
                                lag: lag,
                                networkState: element.networkState
                            };
                        },

                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            this.dataQualityChangedCallback = callback;
                        },

                        setVideoDisplayDimensionsChangedCallback: function setVideoDisplayDimensionsChangedCallback(callback, options) {
                            dimensionsChangedMonitor.setVideoDisplayDimensionsChangedCallback(callback, options);
                        }
                    };
                },

                select: function select(trackSelectCallback) { // eslint-disable-line no-unused-vars
                    that._logger.warn('[%s] selection of tracks not supported for HLS live streams', streamId);

                    return this;
                },

                setStreamEndedCallback: function setStreamEndedCallback(callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamEndedCallback = callback;
                },

                setStreamErrorCallback: function setStreamErrorCallback(callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamErrorCallback = callback;
                },

                stop: function stop(reason) {
                    if (internalMediaStream.isStopped) {
                        return;
                    }

                    that._logger.info('[%s] stop media stream', streamId);

                    that._protocol.destroyStream(streamId, reason || '', function (error, response) {
                        if (error) {
                            that._logger.error('[%s] failed to destroy stream [%s]', streamId, error);

                            return;
                        } else if (response.status !== 'ok') {
                            that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);

                            return;
                        }

                        that._logger.info('[%s] destroyed stream', streamId);
                    });

                    internalMediaStream.isStopped = true;
                },

                monitor: function monitor(options, callback) {
                    if (typeof options !== 'object') {
                        throw new Error('"options" must be an object');
                    }

                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }
                },

                isActive: function isActive() {
                    return !internalMediaStream.isStopped;
                },

                getStreamId: function getStreamId() {
                    return streamId;
                },

                getStream: function getStream() {
                    that._logger.debug('[%s] stream not available for HLS live streams', streamId);

                    return null;
                },

                getStats: function getStats() {
                    that._logger.debug('[%s] stats not available for HLS live streams', streamId);

                    return null;
                }
            },

            streamErrorCallback: function (status, reason) {
                var mediaStream = internalMediaStream.mediaStream;

                if (typeof mediaStream.streamErrorCallback === 'function') {
                    mediaStream.streamErrorCallback(mediaStream, status, reason);
                }
            },

            streamEndedCallback: function (status, reason, waitForLastChunk) {
                if (waitForLastChunk && !internalMediaStream.waitingForLastChunk && !internalMediaStream.isStopped) {
                    internalMediaStream.waitingForLastChunk = true;

                    return that._logger.info('[%s] Hls stream ended. Waiting for end of content.');
                }

                if (internalMediaStream.isStreamEnded) {
                    return;
                }

                var mediaStream = internalMediaStream.mediaStream;

                internalMediaStream.isStreamEnded = true;

                if (typeof mediaStream.streamEndedCallback === 'function') {
                    mediaStream.streamEndedCallback(mediaStream, status, reason);
                }

                mediaStream.stop();

                if (internalMediaStream.renderer) {
                    internalMediaStream.renderer.stop();
                }
            },

            dataQualityChangedCallback: function (status, reason) {
                var renderer = internalMediaStream.renderer;

                if (!renderer) {
                    return;
                }

                if (typeof renderer.dataQualityChangedCallback === 'function') {
                    renderer.dataQualityChangedCallback(renderer, status, reason);
                }
            }
        };

        that._mediaStreams[streamId] = internalMediaStream;

        callback.call(that, internalMediaStream.mediaStream);
    }

    function transitionToStatus(newStatus, suppressCallback) {
        var oldStatus = this.getStatus();

        if (oldStatus !== newStatus) {
            this._observableStatus.setValue(newStatus);

            if (suppressCallback) {
                return;
            }

            switch (newStatus) {
            case 'connecting':
            case 'reconnecting':
            case 'reconnected':
                break;
            case 'offline':
                this._offlineCallback.call(this);

                break;
            case 'online':
                this._onlineCallback.call(this);

                break;
            default:
                break;
            }
        }
    }

    function addTracksToWebRTCStream(stream, tracks) {
        if (typeof stream !== 'object') {
            return;
        }

        if (typeof tracks !== 'object') {
            return;
        }

        if (tracks.constructor !== Array) {
            return;
        }

        for (var i = 0; i < tracks.length; i++) {
            stream.addTrack(tracks[i]);
        }
    }

    function stopWebRTCStream(stream) {
        if (stream && _.isFunction(stream.stop, 'stream.stop')) {
            stream.stop();
        }

        if (stream && _.isFunction(stream.getTracks, 'stream.getTracks')) {
            var tracks = stream.getTracks();

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];

                track.stop();
            }
        }
    }

    function isTrackStopped(track) {
        if (typeof track !== 'object') {
            throw new Error('Invalid track.');
        }

        return track.readyState === 'ended';
    }

    function closePeerConnection(streamId, peerConnection, reason) {
        if (peerConnection.signalingState !== 'closed' && !peerConnection.__closing) {
            this._logger.debug('[%s] close peer connection [%s]', streamId, reason);
            peerConnection.close();
            peerConnection.__closing = true;
        }
    }

    function convertPeerConnectionStats(stats, lastStats) {
        if (!stats) {
            return null;
        }

        var newStats = [];

        var convertStats = function convertStats(ssrc, mediaType, timestamp, bytesSent, bytesReceived) {
            if (ssrc) {
                if (!_.hasIndexOrKey(lastStats, ssrc)) {
                    lastStats[ssrc] = {timestamp: 0};
                }

                var timeDelta = parseFloat(timestamp) - lastStats[ssrc].timestamp;
                var up = calculateUploadRate(parseFloat(bytesSent), lastStats[ssrc].bytesSent, timeDelta);
                var down = calculateDownloadRate(parseFloat(bytesReceived), lastStats[ssrc].bytesReceived, timeDelta);

                lastStats[ssrc].bytesSent = parseFloat(bytesSent);
                lastStats[ssrc].bytesReceived = parseFloat(bytesReceived);
                lastStats[ssrc].timestamp = parseFloat(timestamp);

                newStats.push({
                    uploadRate: up,
                    downloadRate: down,
                    mediaType: mediaType,
                    ssrc: ssrc
                });
            }
        };

        if (_.isFunction(stats.result)) {
            _.forEach(stats.result(), function (statsReport) {
                if (statsReport.type === 'ssrc') {
                    var ssrc = statsReport.stat('ssrc');
                    var bytesSent = statsReport.stat('bytesSent');
                    var bytesReceived = statsReport.stat('bytesReceived');
                    var mediaType = statsReport.stat('mediaType');
                    var timestamp = statsReport.timestamp.getTime();

                    convertStats(ssrc, mediaType, timestamp, bytesSent, bytesReceived);
                }
            });
        } else if (_.isFunction(stats.values)) {
            _.forEach(Array.from(stats.values()), function (statsReport) {
                if (_.hasIndexOrKey(statsReport, 'ssrc')) {
                    if (!statsReport.ssrc || _.includes(statsReport.id, 'rtcp')) {
                        return;
                    }

                    convertStats(statsReport.ssrc, statsReport.mediaType, statsReport.timestamp, statsReport.bytesSent, statsReport.bytesReceived);
                }
            });
        } else {
            _.forEach(stats, function (statsReport) {
                if (_.hasIndexOrKey(statsReport, 'ssrc')) {
                    if (!statsReport.ssrc || _.includes(statsReport.id, 'rtcp')) {
                        return;
                    }

                    convertStats(statsReport.ssrc, statsReport.mediaType, statsReport.timestamp, statsReport.bytesSent, statsReport.bytesReceived);
                }
            });
        }

        return newStats;
    }

    function calculateUploadRate(bytesSent, prevBytesSent, timeDelta) {
        if (bytesSent) {
            var bytesSentBefore = prevBytesSent || 0;
            var bps = 8 * 1000 * (bytesSent - bytesSentBefore) / timeDelta;

            return Math.round(bps / 1000);
        }

        return 0;
    }

    function calculateDownloadRate(bytesReceived, prevBytesReceived, timeDelta) {
        if (bytesReceived) {
            var bytesReceivedBefore = prevBytesReceived || 0;
            var bps = 8 * 1000 * (bytesReceived - bytesReceivedBefore) / timeDelta;

            return Math.round(bps / 1000);
        }

        return 0;
    }

    function parseProtobufMessage(message) {
        if (!message) {
            return message;
        }

        var parsedMessage = _.isArray(message) ? [] : {};
        var processIndexOrKey = _.bind(removeNullValuesAndParseEnums, null, parsedMessage);

        if (_.isArray(message)) {
            _.forEach(message, processIndexOrKey);
        } else {
            _.forOwn(message, processIndexOrKey);
        }

        return parsedMessage;
    }

    function removeNullValuesAndParseEnums(parsedMessage, value, key) {
        if (value === null) {
            return;
        }

        if (_.isObject(value) || _.isArray(value)) {
            return parsedMessage[key] = parseProtobufMessage(value);
        }

        if (!_.isString(value) || !_.isString(key)) {
            return parsedMessage[key] = value;
        }

        var prefixedByKey = _.startsWith(value.toLowerCase(), key.toLowerCase());
        var valueParsedWithoutKey = prefixedByKey ? value.substring(key.length, value.length).toLowerCase() : value;

        parsedMessage[key] = valueParsedWithoutKey;
    }

    function applyVendorSpecificLogic(config) {
        if (phenixRTC.browser === 'Firefox') {
            removeTurnsServers(config);
        }

        return config;
    }

    function removeTurnsServers(config) {
        if (!config) {
            return config;
        }

        _.forEach(config.iceServers, function(server) {
            server.urls = _.filter(server.urls, function(url) {
                return !_.startsWith(url, 'turns');
            });
        });

        return config;
    }

    return PCast;
});