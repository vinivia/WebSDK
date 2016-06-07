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
        'iceServers': [{
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
        'optional': [{
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
        this._uri = optionalUri || 'wss://pcast-europe-west.phenixp2p.com/ws';
        this._status = 'offline';
    }

    PhenixPCast.prototype.getUri = function () {
        return this._uri;
    }

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
            throw new Error('"authenticationCallback" must be a function');
        }
        if (typeof offlineCallback !== 'function') {
            throw new Error('"authenticationCallback" must be a function');
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

        this._protocol = new PhenixProtocol(this._uri);

        this._protocol.on('connected', connected.bind(this));
        this._protocol.on('disconnected', disconnected.bind(this));
        this._protocol.on('streamEnded', streamEnded.bind(this));

        this._peerConnections = {};
        this._mediaStreams = {};
    };

    PhenixPCast.prototype.stop = function () {
        if (!this._started) {
            return;
        }
        this._stopped = true;
        this._started = false;
        this._protocol.disconnect();
        delete this._authenticationCallback;

        for (var streamId in this._peerConnections) {
            if (this._peerConnections.hasOwnProperty(streamId)) {
                this._peerConnections[streamId].close();
            }
        }

        this._peerConnections = {};
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

    function connected() {
        var that = this;

        this._connected = true;

        if (!this._stopped) {
            this._protocol.authenticate(this._authToken, function (result, error) {
                if (that._authenticationCallback) {
                    if (error) {
                        logError('Failed to authenticate: ' + JSON.stringify(error));
                        transitionToStatus.call(that, 'offline');
                        that._authenticationCallback.call(that, that, 'failed', '');
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

    function streamEnded(event) {
        var mediaStream = this._mediaStreams[event.streamId];

        if (mediaStream && typeof mediaStream.streamEnded === 'function') {
            mediaStream.streamEnded(event.reason);
        }

        delete this._mediaStreams[event.streamId];
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
                stop: function () {
                    pc.close();

                    that._protocol.destroyStream(streamId, "", function (value, error) {
                        if (error) {
                            logError('[' + streamId + '] failed to destroy stream');
                            return;
                        }

                        log('[' + streamId + '] destroyed stream');
                    });

                    delete that._peerConnections[streamId];
                },
                setStreamEndedCallback: function (callback) {
                    this.streamEnded = callback;
                },
                createRenderer: function () {
                    return {
                        start: function start(elementToAttachTo) {
                            return phenixRTC.attachMediaStream(elementToAttachTo, stream);
                        },
                        stop: function stop() {
                            // nop
                        }
                    }
                }
            };

            that._mediaStreams[streamId] = mediaStream;

            callback.call(that, mediaStream);
        };

        var onFailure = function onFailure() {
            callback.call(that, undefined, 'failed');
            delete that._peerConnections[streamId];
            pc.close();
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

        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});
        pc.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);

        pc.onicecandidate = function (event) {
            var candidate = event.candidate;

            if (candidate) {
                log('[' + streamId + '] ICE candidate (receiver): ' + candidate.sdpMid + ' ' + candidate.sdpMLineIndex + ' ' + candidate.candidate);
            } else {
                log('[' + streamId + '] ICE candidate discovery complete (receiver)');
            }
        };
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

    return PhenixPCast;
});
