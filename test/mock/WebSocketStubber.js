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
    'sdk/LodashLight',
    'ByteBuffer',
    'sdk/MQProtocol'
], function (_, ByteBuffer, MQProtocol) {
    var webSocketClone = WebSocket;

    function WebSocketStubber() {
        this._mockWebSocket = null;
        this._mqProtocol = new MQProtocol({});
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

        if (this._mockWebSocket.onmessage) {
            this._mockWebSocket.onmessage({
                data: encodeMessage.call(this, {
                    type: type,
                    requestId: '10000'
                }, message, false)
            });
        }
    };

    WebSocketStubber.prototype.restore = function() {
        if (this._mockWebSocket) {
            this._mockWebSocket.send = sinon.stub();
            this._mockWebSocket.close = sinon.stub();
            this._mockWebSocket = null;
        }

        WebSocket = webSocketClone; // eslint-disable-line no-global-assign
    };

    WebSocketStubber.prototype.triggerOpen = function() {
        this._mockWebSocket.onopen();
    };

    function setupStubIfNoneExist() {
        var that = this;

        if (that._mockWebSocket) {
            return;
        }

        that._mockWebSocket = {
            readyState: 1,
            close: sinon.stub(),
            send: function(encodedMessage) {
                var response = decodeResponse.call(that, encodedMessage);
                var message = decodeMessage.call(that, encodedMessage);
                var handler = that._handlers[response.type] || that._defaultResponse;

                that._mockWebSocket.onmessage({data: encodeMessage.call(that, response, handler.message, true)});

                if (_.isFunction(handler.callback)) {
                    handler.callback(response, message);
                }
            }
        };

        WebSocket = function() { // eslint-disable-line no-global-assign
            return that._mockWebSocket;
        };
    }

    function decodeResponse(encodedMessage) {
        return this._mqProtocol.decode('mq.Request', ByteBuffer.wrap(encodedMessage, 'base64'));
    }

    function decodeMessage(encodedMessage) {
        var response = this._mqProtocol.decode('mq.Request', ByteBuffer.wrap(encodedMessage, 'base64'));

        return this._mqProtocol.decode(response.type, response.payload);
    }

    function encodeMessage(request, message, includeResponse) {
        var type = request.type + (includeResponse ? 'Response' : '');

        return this._mqProtocol.encode('mq.Response', {
            requestId: request.requestId,
            type: type,
            payload: this._mqProtocol.encode(type, message)
        }).toString('base64');
    }

    return WebSocketStubber;
});