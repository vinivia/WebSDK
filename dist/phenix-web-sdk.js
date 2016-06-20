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
define('sdk/MQProtocol', [
        'protobuf'
    ], function (ProtoBuf) {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

    var mqProto = '{"package":"mq","messages":[{"name":"Request","fields":[{"rule":"optional","type":"string","name":"sessionId","id":1},{"rule":"optional","type":"string","name":"requestId","id":2},{"rule":"required","type":"string","name":"type","id":3},{"rule":"optional","type":"string","name":"encoding","id":4},{"rule":"required","type":"bytes","name":"payload","id":5}]},{"name":"Response","fields":[{"rule":"optional","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"requestId","id":2},{"rule":"required","type":"string","name":"type","id":3},{"rule":"optional","type":"string","name":"encoding","id":4},{"rule":"required","type":"bytes","name":"payload","id":5},{"rule":"repeated","type":"double","name":"wallTime","id":6}]},{"name":"Error","fields":[{"rule":"required","type":"string","name":"reason","id":1}]},{"name":"PingPong","fields":[{"rule":"required","type":"uint64","name":"originTimestamp","id":1},{"rule":"optional","type":"uint64","name":"count","id":2}]}]}';
    var pcastProto = '{"package": "pcast","messages": [{"name": "Authenticate","fields": [{"rule": "optional","type": "uint32","name": "apiVersion","id": 9,"options": {"default": 0}},{"rule": "required","type": "string","name": "clientVersion","id": 1},{"rule": "required","type": "string","name": "deviceId","id": 2},{"rule": "required","type": "string","name": "platform","id": 3},{"rule": "required","type": "string","name": "platformVersion","id": 4},{"rule": "required","type": "string","name": "authenticationToken","id": 5},{"rule": "optional","type": "string","name": "connectionId","id": 6},{"rule": "optional","type": "string","name": "connectionRouteKey","id": 10},{"rule": "optional","type": "string","name": "sessionId","id": 7},{"rule": "optional","type": "string","name": "applicationId","id": 8}]},{"name": "AuthenticateResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "string","name": "sessionId","id": 2},{"rule": "optional","type": "string","name": "redirect","id": 3}]},{"name": "Bye","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1}]},{"name": "ByeResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1}]},{"name": "SessionDescription","fields": [{"rule": "required","type": "Type","name": "type","id": 1,"options": {"default": "Offer"}},{"rule": "required","type": "string","name": "sdp","id": 2}],"enums": [{"name": "Type","values": [{"name": "Offer","id": 0},{"name": "Answer","id": 1}]}]},{"name": "CreateStream","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1},{"rule": "optional","type": "string","name": "originStreamId","id": 2},{"rule": "repeated","type": "string","name": "options","id": 3},{"rule": "repeated","type": "string","name": "tags","id": 4},{"rule": "optional","type": "SetRemoteDescription","name": "setRemoteDescription","id": 5},{"rule": "optional","type": "CreateOfferDescription","name": "createOfferDescription","id": 6}]},{"name": "CreateStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "string","name": "streamId","id": 2},{"rule": "optional","type": "string","name": "instanceRouteKey","id": 5},{"rule": "optional","type": "SetRemoteDescriptionResponse","name": "setRemoteDescriptionResponse","id": 3},{"rule": "optional","type": "CreateOfferDescriptionResponse","name": "createOfferDescriptionResponse","id": 4}]},{"name": "SetRemoteDescription","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "required","type": "SessionDescription","name": "sessionDescription","id": 2},{"rule": "optional","type": "uint32","name": "apiVersion","id": 3,"options": {"default": 0}}]},{"name": "SetRemoteDescriptionResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "SessionDescription","name": "sessionDescription","id": 2}]},{"name": "CreateOfferDescription","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "repeated","type": "string","name": "options","id": 2},{"rule": "optional","type": "uint32","name": "apiVersion","id": 3,"options": {"default": 0}}]},{"name": "CreateOfferDescriptionResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "required","type": "SessionDescription","name": "sessionDescription","id": 2}]},{"name": "UpdateStreamState","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "required","type": "string","name": "signalingState","id": 2},{"rule": "required","type": "string","name": "iceGatheringState","id": 3},{"rule": "required","type": "string","name": "iceConnectionState","id": 4}]},{"name": "DestroyStream","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "optional","type": "string","name": "reason","id": 2}]},{"name": "DestroyStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1}]},{"name": "StreamStarted","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1},{"rule": "required","type": "string","name": "streamId","id": 2},{"rule": "repeated","type": "string","name": "tags","id": 3}]},{"name": "StreamEnded","fields": [{"rule": "required","type": "string","name": "sessionId","id": 1},{"rule": "required","type": "string","name": "streamId","id": 2},{"rule": "required","type": "string","name": "reason","id": 3}]},{"name": "SetupStream","fields": [{"rule": "required","type": "string","name": "streamToken","id": 1},{"rule": "required","type": "CreateStream","name": "createStream","id": 2}]},{"name": "SetupStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1},{"rule": "optional","type": "CreateStreamResponse","name": "createStreamResponse","id": 2}]},{"name": "EndStream","fields": [{"rule": "required","type": "string","name": "streamId","id": 1},{"rule": "optional","type": "string","name": "reason","id": 2,"options": {"default": "ended"}}]},{"name": "EndStreamResponse","fields": [{"rule": "required","type": "string","name": "status","id": 1}]}]}';

    function MQProtocol() {
        var builder = ProtoBuf.loadJson(mqProto);

        builder = ProtoBuf.loadJson(pcastProto, builder);

        this._builders = builder.build();
        this._apiVersion = 1;
    }

    MQProtocol.prototype.getApiVersion = function () {
        return this._apiVersion;
    };

    MQProtocol.prototype.encode = function (type, data) {
        if (typeof type !== 'string') {
            throw new Error("'type' must be a string");
        }
        if (typeof data !== 'object') {
            throw new Error("'data' must be an object");
        }

        var builder = getBuilder.call(this, type);

        return builder.encode(data);
    };

    MQProtocol.prototype.decode = function (type, value) {
        if (typeof type !== 'string') {
            throw new Error("'type' must be a string");
        }

        var builder = getBuilder.call(this, type);

        return builder.decode(value);
    };

    function getBuilder(type) {
        var fragments = type.split('.');
        var builder = this._builders;

        for (var i = 0; i < fragments.length - 1; i++) {
            builder = builder[fragments[i]];

            if (!builder) {
                throw new Error('Unsupported type "' + type + '"');
            }
        }

        builder = builder[fragments[fragments.length - 1]];

        if (typeof builder !== 'function') {
            throw new Error('Unsupported type "' + type + '"');
        }

        return builder;
    }

    return MQProtocol;
});

