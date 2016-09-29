/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
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
define('sdk/PhenixPCast', [
        'sdk/PCastProtocol',
        'sdk/PCastEndPoint',
        'sdk/PeerConnectionMonitor',
        'sdk/Time',
        'sdk/Logger',
        'phenix-rtc'
], function (PCastProtocol, PCastEndPoint, PeerConnectionMonitor, Time, Logger, phenixRTC) {
    'use strict';

    var peerConnectionConfig = {
        'iceServers': [
            {
                url: 'stun:stun.l.google.com:19302'
            }, {
                url: 'stun:stun1.l.google.com:19302'
            }, {
                url: 'stun:stun2.l.google.com:19302'
            }, {
                url: 'stun:stun3.l.google.com:19302'
            }, {
                url: 'stun:stun4.l.google.com:19302'
            }
        ]
    };
    var peerConnectionConstraints = {
        'optional': [
            {
                DtlsSrtpKeyAgreement: false
            }, {
                RtpDataChannels: false
            }
        ]
    };
    var sendingConstraints = {
        mandatory: {
            OfferToReceiveVideo: false,
            OfferToReceiveAudio: false
        }
    };
    var receivingConstraints = {
        mandatory: {
            OfferToReceiveVideo: true,
            OfferToReceiveAudio: true
        }
    };
    var sdkVersion = '%VERSION%';
    var defaultChromePCastScreenSharingExtensionId = 'icngjadgidcmifnehjcielbmiapkhjpn';
    var defaultFirefoxPCastScreenSharingAddOn = {
        url: 'https://addons.mozilla.org/firefox/downloads/file/474686/pcast_screen_sharing-1.0.3-an+fx.xpi',
        iconUrl: 'https://phenixp2p.com/public/images/phenix-logo-unicolor-64x64.png',
        hash: 'sha256:4972e9718ea7f7c896abc12d1a9e664d5f3efe498539b082ab7694f9d7af4f3b'
    };
    var firefoxInstallationCheckInterval = 100;
    var firefoxMaxInstallationChecks = 450;

    function PhenixPCast(options) {
        options = options || {};
        this._logger = options.logger || new Logger();
        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
        this._deviceId = options.deviceId || '';
        this._version = sdkVersion;
        this._endPoint = new PCastEndPoint(this._version, this._baseUri, this._logger);
        this._screenSharingExtensionId = options.screenSharingExtensionId || defaultChromePCastScreenSharingExtensionId;
        this._screenSharingAddOn = options.screenSharingAddOn || defaultFirefoxPCastScreenSharingAddOn;
        this._screenSharingEnabled = false;
        this._shaka = options.shaka || window.shaka;
        this._status = 'offline';

        if (phenixRTC.browser === 'Chrome' && this._screenSharingExtensionId) {
            addLinkHeaderElement.call(this);
        }

        phenixRTC.addEventListener(window, 'unload', function (pcast) {
            return function () {
                pcast.stop();
            }
        }(this));
    }

    PhenixPCast.prototype.getBaseUri = function () {
        return this._endPoint.getBaseUri();
    };

    PhenixPCast.prototype.getStatus = function () {
        return this._status;
    };

    PhenixPCast.prototype.start = function (authToken, authenticationCallback, onlineCallback, offlineCallback) {
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
        this._status = 'connecting';

        this._peerConnections = {};
        this._mediaStreams = {};
        this._renderer = {};
        this._publishers = {};
        this._gumStreams = [];

        var that = this;

        checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
            that._screenSharingEnabled = screenSharingEnabled;

            that._endPoint.resolveUri(function (err, uri) {
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

                that._logger.info('Discovered end point [%s]', uri);

                that._protocol = new PCastProtocol(uri, that._deviceId, that._version, that._logger);

                that._protocol.on('connected', connected.bind(that));
                that._protocol.on('disconnected', disconnected.bind(that));
                that._protocol.on('streamEnded', streamEnded.bind(that));
                that._protocol.on('dataQuality', dataQuality.bind(that));
            });
        });
    };

    PhenixPCast.prototype.stop = function () {
        if (!this._started) {
            return;
        }

        this._stopped = true;
        this._started = false;

        delete this._authenticationCallback;

        try {
            var reason = '';

            for (var streamId in this._mediaStreams) {
                if (this._mediaStreams.hasOwnProperty(streamId)) {
                    var mediaStream = this._mediaStreams[streamId];

                    endStream.call(this, streamId, reason);

                    mediaStream.stop(reason);
                }
            }

            for (var streamId in this._renderer) {
                if (this._renderer.hasOwnProperty(streamId)) {
                    var renderer = this._renderer[streamId];

                    renderer.stop(reason);
                }
            }

            for (var streamId in this._publishers) {
                if (this._publishers.hasOwnProperty(streamId)) {
                    var publisher = this._publishers[streamId];

                    endStream.call(this, streamId, reason);

                    publisher.stop(reason);
                }
            }

            for (var streamId in this._peerConnections) {
                if (this._peerConnections.hasOwnProperty(streamId)) {
                    endStream.call(this, streamId, reason);
                }
            }

            for (var i = 0; i < this._gumStreams.length; i++) {
                var tracks = this._gumStreams[i].getTracks();

                for (var j = 0; j < tracks.length; j++) {
                    tracks[j].stop();
                }
            }
        } finally {
            if (this._protocol) {
                this._protocol.disconnect();
            }
        }
    };

    PhenixPCast.prototype.getUserMedia = function (options, callback) {
        if (typeof options !== 'object') {
            throw new Error('"options" must be an object');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        return getUserMedia.call(this, options, callback);
    };

    PhenixPCast.prototype.publish = function (streamToken, mediaStreamToPublish, callback, tags) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof mediaStreamToPublish !== 'object') {
            throw new Error('"mediaStreamToPublish" must be an object');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }
        tags = tags || [];
        if (!Array.isArray(tags)) {
            throw new Error('"tags" must be an array');
        }

        var that = this;

        this._protocol.createUploader(streamToken, function (response, error) {
            if (error) {
                that._logger.warn('Failed to create uploader', error);

                switch (error.status) {
                    case 'capacity':
                        return callback.call(that, that, error.status);
                    default:
                        return callback.call(that, that, 'failed');
                }
            } else {
                var streamId = response.createStreamResponse.streamId;
                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;

                createPublisherPeerConnection.call(that, mediaStreamToPublish, streamId, offerSdp, function (phenixPublisher, error) {
                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixPublisher);
                    }
                });
            }
        })
    };

    PhenixPCast.prototype.subscribe = function (streamToken, callback) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var that = this;

        this._protocol.createDownloader(streamToken, function (response, error) {
            if (error) {
                that._logger.warn('Failed to create downloader', error);

                switch (error.status) {
                    case 'capacity':
                    case 'stream-ended':
                    case 'origin-stream-ended':
                    case 'streaming-not-available':
                        return callback.call(that, that, error.status);
                    default:
                        return callback.call(that, that, 'failed');
                }
            } else {
                var streamId = response.createStreamResponse.streamId;
                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;
                var create = createViewerPeerConnection;

                if (offerSdp.match(/a=x-playlist:/)) {
                    create = createLiveViewer;
                }

                return create.call(that, streamId, offerSdp, function (phenixMediaStream, error) {
                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixMediaStream);
                    }
                });
            }
        });
    };

    PhenixPCast.prototype.toString = function () {
        return 'PhenixPCast[' + this._sessionId + ',' + this._protocol.toString() + ']';
    };

    function checkForScreenSharingCapability(callback) {
        var that = this;

        if (phenixRTC.browser === 'Chrome' && that._screenSharingExtensionId) {
            try {
                chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'version'}, function (response) {
                    if (response && response.status === 'ok') {
                        that._logger.info('Screen sharing enabled using version [%s]', response.version);
                        callback(true);
                    } else {
                        that._logger.info('Screen sharing NOT available');
                        callback(false);
                    }
                });
            } catch (e) {
                if (e.message) {
                    that._logger.warn(e.message, e);
                }

                callback(false);
            }
        } else if (phenixRTC.browser === 'Firefox' && typeof window.PCastScreenSharing === 'object') {
            callback(true);
        } else {
            callback(false);
        }
    }

    function getChromeWebStoreLink() {
        return 'https://chrome.google.com/webstore/detail/' + this._screenSharingExtensionId;
    }

    function addLinkHeaderElement() {
        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

        var links = document.getElementsByTagName('link');

        for (var i = 0; i < links.length; i++) {
            if (links[i].href === chromeWebStoreUrl) {
                // Link already present
                return;
            }
        }

        this._logger.debug('Adding Chrome Web Store link [%s]', chromeWebStoreUrl);

        var link = document.createElement('link');

        link.rel = 'chrome-webstore-item';
        link.href = chromeWebStoreUrl;

        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function tryInstallChromeScreenSharingExtension(callback) {
        var that = this;
        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

        try {
            chrome.webstore.install(chromeWebStoreUrl, function successCallback() {
                return callback('ok');
            }, function failureCallback(reason) {
                if (reason) {
                    if (reason.match(/cancelled/ig)) {
                        that._logger.info('User cancelled screen sharing');

                        return callback('cancelled', new Error(reason));
                    }

                    that._logger.warn(reason);
                }

                return callback('failed', new Error(reason || 'failed'));
            });
        } catch (e) {
            if (e.message) {
                that._logger.warn(e.message);
            }

            callback('failed', e);
        }
    }

    function tryInstallFirefoxScreenSharingExtension(callback) {
        try {
            var params = {
                "PCast Screen Sharing": {
                    URL: this._screenSharingAddOn.url,
                    IconURL: this._screenSharingAddOn.iconUrl,
                    Hash: this._screenSharingAddOn.hash,
                    toString: function () {
                        return this.URL;
                    }
                }
            };
            var attemptsLeft = firefoxMaxInstallationChecks;
            var intervalId;
            var success = function success() {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                callback('ok');
            };
            var failure = function failure() {
                if (intervalId) {
                    clearInterval(intervalId);
                }
                callback('failed', new Error('failed'));
            };

            intervalId = setInterval(function () {
                if (typeof window.PCastScreenSharing === 'object') {
                    return success();
                }
                if (attemptsLeft-- < 0) {
                    return failure();
                }
            }, firefoxInstallationCheckInterval);

            InstallTrigger.install(params, function xpiInstallCallback(url, status) {
                // Callback only works for verified sites
                if (status === 0) {
                    success();
                } else {
                    failure();
                }
            });
        } catch (e) {
            if (e.message) {
                this._logger.warn(e.message);
            }

            callback('failed', e);
        }
    }

    function getScreenSharingConstraints(options, callback) {
        var that = this;

        switch (phenixRTC.browser) {
            case 'Chrome':
                try {
                    chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'get-desktop-media'}, function (response) {
                        if (response.status !== 'ok') {
                            return callback(response.status, undefined, new Error(response.status));
                        }

                        var constraints = {
                            video: {}
                        };

                        if (typeof options === 'object' && typeof options.screen === 'object') {
                            constraints.video = options.screen;
                        }

                        if (typeof constraints.video.mandatory !== 'object') {
                            constraints.video.mandatory = {};
                        }

                        constraints.video.mandatory.chromeMediaSource = 'desktop';
                        constraints.video.mandatory.chromeMediaSourceId = response.streamId;

                        callback('ok', constraints, undefined);
                    });
                } catch (e) {
                    if (e.message) {
                        that._logger.warn(e.message);
                    }

                    callback('failed', undefined, e);
                }
                break;
            case 'Firefox':
                var constraints = {
                    video: {}
                };

                if (typeof options === 'object' && typeof options.screen === 'object') {
                    constraints.video = options.screen;
                }

                constraints.video.mediaSource = 'window';

                callback('ok', constraints, undefined);
                break;
            default:
                callback('not-supported', undefined, new Error('not-supported'));
                break;
        }
    }

    function getUserMediaConstraints(options, callback) {
        var that = this;

        if (options.screen) {
            if (!that._screenSharingEnabled) {
                var installCallback = function installCallback(status) {
                    if (status === 'cancelled') {
                        return callback(status, 'cancelled');
                    }
                    if (status !== 'ok') {
                        return callback(status, undefined, new Error('screen-sharing-installation-failed'));
                    }

                    checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
                        that._screenSharingEnabled = screenSharingEnabled;

                        if (!that._screenSharingEnabled) {
                            return callback(status, undefined, new Error('screen-sharing-installation-failed'));
                        }

                        getScreenSharingConstraints.call(that, options, callback);
                    });
                };

                switch (phenixRTC.browser) {
                    case 'Chrome':
                        tryInstallChromeScreenSharingExtension.call(that, installCallback);
                        break;
                    case 'Firefox':
                        tryInstallFirefoxScreenSharingExtension.call(that, installCallback);
                        break;
                    default:
                        callback('not-supported', undefined, new Error('not-supported'));
                        break;
                }
            } else {
                getScreenSharingConstraints.call(that, options, callback);
            }
        } else {
            var constraints = {
                audio: options.audio || false,
                video: options.video || false
            };

            callback('ok', constraints, undefined);
        }
    }

    function getUserMedia(options, callback) {
        var that = this;

        var onUserMediaSuccess = function onUserMediaSuccess(stream) {
            that._gumStreams.push(stream);
            callback(that, 'ok', stream);
        };

        var onUserMediaCancelled = function onUserMediaCancelled() {
            callback(that, 'cancelled', null);
        };

        var onUserMediaFailure = function onUserMediaFailure(e) {
            if (e.code === 'unavailable') {
                callback(that, 'conflict', undefined, e);
            } else if (e.message === 'permission-denied') {
                callback(that, 'permission-denied', undefined, e);
            } else if (e.name === 'PermissionDeniedError') { // Chrome
                callback(that, 'permission-denied', undefined, e);
            } else if (e.name === 'InternalError' && e.message === 'Starting video failed') { // FF (old getUserMedia API)
                callback(that, 'conflict', undefined, e);
            } else if (e.name === 'SourceUnavailableError') { // FF
                callback(that, 'conflict', undefined, e);
            } else if (e.name === 'SecurityError' && e.message === 'The operation is insecure.') { // FF
                callback(that, 'permission-denied', undefined, e);
            } else {
                callback(that, 'failed', undefined, e);
            }
        };

        getUserMediaConstraints.call(that, options, function (status, constraints, error) {
            if (status === 'cancelled') {
                return onUserMediaCancelled();
            }

            if (status !== 'ok') {
                return onUserMediaFailure(error);
            }

            try {
                phenixRTC.getUserMedia(constraints, onUserMediaSuccess, onUserMediaFailure);
            } catch (e) {
                onUserMediaFailure(e);
            }
        });
    }

    function connected() {
        var that = this;

        this._connected = true;

        if (!that._stopped) {
            that._protocol.authenticate(that._authToken, function (result, error) {
                if (that._authenticationCallback) {
                    if (error) {
                        that._logger.warn('Failed to authenticate', error);
                        transitionToStatus.call(that, 'offline');
                        that._authenticationCallback.call(that, that, 'unauthorized', '');
                        that.stop('unauthorized');
                    } else {
                        transitionToStatus.call(that, 'online');
                        that._authenticationCallback.call(that, that, result.status, result.sessionId);
                    }
                }
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
            case 'not-ready':
            case 'error':
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

        var renderer = this._renderer[streamId];

        if (renderer && typeof renderer.dataQualityChangedCallback === 'function') {
            renderer.dataQualityChangedCallback(renderer, status, reason);
        }

        var publisher = this._publishers[streamId];

        if (publisher && typeof publisher.dataQualityChangedCallback === 'function') {
            publisher.dataQualityChangedCallback(publisher, status, reason);
        }
    }

    function endStream(streamId, reason) {
        this._logger.info('[%s] Stream ended with reason [%s]', streamId, reason);

        var mediaStream = this._mediaStreams[streamId];

        if (mediaStream && typeof mediaStream.streamEndedCallback === 'function') {
            mediaStream.streamEndedCallback(mediaStream, getStreamEndedReason(reason), reason);
        }

        delete this._mediaStreams[streamId];

        var renderer = this._renderer[streamId];

        if (renderer) {
            this._logger.info('[%s] stop media stream', streamId);
            mediaStream.stop();
        }

        delete this._renderer[streamId];

        var publisher = this._publishers[streamId];

        if (publisher && typeof publisher.publisherEndedCallback === 'function') {
            publisher.publisherEndedCallback(publisher, getStreamEndedReason(reason), reason);
        }

        delete this._publishers[streamId];

        var peerConnection = this._peerConnections[streamId];

        if (peerConnection && peerConnection.signalingState !== 'closed') {
            this._logger.info('[%s] close peer connection', streamId);
            peerConnection.close();
        }

        delete this._peerConnections[streamId];
    }

    function createPublisherPeerConnection(mediaStream, streamId, offerSdp, callback) {
        var that = this;
        var stopped = false;
        var failed = false;
        var pc = new phenixRTC.RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);

        that._peerConnections[streamId] = pc;

        pc.addStream(mediaStream);

        var onFailure = function onFailure() {
            if (failed) {
                return;
            }

            failed = true;
            stopped = true;

            delete that._peerConnections[streamId];

            if (pc.signalingState !== 'closed') {
                pc.close();
            }

            callback.call(that, undefined, 'failed');
        };

        function onSetRemoteDescriptionSuccess() {
            that._logger.info('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                that._logger.info('Created answer [%s]', answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
                    if (error) {
                        that._logger.warn('Failed to set answer description', error);
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

                            hasEnded: function hasEnded() {
                                switch (pc.iceConnectionState) {
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
                                if (pc.signalingState !== 'closed') {
                                    pc.close();
                                }

                                if (stopped) {
                                    return;
                                }

                                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                                    if (error) {
                                        that._logger.error('[%s] failed to destroy stream', streamId);
                                        return;
                                    }

                                    that._logger.info('[%s] destroyed stream', streamId);
                                });

                                stopped = true;
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
                                if (typeof bandwidthLimit !== 'number') {
                                    throw new Error('"bandwidthLimit" must be a number');
                                }

                                var newLimit = limit ? Math.min(bandwidthLimit, limit) : bandwidthLimit;
                                var remoteDescription = pc.remoteDescription;

                                that._logger.info('Changing bandwidth limit to [%s]', newLimit);

                                var updatedSdp = remoteDescription.sdp.replace(bandwidthAttribute, '');

                                // Add new limit in kbps
                                updatedSdp = updatedSdp.replace(video, function (match, videoLine, lineEnding, offset, sdp) {
                                    return [videoLine, lineEnding, 'b=AS:', Math.ceil(newLimit / 1000), lineEnding].join('');
                                });

                                var updatedRemoteDescription = new phenixRTC.RTCSessionDescription({
                                    type: remoteDescription.type,
                                    sdp: updatedSdp
                                });

                                pc.setRemoteDescription(updatedRemoteDescription);

                                return {
                                    dispose: function () {
                                        pc.setRemoteDescription(remoteDescription);
                                    }
                                }
                            },

                            monitor: function monitor(options, callback) {
                                if (typeof options !== 'object') {
                                    throw new Error('"options" must be an object');
                                }
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                var monitor = new PeerConnectionMonitor(streamId, pc, that._logger);

                                options.direction = 'outbound';

                                monitor.start(options, function activeCallback() {
                                    return that._publishers[streamId] === publisher;
                                }, function monitorCallback(reason) {
                                    that._logger.warn('[%s] Publisher triggered monitor condition for [%s]', streamId, reason);

                                    return callback(publisher, 'client-side-failure', reason);
                                });
                            }
                        };

                        that._publishers[streamId] = publisher;

                        callback.call(that, publisher);
                    }

                    var sessionDescription = new phenixRTC.RTCSessionDescription({
                        type: 'answer',
                        sdp: response.sessionDescription.sdp
                    });

                    pc.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
                });
            }

            pc.createAnswer(onCreateAnswerSuccess, onFailure, sendingConstraints);
        }

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

        pc.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);

        var onIceCandidate = function onIceCandidate(event) {
            var candidate = event.candidate;

            if (candidate) {
                that._logger.debug('[%s] ICE candidate (publisher): [%s] [%s] [%s]', streamId, candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
            } else {
                that._logger.info('[%s] ICE candidate discovery complete (publisher)', streamId);
            }
        };

        phenixRTC.addEventListener(pc, 'icecandidate', onIceCandidate);
    }

    function createViewerPeerConnection(streamId, offerSdp, callback) {
        var that = this;
        var failed = false;
        var stopped = false;
        var pc = new phenixRTC.RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);

        that._peerConnections[streamId] = pc;

        var onAddStream = function onAddStream(event) {
            if (failed) {
                return;
            }

            var stream = event.stream;

            if (!stream) {
                failed = true;
                that._logger.warn('[%s] No remote stream', streamId);

                return callback.call(that, undefined, 'failed');
            }

            that._logger.info('[%s] Got remote stream', streamId);

            var mediaStream = {
                createRenderer: function () {
                    return {
                        start: function start(elementToAttachTo) {
                            this.element = phenixRTC.attachMediaStream(elementToAttachTo, stream);

                            that._renderer[streamId] = this;

                            return this.element;
                        },
                        stop: function stop() {
                            if (this.element) {
                                this.element.pause();
                            }

                            delete that._renderer[streamId];
                        },
                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                            if (typeof callback !== 'function') {
                                throw new Error('"callback" must be a function');
                            }

                            this.dataQualityChangedCallback = callback;
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
                    if (pc.signalingState !== 'closed') {
                        pc.close();
                    }

                    var stream = event.stream;

                    stopWebRTCStream(stream);

                    if (stopped) {
                        return;
                    }

                    that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                        if (error) {
                            that._logger.error('[%s] failed to destroy stream', streamId);
                            return;
                        }

                        that._logger.info('[%s] destroyed stream', streamId);
                    });

                    stopped = true;
                },

                monitor: function monitor(options, callback) {
                    if (typeof options !== 'object') {
                        throw new Error('"options" must be an object');
                    }
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    var monitor = new PeerConnectionMonitor(streamId, pc, that._logger);

                    options.direction = 'inbound';

                    monitor.start(options, function activeCallback() {
                        return that._mediaStreams[streamId] === mediaStream;
                    }, function monitorCallback(reason) {
                        that._logger.warn('[%s] Media stream triggered monitor condition for [%s]', streamId, reason);

                        return callback(mediaStream, 'client-side-failure', reason);
                    });
                }
            };

            that._mediaStreams[streamId] = mediaStream;

            callback.call(that, mediaStream);
        };

        var onFailure = function onFailure() {
            if (failed) {
                return;
            }

            failed = true;
            delete that._peerConnections[streamId];

            if (pc.signalingState !== 'closed') {
                pc.close();
            }

            callback.call(that, undefined, 'failed');
        };

        phenixRTC.addEventListener(pc, 'addstream', onAddStream);

        function onSetRemoteDescriptionSuccess() {
            that._logger.debug('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                that._logger.info('Created answer [%s]', answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
                    if (error) {
                        that._logger.warn('Failed to set answer description', error);

                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        that._logger.debug('Set local description (answer)');
                    }

                    var sessionDescription = new phenixRTC.RTCSessionDescription({
                        type: 'answer',
                        sdp: response.sessionDescription.sdp
                    });

                    pc.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
                });
            }

            pc.createAnswer(onCreateAnswerSuccess, onFailure, receivingConstraints);
        }

        var onIceCandidate = function onIceCandidate(event) {
            var candidate = event.candidate;

            if (candidate) {
                that._logger.debug('[%s] ICE candidate (viewer): [%s] [%s] [%s]', streamId, candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
            } else {
                that._logger.info('[%s] ICE candidate discovery complete (viewer)', streamId);
            }
        };

        phenixRTC.addEventListener(pc, 'icecandidate', onIceCandidate);

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

        pc.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
    }

    function createLiveViewer(streamId, offerSdp, callback) {
        var that = this;

        if (!that._shaka) {
            that._logger.warn('[%s] No live player available, e.g. Shaka 2', streamId);

            return callback.call(that, undefined, 'live-player-missing');
        }

        if (!that._shaka.Player.isBrowserSupported()) {
            that._logger.warn('[%s] Shaka does not support this browser', streamId);

            return callback.call(that, undefined, 'browser-unsupported');
        }

        var match = offerSdp.match('a=x-playlist:([^\n]*[.]mpd)');

        if (!match || match.length < 2) {
            that._logger.warn('[%s] Offer does not contain a DASH manifest', streamId, offerSdp);

            return callback.call(that, undefined, 'failed');
        }

        var shaka = that._shaka;
        var manifestUri = encodeURI(match[1]).replace(/[#]/g, '%23');
        var stopped = false;

        var onPlayerError = function onPlayerError(event) {
            that._logger.error('[%s] Live stream error event [%s]', streamId, event.detail);

            if (mediaStream.streamErrorCallback) {
                mediaStream.streamErrorCallback(mediaStream, 'shaka', event.detail);
            }
        };

        var mediaStream = {
            createRenderer: function () {
                return {
                    start: function start(elementToAttachTo) {
                        this.player = new shaka.Player(elementToAttachTo);

                        that._renderer[streamId] = this;

                        this.player.addEventListener('error', onPlayerError);

                        var load = this.player.load(manifestUri).then(function () {
                            that._logger.info('[%s] Live stream has been loaded', streamId);
                        }).catch(function (e) {
                            that._logger.error('[%s] Error while loading live stream [%s]', streamId, e.code, e);

                            if (mediaStream.streamErrorCallback) {
                                mediaStream.streamErrorCallback(mediaStream, 'shaka', e.code, e);
                            }
                        });

                        return elementToAttachTo;
                    },
                    stop: function stop() {
                        if (this.player) {
                            var streamEndedTriggered = false;
                            var notifyStreamEnded = function notifyStreamEnded() {
                                if (!streamEndedTriggered && mediaStream.streamEndedCallback) {
                                    streamEndedTriggered = true;

                                    var reason = '';

                                    mediaStream.streamEndedCallback(mediaStream, getStreamEndedReason(reason), reason);
                                }
                            };

                            var destroy = this.player.destroy()
                                .then(function () {
                                    that._logger.info('[%s] Live stream has been destroyed', streamId);
                                }).then(function () {
                                    notifyStreamEnded();
                                }).catch(function (e) {
                                    that._logger.error('[%s] Error while destroying live stream [%s]', streamId, e.code, e);

                                    notifyStreamEnded();

                                    if (mediaStream.streamErrorCallback) {
                                        mediaStream.streamErrorCallback(mediaStream, 'shaka', e.code, e);
                                    }
                                });
                        }

                        delete that._renderer[streamId];
                    },
                    setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
                        if (typeof callback !== 'function') {
                            throw new Error('"callback" must be a function');
                        }

                        this.dataQualityChangedCallback = callback;
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
                if (stopped) {
                    return;
                }

                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                    if (error) {
                        that._logger.error('[%s] failed to destroy stream', streamId);
                        return;
                    }

                    that._logger.info('[%s] destroyed stream', streamId);
                });

                stopped = true;
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

        callback.call(that, mediaStream);
    }

    function transitionToStatus(newStatus) {
        if (this._status !== newStatus) {
            this._status = newStatus;

            switch (newStatus) {
                case 'connecting':
                    break;
                case 'offline':
                    this._offlineCallback.call(this);
                    break;
                case 'online':
                    this._onlineCallback.call(this);
                    break;
            }
        }
    }

    function stopWebRTCStream(stream) {
        if (stream && typeof stream.getTracks === 'function') {
            var tracks = stream.getTracks();

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];

                track.stop();
            }
        }
    }

    return PhenixPCast;
});
