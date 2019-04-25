/**
 * Copyright 2019 Phenix Real Time Solutions Inc. All Rights Reserved.
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
    'phenix-rtc',
    './UserMediaStubber'
], function(_, phenixRTC, UserMediaStubber) {
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

        phenixRTC.RTCPeerConnection.restore();
        phenixRTC.RTCSessionDescription.restore();
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

                return listener({stream: UserMediaStubber.getMockMediaStream()});
            }
        };

        phenixRTC.RTCPeerConnection = phenixRTC.RTCPeerConnection || _.noop;

        sinon.stub(phenixRTC, 'RTCPeerConnection').callsFake(function() {
            return that._mockPeerConnection;
        });

        phenixRTC.RTCSessionDescription = phenixRTC.RTCSessionDescription || _.noop;

        sinon.stub(phenixRTC, 'RTCSessionDescription').callsFake(function(sessionDescription) {
            return sessionDescription;
        });
    }

    return PeerConnectionStubber;
});