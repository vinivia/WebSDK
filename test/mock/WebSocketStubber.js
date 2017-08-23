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
    'phenix-web-proto',
    'phenix-web-event'
], function (_, proto, event) {
    var webSocketProtoClone = proto.WebSocketProto;

    function WebSocketStubber() {
        this._mockWebProtoSocket = null;
        this._handlers = {};
        this._defaultResponse = {
            message: {status: 'ok'},
            callback: function() {}
        };
    }

    WebSocketStubber.prototype.stub = function(callback) {
        setupStubIfNoneExist.call(this);

        this._defaultResponse.callback = callback;
    };

    WebSocketStubber.prototype.stubAuthRequest = function(callback) {
        setupStubIfNoneExist.call(this);

        var that = this;

        this.stubResponse('pcast.Authenticate', {
            status: 'ok',
            sessionId: 'MockSessionId'
        }, function() {
            if (that._namedEvents) {
                that._namedEvents.fire('pcast.AuthenticateResponse', [{sessionId: 'MockSessionId'}]);
            }

            if (callback) {
                callback.apply(callback, arguments);
            }
        });
    };

    WebSocketStubber.prototype.stubSetupStream = function(callback) {
        this.stubResponse('pcast.SetupStream', {
            status: 'ok',
            createStreamResponse: {
                status: 'ok',
                streamId: 'mockStreamId',
                offset: 100,
                createOfferDescriptionResponse: {
                    status: 'ok',
                    sessionDescription: {sdp: 'mockSdp'}
                }
            }
        }, callback);

        this.stubResponse('pcast.SetRemoteDescription', {
            status: 'ok',
            sessionDescription: {sdp: 'mockSdp'}
        }, callback);
    };

    WebSocketStubber.prototype.stubResponse = function(type, message, callback) {
        setupStubIfNoneExist.call(this);

        this._handlers[type] = {
            message: message,
            callback: callback
        };
    };

    WebSocketStubber.prototype.stubMessage = function(type, message) {
        setupStubIfNoneExist.call(this);

        if (this._namedEvents) {
            this._namedEvents.fire(type, [message]);
        }
    };

    WebSocketStubber.prototype.triggerConnected = function() {
        if (this._namedEvents) {
            this._namedEvents.fire('connected');
        }
    };

    WebSocketStubber.prototype.restore = function() {
        if (this._mockWebProtoSocket) {
            this._mockWebProtoSocket.disconnect();
            this._mockWebProtoSocket = null;
        }

        proto.WebSocketProto = webSocketProtoClone; // eslint-disable-line no-global-assign
    };

    function setupStubIfNoneExist() {
        var that = this;

        if (that._mockWebProtoSocket) {
            return;
        }

        that._namedEvents = new event.NamedEvents();

        that._mockWebProtoSocket = {
            disconnect: function() {
                that._namedEvents.dispose();
            },
            sendRequest: function(type, message, callback) {
                var handler = that._handlers[type] || that._defaultResponse;

                if (_.isFunction(handler.callback)) {
                    handler.callback(type, message, callback);
                }

                callback(null, handler.message);
            },
            on: function(eventName, callback) {
                return that._namedEvents.listen(eventName, callback);
            },
            getApiVersion: function() {
                return 'version';
            }
        };

        proto.WebSocketProto = function() { // eslint-disable-line no-global-assign
            return that._mockWebProtoSocket;
        };
    }

    return WebSocketStubber;
});