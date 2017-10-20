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
    var mqWebSocketClone = proto.MQWebSocket;

    function WebSocketStubber() {
        this._mockMQWebSocket = null;
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

        this.stubResponse('pcast.Authenticate', {
            status: 'ok',
            sessionId: 'MockSessionId'
        }, callback);
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

    WebSocketStubber.prototype.stubResponseError = function(type, message, callback) {
        setupStubIfNoneExist.call(this);

        this._handlers[type] = {
            message: message,
            callback: callback,
            isError: true
        };
    };

    WebSocketStubber.prototype.stubEvent = function(type, message) {
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

    WebSocketStubber.prototype.getNumberOfListeners = function(eventName) {
        if (this._namedEvents) {
            return this._namedEvents.size(eventName);
        }

        return 0;
    };

    WebSocketStubber.prototype.restore = function() {
        if (this._mockMQWebSocket) {
            this._mockMQWebSocket.disconnect();
            this._mockMQWebSocket = null;
        }

        proto.MQWebSocket = mqWebSocketClone; // eslint-disable-line no-global-assign
    };

    function setupStubIfNoneExist() {
        var that = this;

        if (that._mockMQWebSocket) {
            return;
        }

        that._namedEvents = new event.NamedEvents();

        that._mockMQWebSocket = {
            disconnect: function() {
                that._namedEvents.dispose();
            },
            sendRequest: function(type, message, callback) {
                var handler = that._handlers[type] || that._defaultResponse;

                if (_.isFunction(handler.callback)) {
                    handler.callback(type, message, callback);
                }

                if (handler.isError) {
                    return callback(handler.message);
                }

                callback(null, handler.message);
            },
            onEvent: function(eventName, callback) {
                return that._namedEvents.listen(eventName, callback);
            },
            getApiVersion: function() {
                return 'version';
            }
        };

        proto.MQWebSocket = function() { // eslint-disable-line no-global-assign
            return that._mockMQWebSocket;
        };
    }

    return WebSocketStubber;
});