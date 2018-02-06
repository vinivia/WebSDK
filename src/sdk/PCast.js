/**
 * Copyright 2018 Phenix Inc. All Rights Reserved.
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
    'phenix-web-disposable',
    './logging/pcastLoggerFactory',
    'phenix-web-http',
    './PCastProtocol',
    './PCastEndPoint',
    './userMedia/ScreenShareExtensionManager',
    './userMedia/UserMediaProvider',
    './PeerConnectionMonitor',
    './DimensionsChangedMonitor',
    './telemetry/metricsTransmitterFactory',
    './telemetry/StreamTelemetry',
    './telemetry/SessionTelemetry',
    './streaming/StreamWrapper',
    './streaming/PhenixLiveStream',
    './streaming/stream.json',
    'phenix-rtc',
    './sdpUtil'
], function(_, assert, observable, disposable, pcastLoggerFactory, http, PCastProtocol, PCastEndPoint, ScreenShareExtensionManager, UserMediaProvider, PeerConnectionMonitor, DimensionsChangedMonitor, metricsTransmitterFactory, StreamTelemetry, SessionTelemetry, StreamWrapper, PhenixLiveStream, streamEnums, phenixRTC, sdpUtil) {
    'use strict';

    var sdkVersion = '%SDKVERSION%';
    var defaultToHlsNative = true;

    function PCast(options) {
        options = options || {};

        assert.isObject(options, 'options');

        if (options.streamingSourceMapping) {
            assert.isObject(options.streamingSourceMapping, 'options.streamingSourceMapping');
            assert.isStringNotEmpty(options.streamingSourceMapping.replacement, 'options.streamingSourceMapping.replacement');

            if (!(options.streamingSourceMapping.patternToReplace instanceof RegExp)) {
                assert.isStringNotEmpty(options.streamingSourceMapping.patternToReplace, 'options.streamingSourceMapping.patternToReplace');
            }
        }

        if (!_.isNullOrUndefined(options.disableMultiplePCastInstanceWarning)) {
            assert.isBoolean(options.disableMultiplePCastInstanceWarning, 'options.disableMultiplePCastInstanceWarning');
        }

        this._observableStatus = new observable.Observable('offline');
        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
        this._deviceId = options.deviceId || '';
        this._version = sdkVersion;
        this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri, options.disableConsoleLogging);
        this._metricsTransmitter = options.metricsTransmitter || metricsTransmitterFactory.createMetricsTransmitter(this._baseUri);
        this._screenShareExtensionManager = new ScreenShareExtensionManager(options, this._logger);
        this._shaka = options.shaka;
        this._videojs = options.videojs || window.videojs;
        this._status = 'offline';
        this._streamingSourceMapping = options.streamingSourceMapping;
        this._disposables = new disposable.DisposableList();
        this._disableMultiplePCastInstanceWarning = options.disableMultiplePCastInstanceWarning;

        var that = this;

        _.addEventListener(window, 'unload', function() {
            that._logger.info('Window Unload Event Triggered');

            return that.stop();
        });

        if (!options.disableBeforeUnload) {
            _.addEventListener(window, 'beforeunload', function() {
                that._logger.info('Window Before Unload Event Triggered');

                return that.stop();
            });
        }

        if (phenixRTC.webrtcSupported) {
            setLocalH264Profile.call(this);
        }
    }

    PCast.prototype.getBaseUri = function() {
        return this._baseUri;
    };

    PCast.prototype.getStatus = function() {
        return this._observableStatus.getValue();
    };

    PCast.prototype.getObservableStatus = function() {
        return this._observableStatus;
    };

    PCast.prototype.start = function(authToken, authenticationCallback, onlineCallback, offlineCallback) {
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

        if (!_.isNumber(window.__phenixInstantiatedPCastCount)) {
            window.__phenixInstantiatedPCastCount = 1;
        } else {
            window.__phenixInstantiatedPCastCount++;
        }

        if (window.__phenixInstantiatedPCastCount > 1 && !this._disableMultiplePCastInstanceWarning) {
            this._logger.warn('Avoid using multiple instances of PCast as this uses unnecessary resources and will reduce performance. This is your [%s] simultaneous instance. Remember to dispose all resources when done with them by calling .stop() or .dispose()',
                window.__phenixInstantiatedPCastCount);
        }

        this._stopped = false;
        this._started = true;
        this._authToken = authToken;
        this._authenticationCallback = authenticationCallback;
        this._onlineCallback = onlineCallback;
        this._offlineCallback = offlineCallback;
        this._sessionTelemetry = new SessionTelemetry(this._logger, this._metricsTransmitter);
        this._endPoint = new PCastEndPoint(this._version, this._baseUri, this._logger, this._sessionTelemetry);

        transitionToStatus.call(this, 'connecting');

        this._peerConnections = {};
        this._mediaStreams = {};
        this._publishers = {};
        this._gumStreams = [];

        this._disposables.add(this._endPoint);
        this._disposables.add(this._sessionTelemetry);

        var that = this;

        that._endPoint.resolveUri(function(err, endPoint) {
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

    PCast.prototype.stop = function() {
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

            window.__phenixInstantiatedPCastCount--;

            this._disposables.dispose();
        }
    };

    PCast.prototype.getUserMedia = function(options, callback, onScreenShare) {
        if (phenixRTC.browser === 'IE') {
            throw new Error('Publishing not supported on IE');
        }

        assert.isObject(options, 'options');
        assert.isFunction(callback, 'callback');

        if (onScreenShare) {
            assert.isFunction(onScreenShare, 'onScreenShare');
        }

        var userMediaProvider = new UserMediaProvider(this._logger, this._screenShareExtensionManager, onScreenShare);

        return userMediaProvider.getUserMedia(options, callback);
    };

    PCast.prototype.publish = function(streamToken, streamToPublish, callback, tags, options) {
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

        this._protocol.setupStream(streamType, streamToken, setupStreamOptions, function(error, response) {
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

                    return createPublisherPeerConnection.call(that, peerConnectionConfig, streamToPublish, streamId, offerSdp, streamTelemetry, function(phenixPublisher, error) {
                        streamTelemetry.recordMetric('SetupCompleted', {string: error ? 'failed' : 'ok'});

                        if (error) {
                            callback.call(that, that, 'failed', null);
                        } else {
                            callback.call(that, that, 'ok', phenixPublisher);
                        }
                    }, options, response.createStreamResponse.options);
                }

                return createPublisher.call(that, streamId, function(phenixPublisher, error) {
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

    PCast.prototype.subscribe = function(streamToken, callback, options) {
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
        var createStreamOptions = _.assign({}, {useNativeHlsPlayer: defaultToHlsNative}, options);

        streamTelemetry.setProperty('resource', streamType);

        this._protocol.setupStream(streamType, streamToken, setupStreamOptions, function(error, response) {
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

                createStreamOptions.originStartTime = _.now() - response.createStreamResponse.offset + that._networkOneWayLatency;

                if (phenixRTC.browser === 'Chrome' && phenixRTC.browserVersion >= 62 && that._h264ProfileId && isMobile()) {
                    var profileLevelIdToReplace = sdpUtil.getH264ProfileId(offerSdp);

                    if (profileLevelIdToReplace !== that._h264ProfileId) {
                        that._logger.info('[%s] Replacing h264 profile level id [%s] with new value [%s] in offer sdp',
                            streamId, profileLevelIdToReplace, that._h264ProfileId);

                        offerSdp = sdpUtil.replaceH264ProfileId(offerSdp, that._h264ProfileId);
                    }
                }

                return create.call(that, streamId, offerSdp, streamTelemetry, function(phenixMediaStream, error) {
                    streamTelemetry.recordMetric('SetupCompleted', {string: error ? 'failed' : 'ok'});

                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixMediaStream);
                    }
                }, createStreamOptions);
            }
        });
    };

    PCast.prototype.getProtocol = function() {
        return this._protocol;
    };

    PCast.prototype.getLogger = function() {
        return this._logger;
    };

    PCast.prototype.toString = function() {
        var protocol = this.getProtocol();
        var sessionId = protocol ? protocol.getSessionId() : '';

        return 'PCast[' + sessionId || 'unauthenticated' + ',' + (protocol ? protocol.toString() : 'uninitialized') + ']';
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
            that._protocol.authenticate(that._authToken, function(error, response) {
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
            that._protocol.authenticate(that._authToken, function(error, response) {
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
                    monitor: null,
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
                                    streamTelemetry.recordVideoResolutionChanges(this, element);

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
                                            networkState: streamEnums.networkStates.networkNoSource.id
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

                                addVideoDisplayDimensionsChangedCallback: function addVideoDisplayDimensionsChangedCallback(callback, options) {
                                    dimensionsChangedMonitor.addVideoDisplayDimensionsChangedCallback(callback, options);
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

                            internalMediaStream.monitor = monitor;

                            return monitor;
                        },

                        getMonitor: function getMonitor() {
                            return internalMediaStream.monitor;
                        },

                        getStats: function getStats(callback) {
                            assert.isFunction(callback, 'callback');

                            if (!this._lastStats) {
                                this._lastStats = {};
                            }

                            var that = this;

                            return phenixRTC.getStats(peerConnection, null, function(stats) {
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

                    streamErrorCallback: function(errorSource, error) {
                        // Recursively calls all children error callbacks
                        for (var i = 0; i < internalMediaStream.children.length; i++) {
                            internalMediaStream.children[i].streamErrorCallback(errorSource, error);
                        }

                        var mediaStream = internalMediaStream.mediaStream;

                        if (typeof mediaStream.streamErrorCallback === 'function') {
                            mediaStream.streamErrorCallback(mediaStream, errorSource, error);
                        }
                    },

                    streamEndedCallback: function(status, reason) {
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

                    dataQualityChangedCallback: function(status, reason) {
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
                return isStreamStopped(masterStream);
            }

            function destroyMasterMediaStream(reason) {
                if (state.stopped) {
                    return;
                }

                that._logger.info('[%s] stop media stream', streamId);

                closePeerConnection.call(that, streamId, peerConnection, 'stop');

                that._protocol.destroyStream(streamId, reason || '', function(error, response) {
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

                that._protocol.destroyStream(streamId, reason || '', function(error, response) {
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
            },

            getMonitor: function getMonitor() {
                return null;
            }
        };

        that._publishers[streamId] = publisher;

        callback(publisher);
    }

    function setLocalH264Profile() {
        var that = this;
        var peerConnection = new phenixRTC.RTCPeerConnection();

        // TODO(DY) remove when updating to webrtc-adapter version 5.0.5 or greater
        if (phenixRTC.browser === 'Safari' && phenixRTC.browserVersion > 10) {
            peerConnection.addTransceiver('audio');
            peerConnection.addTransceiver('video');
        }

        peerConnection.createOffer(function(offer) {
            var h264ProfileId = sdpUtil.getH264ProfileId(offer.sdp);

            if (!h264ProfileId) {
                return that._logger.info('Unable to find local h264 profile level id');
            }

            that._logger.info('Found local h264 profile level id [%s]', h264ProfileId);

            that._h264ProfileId = h264ProfileId;
        }, function(e) {
            that._logger.error('Unable to create offer to get local h264 profile level id', e);
        }, {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
        });
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
        var publisherMonitor = null;

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

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function(error, response) {
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

                                that._protocol.destroyStream(streamId, reason || '', function(error, response) {
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
                                updatedSdp = updatedSdp.replace(video, function(match, videoLine, lineEnding, offset, sdp) { // eslint-disable-line no-unused-vars
                                    return [videoLine, lineEnding, 'b=AS:', Math.ceil(newLimit / 1000), lineEnding].join('');
                                });

                                var updatedRemoteDescription = new phenixRTC.RTCSessionDescription({
                                    type: remoteDescription.type,
                                    sdp: updatedSdp
                                });

                                peerConnection.setRemoteDescription(updatedRemoteDescription);

                                return {
                                    dispose: function() {
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

                                publisherMonitor = monitor;

                                return monitor;
                            },

                            getMonitor: function getMonitor() {
                                return publisherMonitor;
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

                                return phenixRTC.getStats(peerConnection, null, function(stats) {
                                    callback(convertPeerConnectionStats(stats, that._lastStats));
                                });
                            }
                        };

                        that._publishers[streamId] = publisher;

                        callback.call(that, publisher);
                    }

                    if (_.includes(response.options, 'ice-candidates')) {
                        onIceCandidateCallback = function(candidate) {
                            var candidates = [];
                            var options = [];

                            if (candidate) {
                                candidates.push(candidate);
                            } else {
                                options.push('completed');
                            }

                            that._protocol.addIceCandidates(streamId, candidates, options, function(error, response) {
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

        setupStreamAddedListener.call(that, streamId, state, peerConnection, streamTelemetry, function(mediaStream) {
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

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function(error, response) {
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
                        onIceCandidateCallback = function(candidate) {
                            var candidates = [];
                            var iceCandidatesOptions = [];

                            if (candidate) {
                                candidates.push(candidate);
                            } else {
                                iceCandidatesOptions.push('completed');
                            }

                            that._protocol.addIceCandidates(streamId, candidate, iceCandidatesOptions, function(error, response) {
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
        var hlsMatch = offerSdp.match(/a=x-playlist:([^\n]*[.]m3u8\??[^\s]*)/m);
        var manifestUrl = _.get(dashMatch, [1], '');
        var playlistUrl = _.get(hlsMatch, [1], '');

        if (this._streamingSourceMapping) {
            manifestUrl = manifestUrl.replace(this._streamingSourceMapping.patternToReplace, this._streamingSourceMapping.replacement);
            playlistUrl = playlistUrl.replace(this._streamingSourceMapping.patternToReplace, this._streamingSourceMapping.replacement);
        }

        var shouldPlayHls = isIOS() || phenixRTC.browser === 'Safari';

        if (dashMatch && dashMatch.length === 2 && !shouldPlayHls) {
            options.isDrmProtectedContent = /[?&]drmToken=([^&]*)/.test(dashMatch[1]) || /x-widevine-service-certificate/.test(offerSdp);

            if (options.isDrmProtectedContent) {
                options.widevineServiceCertificateUrl = offerSdp.match(/a=x-widevine-service-certificate:([^\n][^\s]*)/m)[1];
                options.playreadyLicenseUrl = offerSdp.match(/a=x-playready-license-url:([^\n][^\s]*)/m)[1];
            }

            if (this._shaka && !this._shaka.Player.isBrowserSupported()) {
                this._logger.warn('[%s] Shaka does not support this browser', streamId);

                return callback.call(this, undefined, 'browser-unsupported');
            }

            return createLiveViewerOfKind.call(that, streamId, manifestUrl, streamEnums.types.dash.name, streamTelemetry, callback, options);
        } else if (hlsMatch && hlsMatch.length === 2 && document.createElement('video').canPlayType('application/vnd.apple.mpegURL') === 'maybe') {
            options.isDrmProtectedContent = /[?&]drmToken=([^&]*)/.test(hlsMatch[1]);

            if (options.hlsTargetDuration) {
                assert.isNumber(options.hlsTargetDuration, 'options.hlsTargetDuration');

                playlistUrl = playlistUrl + (playlistUrl.indexOf('?') > -1 ? '&' : '?') + 'targetDuration=' + options.hlsTargetDuration;
            }

            return createLiveViewerOfKind.call(that, streamId, playlistUrl, streamEnums.types.hls.name, streamTelemetry, callback, options);
        }

        that._logger.warn('[%s] Offer does not contain a supported manifest', streamId, offerSdp);

        return callback.call(that, undefined, 'failed');
    }

    function createLiveViewerOfKind(streamId, uri, kind, streamTelemetry, callback, options) {
        var that = this;
        var liveStream = new PhenixLiveStream(kind, streamId, uri, streamTelemetry, options, this._shaka, this._logger);
        var liveStreamDecorator = new StreamWrapper(kind, liveStream, this._logger);
        var playerKind = this._shaka && kind === streamEnums.types.dash.name ? 'shaka' : kind;

        var onPlayerError = function onPlayerError(source, event) {
            that._logger.warn('Phenix Live Stream Player Error [%s] [%s]', source, event);

            liveStreamDecorator.streamErrorCallback(playerKind, event);
        };

        var onStop = function onStop(reason) {
            that._protocol.destroyStream(streamId, reason || '', function(error, response) {
                if (error) {
                    that._logger.error('[%s] failed to destroy stream, [%s]', streamId, error);

                    return;
                } else if (response.status !== 'ok') {
                    that._logger.warn('[%s] failed to destroy stream, status [%s]', streamId, response.status);

                    return;
                }
            });
        };

        streamTelemetry.setProperty('kind', kind);

        liveStreamDecorator.on(streamEnums.streamEvents.playerError.name, onPlayerError);
        liveStreamDecorator.on(streamEnums.streamEvents.stopped.name, onStop);

        this._mediaStreams[streamId] = liveStreamDecorator;

        callback.call(this, liveStreamDecorator.getPhenixMediaStream());
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

    function isStreamStopped(stream) {
        return _.reduce(stream.getTracks(), function(isStopped, track) {
            return isStopped && isTrackStopped(track);
        }, true);
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
            _.forEach(stats.result(), function(statsReport) {
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
            _.forEach(Array.from(stats.values()), function(statsReport) {
                if (_.hasIndexOrKey(statsReport, 'ssrc')) {
                    if (!statsReport.ssrc || _.includes(statsReport.id, 'rtcp')) {
                        return;
                    }

                    convertStats(statsReport.ssrc, statsReport.mediaType, statsReport.timestamp, statsReport.bytesSent, statsReport.bytesReceived);
                }
            });
        } else {
            _.forEach(stats, function(statsReport) {
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

    var isMobile = function() {
        var userAgent = window.navigator.userAgent;

        return isIOS() || /Android|webOS|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(userAgent);
    };

    var isIOS = function() {
        var userAgent = window.navigator.userAgent;

        return /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    };

    return PCast;
});