define('sdk/PhenixPCast', [
        'sdk/PhenixProtocol',
        'phenix-rtc'
    ], function (PhenixProtocol, phenixRTC) {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

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

    function PhenixPCast(optionalUri) {
        this._baseUri = optionalUri || 'https://pcast.phenixp2p.com';
        this._status = 'offline';
    }

    PhenixPCast.prototype.getBaseUri = function () {
        return this._baseUri;
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
        this._publishers = {};

        var that = this;

        resolveUri.call(that, that._baseUri, function (err, uri) {
            if (err) {
                logError('Failed to connect to ' + that._baseUri, err);

                transitionToStatus.call(that, 'offline');
                that._authenticationCallback.call(that, that, 'unauthorized', '');

                that._stopped = true;
                that._started = false;

                return;
            }

            log('Discovered end point "' + uri + '"');

            that._protocol = new PhenixProtocol(uri);

            that._protocol.on('connected', connected.bind(that));
            that._protocol.on('disconnected', disconnected.bind(that));
            that._protocol.on('streamEnded', streamEnded.bind(that));
        });
    };

    PhenixPCast.prototype.stop = function () {
        if (!this._started) {
            return;
        }

        this._stopped = true;
        this._started = false;

        if (this._protocol) {
            this._protocol.disconnect();
        }

        delete this._authenticationCallback;

        for (var streamId in this._peerConnections) {
            if (this._peerConnections.hasOwnProperty(streamId)) {
                var peerConnection = this._peerConnections[streamId];

                if (peerConnection.signalingState !== 'closed') {
                    peerConnection.close();
                }
            }
        }

        this._peerConnections = {};
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
                logError('Failed to create uploader: ' + JSON.stringify(error));
                callback.call(that, that, 'failed');
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
                logError('Failed to create downloader: ' + JSON.stringify(error));
                callback.call(that, that, 'failed');
            } else {
                var streamId = response.createStreamResponse.streamId;
                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;

                createViewerPeerConnection.call(that, streamId, offerSdp, function (phenixMediaStream, error) {
                    if (error) {
                        callback.call(that, that, 'failed', null);
                    } else {
                        callback.call(that, that, 'ok', phenixMediaStream);
                    }
                });
            }
        })
    };

    PhenixPCast.prototype.toString = function () {
        return 'PhenixPCast[' + this._sessionId + ',' + this._protocol.toString() + ']';
    };

    function getUserMedia(options, callback) {
        var that = this;

        var onUserMediaSuccess = function onUserMediaSuccess(stream) {
            callback(this, 'ok', stream);
        };

        var onUserMediaFailure = function onUserMediaFailure(e) {
            callback(this, 'failed', undefined, e);
        };

        phenixRTC.getUserMedia({
            audio: options.audio || false,
            video: options.video || false
        }, onUserMediaSuccess, onUserMediaFailure);
    }

    function connected() {
        var that = this;

        this._connected = true;

        if (!this._stopped) {
            this._protocol.authenticate(this._authToken, function (result, error) {
                if (that._authenticationCallback) {
                    if (error) {
                        logError('Failed to authenticate: ' + JSON.stringify(error));
                        transitionToStatus.call(that, 'offline');
                        that._authenticationCallback.call(that, that, 'unauthorized', '');
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
        var mediaStream = this._mediaStreams[event.streamId];

        if (mediaStream && typeof mediaStream.streamEnded === 'function') {
            mediaStream.streamEnded(mediaStream, getStreamEndedReason(event.reason), event.reason);
        }

        delete this._mediaStreams[event.streamId];

        var publisher = this._publishers[event.streamId];

        if (publisher && typeof publisher.publisherEndedCallback === 'function') {
            publisher.publisherEndedCallback(publisher, getStreamEndedReason(event.reason), event.reason);
        }

        delete this._publishers[event.streamId];

        var peerConnection = this._peerConnections[event.streamId];

        if (peerConnection && peerConnection.signalingState !== 'closed') {
            peerConnection.close();
        }

        delete this._peerConnections[event.streamId];
    }

    function createPublisherPeerConnection(mediaStream, streamId, offerSdp, callback) {
        var that = this;
        var failed = false;
        var pc = new phenixRTC.RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);

        that._peerConnections[streamId] = pc;

        pc.addStream(mediaStream);

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

        function onSetRemoteDescriptionSuccess() {
            log('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                log('Created answer: ' + answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
                    if (error) {
                        logError('Failed to set answer description: ' + JSON.stringify(error));
                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        log('Set local description (answer)');

                        var publisher = {
                            getStreamId: function () {
                                return streamId;
                            },

                            hasEnded: function () {
                                switch (pc.connectionState) {
                                    case 'new':
                                    case 'connecting':
                                    case 'connected':
                                        return false;
                                    case 'disconnected':
                                    case 'failed':
                                    case 'closed':
                                        return true;
                                    default:
                                        return true;
                                }
                            },

                            stop: function (reason) {
                                if (pc.signalingState !== 'closed') {
                                    pc.close();
                                }

                                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                                    if (error) {
                                        logError('[' + streamId + '] failed to destroy stream');
                                        return;
                                    }

                                    log('[' + streamId + '] destroyed stream');
                                });
                            },

                            setPublisherEndedCallback: function (callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.publisherEndedCallback = callback;
                            },

                            setDataQualityChangedCallback: function (callback) {
                                if (typeof callback !== 'function') {
                                    throw new Error('"callback" must be a function');
                                }

                                this.dataQualityChangedCallback = callback;
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
                log('[' + streamId + '] ICE candidate (publisher): ' + candidate.sdpMid + ' ' + candidate.sdpMLineIndex + ' ' + candidate.candidate);
            } else {
                log('[' + streamId + '] ICE candidate discovery complete (publisher)');
            }
        };

        phenixRTC.addEventListener(pc, 'icecandidate', onIceCandidate);
    }

    function createViewerPeerConnection(streamId, offerSdp, callback) {
        var that = this;
        var failed = false;
        var pc = new phenixRTC.RTCPeerConnection(peerConnectionConfig, peerConnectionConstraints);

        that._peerConnections[streamId] = pc;

        var onAddStream = function onAddStream(event) {
            if (failed) {
                return;
            }

            var stream = event.stream;

            console.log('Got a remote stream');

            var mediaStream = {
                createRenderer: function () {
                    return {
                        start: function start(elementToAttachTo) {
                            this.element = phenixRTC.attachMediaStream(elementToAttachTo, stream);

                            return this.element;
                        },
                        stop: function stop() {
                            if (this.element) {
                                this.element.pause();
                            }
                        }
                    }
                },
                setStreamEndedCallback: function (callback) {
                    if (typeof callback !== 'function') {
                        throw new Error('"callback" must be a function');
                    }

                    this.streamEnded = callback;
                },
                stop: function (reason) {
                    if (pc.signalingState !== 'closed') {
                        pc.close();
                    }

                    that._protocol.destroyStream(streamId, reason || '', function (value, error) {
                        if (error) {
                            logError('[' + streamId + '] failed to destroy stream');
                            return;
                        }

                        log('[' + streamId + '] destroyed stream');
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
            log('Set remote description (offer)');

            function onCreateAnswerSuccess(answerSdp) {
                log('Created answer: ' + answerSdp.sdp);

                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
                    if (error) {
                        logError('Failed to set answer description: ' + JSON.stringify(error));
                        return onFailure();
                    }

                    function onSetLocalDescriptionSuccess() {
                        log('Set local description (answer)');
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
                log('[' + streamId + '] ICE candidate (viewer): ' + candidate.sdpMid + ' ' + candidate.sdpMLineIndex + ' ' + candidate.candidate);
            } else {
                log('[' + streamId + '] ICE candidate discovery complete (viewer)');
            }
        };

        phenixRTC.addEventListener(pc, 'icecandidate', onIceCandidate);

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

        pc.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
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

    function resolveUri(baseUri, callback) {
        var that = this;

        if (baseUri.lastIndexOf('wss:', 0) === 0) {
            // WSS - Specific web socket end point
            callback.call(that, undefined, baseUri + '/ws');
        } else if (baseUri.lastIndexOf('https:', 0) === 0) {
            // HTTP - Resolve closest end point
            httpGetWithRetry(baseUri + '/pcast/endPoints', function (err, responseText) {
                if (err) {
                    callback(new Error('Failed to resolve an end point', err));
                    return callback(err);
                }

                var endPoints = responseText.split(',');

                if (endPoints.length < 1) {
                    callback(new Error('Failed to discover end points'));
                }

                var resolved = false;
                var pending = endPoints.length;

                for (var i = 0; i < endPoints.length; i++) {
                    var endPoint = endPoints[i];

                    log('Checking end Point "' + endPoint + '"');

                    httpGetWithRetry(endPoint, function (err, responseText) {
                        if (err) {
                            log('Failed to resolve endPoint "' + endPoint + '": ' + err);
                        } else {
                            if (!resolved) {
                                resolved = true;
                                callback(undefined, responseText);
                            }
                        }

                        pending--;

                        if (pending === 0 && !resolved) {
                            callback(new Error('Failed to resolve an end point'));
                        }
                    });
                }
            });
        } else {
            // Not supported
            callback.call(that, new Error('Uri not supported'));
        }
    }

    var maxAttempts = 3;

    function httpGetWithRetry(url, callback, attempt) {
        if (attempt === undefined) {
            attempt = 1;
        }

        var xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.addEventListener('readystatechange', function (e) {
            if (xhr.readyState === 4 /* DONE */) {
                if (xhr.status === 200) {
                    callback(undefined, xhr.responseText);
                } else if (xhr.status >= 500 && xhr.status < 600 && attempt <= maxAttempts) {
                    httpGetWithRetry(url, callback, attempt + 1);
                } else {
                    log('HTTP GET "' + url + '" failed with "' + xhr.status + '" "' + xhr.statusText + '"');
                }
            }
        });
        xhr.send();
    }

    return PhenixPCast;
});

define('sdk/PhenixProtocol', [
        'sdk/MQProtocol',
        'ByteBuffer',
        'phenix-rtc'
    ], function (MQProtocol, ByteBuffer, phenixRTC) {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

    function PhenixProtocol(uri) {
        this._uri = uri;
        this._mqProtocol = new MQProtocol();

        log('Connecting to ' + uri);
        this._webSocket = new WebSocket(uri);
        this._webSocket.onopen = onOpen.bind(this);
        this._webSocket.onclose = onClose.bind(this);
        this._webSocket.onmessage = onMessage.bind(this);
        this._webSocket.onerror = onError.bind(this);

        this._nextRequestId = 0;
        this._events = {};
        this._requests = {};
    }

    PhenixProtocol.prototype.on = function (eventName, handler) {
        if (typeof eventName !== 'string') {
            throw new Error('"eventName" must be a string');
        }
        if (typeof handler !== 'function') {
            throw new Error('"handler" must be a function');
        }

        var handlers = getEventHandlers.call(this, eventName);

        handlers.push(handler);
    };

    PhenixProtocol.prototype.authenticate = function (authToken, callback) {
        if (typeof authToken !== 'string') {
            throw new Error('"authToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var authenticate = {
            apiVersion: this._mqProtocol.getApiVersion(),
            clientVersion: '2016-06-20T16:24:03Z',
            deviceId: '',
            platform: phenixRTC.browser,
            platformVersion: phenixRTC.browserVersion.toString(),
            authenticationToken: authToken
        };

        if (this._sessionId) {
            auth.sessionId = this._sessionId;
        }

        return sendRequest.call(this, 'pcast.Authenticate', authenticate, callback);
    };

    PhenixProtocol.prototype.disconnect = function () {
        delete this._sessionId;

        return this._webSocket.close(1000, 'byebye');
    };

    PhenixProtocol.prototype.createDownloader = function (streamToken, callback) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var browser = phenixRTC.browser || 'UnknownBrowser';
        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
        var setupStream = {
            streamToken: streamToken,
            createStream: {
                sessionId: this._sessionId,
                createOfferDescription: {
                    streamId: '',
                    options: ['download', 'SRTP', browser, browserWithVersion],
                    apiVersion: this._mqProtocol.getApiVersion()
                }
            }
        };

        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
    };

    PhenixProtocol.prototype.createUploader = function (streamToken, callback) {
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var browser = phenixRTC.browser || 'UnknownBrowser';
        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
        var setupStream = {
            streamToken: streamToken,
            createStream: {
                sessionId: this._sessionId,
                createOfferDescription: {
                    streamId: '',
                    options: ['upload', 'SRTP', browser, browserWithVersion],
                    apiVersion: this._mqProtocol.getApiVersion()
                }
            }
        };

        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
    };

    PhenixProtocol.prototype.setAnswerDescription = function (streamId, sdp, callback) {
        if (typeof streamId !== 'string') {
            throw new Error('"streamId" must be a string');
        }
        if (typeof sdp !== 'string') {
            throw new Error('"sdp" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var setRemoteDescription = {
            streamId: streamId,
            sessionDescription: {
                type: 'Answer',
                sdp: sdp
            },
            apiVersion: this._mqProtocol.getApiVersion()
        };

        return sendRequest.call(this, 'pcast.SetRemoteDescription', setRemoteDescription, callback);
    };

    PhenixProtocol.prototype.destroyStream = function (streamId, reason, callback) {
        if (typeof streamId !== 'string') {
            throw new Error('"streamId" must be a string');
        }
        if (typeof reason !== 'string') {
            throw new Error('"reason" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var destroyStream = {
            streamId: streamId,
            reason: reason
        };

        return sendRequest.call(this, 'pcast.DestroyStream', destroyStream, callback);
    };

    PhenixProtocol.prototype.toString = function () {
        return 'PhenixProtocol[' + this._uri + ',' + this._webSocket.readyState + ']';
    };

    function sendRequest(type, message, callback) {
        var requestId = (this._nextRequestId++).toString();
        var request = {
            requestId: requestId,
            type: type,
            payload: this._mqProtocol.encode(type, message)
        };

        this._requests[requestId] = callback;

        return this._webSocket.send(this._mqProtocol.encode('mq.Request', request).toString('base64'));
    }

    function getEventHandlers(eventName) {
        var handlers = this._events[eventName];

        if (!handlers) {
            this._events[eventName] = handlers = [];
        }

        return handlers;
    }

    function triggerEvent(eventName, args) {
        var handlers = this._events[eventName];

        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(this, args);
            }
        }
    }

    function onOpen(evt) {
        log('Connected');
        triggerEvent.call(this, 'connected');
    }

    function onClose(evt) {
        log('Disconnected [' + evt.code + ']: ' + evt.reason);
        triggerEvent.call(this, 'disconnected', [evt.code, evt.reason]);
    }

    function onMessage(evt) {
        log('>> ' + evt.data);

        var response = this._mqProtocol.decode('mq.Response', ByteBuffer.wrap(evt.data, 'base64'));
        log('>> ' + response.type);

        var message = this._mqProtocol.decode(response.type, response.payload);

        if (response.type === 'pcast.AuthenticateResponse') {
            this._sessionId = message.sessionId;
        } else if (response.type === 'pcast.StreamEnded') {
            triggerEvent.call(this, 'streamEnded', [message]);
        }

        var callback = this._requests[response.requestId];

        if (callback) {
            delete this._requests[response.requestId];

            if (response.type === 'mq.Error' || message.status !== 'ok') {
                callback(undefined, message);
            } else {
                callback(message);
            }
        }
    }

    function onError(evt) {
        logError('Error: ' + evt.data);
    }

    return PhenixProtocol;
});

'use strict';

define('phenix-web-sdk', [
    'sdk/PhenixPCast'
], function (PhenixPCast) {
    window.PhenixPCast = PhenixPCast;

    return {
        PCast: PhenixPCast
    };
});
