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
    'phenix-rtc'
], function (_, phenixRTC) {
    var peerConnectionClone = phenixRTC.RTCPeerConnection;
    var sessionDescriptionClone = phenixRTC.RTCSessionDescription;

    function PeerConnectionStubber() {
        this._mockPeerConnection = null;
        this._defaultResponse = {
            message: {status: 'ok'},
            callback: function() {}
        };
    }

    PeerConnectionStubber.prototype.stub = function(callback) {
        setupStubIfNoneExist.call(this);

        this._defaultResponse.callback = callback;
    };

    PeerConnectionStubber.prototype.restore = function() {
        if (this._mockPeerConnection) {
            this._mockPeerConnection = null;
        }

        phenixRTC.RTCPeerConnection = peerConnectionClone;
        phenixRTC.RTCSessionDescription = sessionDescriptionClone;
    };

    function setupStubIfNoneExist() {
        var that = this;

        if (that._mockPeerConnection) {
            return;
        }

        that._mockPeerConnection = {
            addStream: sinon.stub(),
            getStats: sinon.stub(),
            createOffer: sinon.stub(),
            close: sinon.stub(),
            createAnswer: function(onCreateAnswerSuccess, onFailure, mediaConstraints) { // eslint-disable-line no-unused-vars
                onCreateAnswerSuccess(that._mockPeerConnection._remoteDescription);
            },
            setRemoteDescription: function(sessionDescription, onSetRemoteDescriptionSuccess, onFailure) { // eslint-disable-line no-unused-vars
                that._mockPeerConnection._remoteDescription = sessionDescription;

                onSetRemoteDescriptionSuccess(sessionDescription);
            },
            setLocalDescription: function(sessionDescription, onSetLocalDescriptionSuccess, onFailure) { // eslint-disable-line no-unused-vars
                that._mockPeerConnection._localDescription = sessionDescription;

                onSetLocalDescriptionSuccess(sessionDescription);
            },
            addEventListener: function(name, listener) {
                if (name !== 'addstream' || !listener) {
                    return;
                }

                if (window.MediaStream) {
                    return listener({stream: new window.MediaStream()});
                }

                return listener({
                    stream: {
                        id: 'MockStreamId',
                        getTracks: function() {
                            return [];
                        },
                        getAudioTracks: function() {
                            return [];
                        },
                        getVideoTracks: function() {
                            return [];
                        }
                    }
                });
            }
        };

        phenixRTC.RTCPeerConnection = function() {
            return that._mockPeerConnection;
        };
        phenixRTC.RTCSessionDescription = function(sessionDescription) {
            return sessionDescription;
        };
    }

    return PeerConnectionStubber;
});