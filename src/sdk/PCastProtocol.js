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
    './LodashLight',
    './assert',
    './observable/Observable',
    './MQProtocol',
    './ReconnectingWebSocket',
    'ByteBuffer',
    'phenix-rtc'
], function (_, assert, Observable, MQProtocol, ReconnectingWebSocket, ByteBuffer, phenixRTC) {
    'use strict';

    function PCastProtocol(uri, deviceId, version, logger) {
        if (typeof uri !== 'string') {
            throw new Error('Must pass a valid "uri"');
        }
        if (typeof deviceId !== 'string') {
            throw new Error('Must pass a valid "deviceId"');
        }
        if (typeof version !== 'string') {
            throw new Error('Must pass a valid "version"');
        }
        if (typeof logger !== 'object') {
            throw new Error('Must pass a valid "logger"');
        }
        this._uri = uri;
        this._deviceId = deviceId;
        this._version = version;
        this._logger = logger;
        this._mqProtocol = new MQProtocol(this._logger);
        this._observableSessionId = new Observable(null);

        this._logger.info('Connecting to [%s]', uri);

        this._nextRequestId = 0;
        this._events = {};
        this._requests = {};

        this._webSocket = new ReconnectingWebSocket(this._uri, this._logger);

        this._webSocket.onmessage = _.bind(onMessage, this);
        this._webSocket.onconnected = _.bind(onConnected, this);
        this._webSocket.onreconnecting = _.bind(onReconnecting, this);
        this._webSocket.onreconnected = _.bind(onReconnected, this);
        this._webSocket.ondisconnected = _.bind(onDisconnected, this);
        this._webSocket.onerror = _.bind(onError, this);

    }

    PCastProtocol.prototype.on = function (eventName, handler) {
        if (typeof eventName !== 'string') {
            throw new Error('"eventName" must be a string');
        }
        if (typeof handler !== 'function') {
            throw new Error('"handler" must be a function');
        }

        var handlers = getEventHandlers.call(this, eventName);

        handlers.push(handler);

        return _.bind(removeEventHandler, this, eventName, handler);
    };

    PCastProtocol.prototype.disconnect = function () {
        this._observableSessionId.setValue(null);

        return this._webSocket.disconnect();
    };

    PCastProtocol.prototype.authenticate = function (authToken, callback) {
        if (typeof authToken !== 'string') {
            throw new Error('"authToken" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var authenticate = {
            apiVersion: this._mqProtocol.getApiVersion(),
            clientVersion: this._version,
            deviceId: this._deviceId,
            platform: phenixRTC.browser,
            platformVersion: phenixRTC.browserVersion.toString(),
            authenticationToken: authToken
        };

        if (this.getSessionId()) {
            authenticate.sessionId = this.getSessionId();
        }

        return sendRequest.call(this, 'pcast.Authenticate', authenticate, callback);
    };

    PCastProtocol.prototype.getSessionId = function () {
        return this._observableSessionId.getValue();
    };

    PCastProtocol.prototype.getObservableSessionId = function () {
        return this._observableSessionId;
    };

    PCastProtocol.prototype.bye = function (reason, callback) {
        if (typeof reason !== 'string') {
            throw new Error('"reason" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var bye = {
            sessionId: this.getSessionId(),
            reason: reason
        };

        return sendRequest.call(this, 'pcast.Bye', bye, callback);
    };

    PCastProtocol.prototype.setupStream = function (streamType, streamToken, options, callback) {
        if (typeof streamType !== 'string') {
            throw new Error('"streamType" must be a string');
        }
        if (typeof streamToken !== 'string') {
            throw new Error('"streamToken" must be a string');
        }
        if (typeof options !== 'object') {
            throw new Error('"options" must be an object');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var browser = phenixRTC.browser || 'UnknownBrowser';
        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
        var setupStream = {
            streamToken: streamToken,
            createStream: {
                sessionId: this.getSessionId(),
                options: ['data-quality-notifications'],
                connectUri: options.connectUri,
                connectOptions: options.connectOptions || [],
                tags: options.tags || []
            }
        };

        if (options.negotiate) {
            setupStream.createStream.createOfferDescription = {
                streamId: '',
                options: [streamType, browser, browserWithVersion],
                apiVersion: this._mqProtocol.getApiVersion()
            }
        }

        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
    };

    PCastProtocol.prototype.setAnswerDescription = function (streamId, sdp, callback) {
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

    PCastProtocol.prototype.addIceCandidates = function (streamId, candidates, options, callback) {
        if (typeof streamId !== 'string') {
            throw new Error('"streamId" must be a string');
        }
        if (!(candidates instanceof Array)) {
            throw new Error('"candidates" must be an array');
        }
        if (!(options instanceof Array)) {
            throw new Error('"options" must be an array');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var sanitizedCandidates = [];
        for (var i = 0; i < candidates.length; i++) {
            var candidate = candidates[i];

            if (typeof candidate.candidate !== 'string') {
                throw new Error('"candidates[' + i + '].candidate" must be a string');
            }
            if (typeof candidate.sdpMLineIndex !== 'number') {
                throw new Error('"candidates[' + i + '].sdpMLineIndex" must be a number');
            }
            if (typeof candidate.sdpMid !== 'string') {
                throw new Error('"candidates[' + i + '].sdpMid" must be a string');
            }

            sanitizedCandidates.push({
                candidate: candidate.candidate,
                sdpMLineIndex: candidate.sdpMLineIndex,
                sdpMid: candidate.sdpMid
            });
        }

        var addIceCandidates = {
            streamId: streamId,
            candidates: sanitizedCandidates,
            options: options,
            apiVersion: this._mqProtocol.getApiVersion()
        };

        return sendRequest.call(this, 'pcast.AddIceCandidates', addIceCandidates, callback);
    };

    PCastProtocol.prototype.updateStreamState = function (streamId, signalingState, iceGatheringState, iceConnectionState, callback) {
        if (typeof streamId !== 'string') {
            throw new Error('"streamId" must be a string');
        }
        if (typeof signalingState !== 'string') {
            throw new Error('"signalingState" must be a string');
        }
        if (typeof iceGatheringState !== 'string') {
            throw new Error('"iceGatheringState" must be a string');
        }
        if (typeof iceConnectionState !== 'string') {
            throw new Error('"iceConnectionState" must be a string');
        }
        if (typeof callback !== 'function') {
            throw new Error('"callback" must be a function');
        }

        var updateStreamState = {
            streamId: streamId,
            signalingState: signalingState,
            iceGatheringState: iceGatheringState,
            iceConnectionState: iceConnectionState,
            apiVersion: this._mqProtocol.getApiVersion()
        };

        return sendRequest.call(this, 'pcast.UpdateStreamState', updateStreamState, callback);
    };

    PCastProtocol.prototype.destroyStream = function (streamId, reason, callback) {
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

    PCastProtocol.prototype.getRoomInfo = function (roomId, alias, callback) {
        if (roomId) {
            assert.isString(roomId, 'roomId');
        } else {
            assert.isString(alias, 'alias');
        }
        assert.isFunction(callback, 'callback');

        var getRoomInfo = {
            roomId: roomId,
            alias: alias,
            sessionId: this.getSessionId()
        };

        return sendRequest.call(this, 'chat.GetRoomInfo', getRoomInfo, callback);
    };

    PCastProtocol.prototype.createRoom = function (roomName, type, description, callback) {
        assert.isString(roomName, 'roomName');
        assert.isString(type, 'type');
        assert.isString(description, 'description');
        assert.isFunction(callback, 'callback');

        var createRoom = {
            sessionId: this.getSessionId(),
            room: {
                name: roomName,
                description: description,
                type: type
            }
        };

        return sendRequest.call(this, 'chat.CreateRoom', createRoom, callback);
    };

    PCastProtocol.prototype.enterRoom = function (roomId, alias, member, timestamp, callback) {
        if (roomId) {
            assert.isString(roomId, 'roomId');
        } else {
            assert.isString(alias, 'alias');
        }
        assert.isObject(member, 'member');
        assert.isNumber(timestamp, 'timestamp');
        assert.isFunction(callback, 'callback');

        var joinRoom = {
            roomId: roomId,
            alias: alias,
            sessionId: this.getSessionId(),
            member: member,
            timestamp: timestamp
        };

        return sendRequest.call(this, 'chat.JoinRoom', joinRoom, callback);
    };

    PCastProtocol.prototype.leaveRoom = function (roomId, timestamp, callback) {
        assert.isString(roomId, 'roomId');
        assert.isNumber(timestamp, 'timestamp');
        assert.isFunction(callback, 'callback');

        var leaveRoom = {
            roomId: roomId,
            sessionId: this.getSessionId(),
            timestamp: timestamp
        };

        return sendRequest.call(this, 'chat.LeaveRoom', leaveRoom, callback);
    };

    PCastProtocol.prototype.updateMember = function (member, timestamp, callback) {
        assert.isObject(member, 'member');
        assert.isNumber(timestamp, 'timestamp');
        assert.isFunction(callback, 'callback');

        member.updateStreams = member.hasOwnProperty('streams');

        var updateMember = {
            sessionId: this.getSessionId(),
            member: member,
            timestamp: timestamp
        };

        return sendRequest.call(this, 'chat.UpdateMember', updateMember, callback);
    };

    PCastProtocol.prototype.updateRoom = function (room, timestamp, callback) {
        assert.isObject(room, 'room');
        assert.isNumber(timestamp, 'timestamp');
        assert.isFunction(callback, 'callback');

        var updateRoom = {
            sessionId: this.getSessionId(),
            room: room,
            timestamp: timestamp
        };

        return sendRequest.call(this, 'chat.UpdateRoom', updateRoom, callback);
    };

    PCastProtocol.prototype.sendMessageToRoom = function (roomId, chatMessage, callback) {
        assert.stringNotEmpty(roomId, 'roomId');
        assert.isObject(chatMessage, 'chatMessage');

        var sendMessage = {
            roomId: roomId,
            chatMessage: chatMessage
        };

        return sendRequest.call(this, 'chat.SendMessageToRoom', sendMessage, callback);
    };

    PCastProtocol.prototype.subscribeToRoomConversation = function (sessionId, roomId, batchSize, callback) {
        assert.stringNotEmpty(sessionId, 'sessionId');
        assert.stringNotEmpty(roomId, 'roomId');
        assert.isNumber(batchSize, 'batchSize');

        var fetchRoomConversation = {
            sessionId: sessionId,
            roomId: roomId,
            limit: batchSize,
            options: ['Subscribe']
        };

        return sendRequest.call(this, 'chat.FetchRoomConversation', fetchRoomConversation, callback);
    };

    PCastProtocol.prototype.getMessages = function (sessionId, roomId, batchSize, afterMessageId, beforeMessageId, callback) {
        assert.stringNotEmpty(sessionId, 'sessionId');
        assert.stringNotEmpty(roomId, 'roomId');

        if (!beforeMessageId || !afterMessageId) {
            assert.isNumber(batchSize, 'batchSize');
        }

        var fetchRoomConversation = {
            sessionId: sessionId,
            roomId: roomId,
            limit: batchSize || 0,
            options: []
        };

        if (beforeMessageId) {
            assert.stringNotEmpty(beforeMessageId, 'beforeMessageId');

            fetchRoomConversation.beforeMessageId = beforeMessageId;
        }

        if (afterMessageId) {
            assert.stringNotEmpty(afterMessageId, 'afterMessageId');

            fetchRoomConversation.afterMessageId = afterMessageId;
        }

        return sendRequest.call(this, 'chat.FetchRoomConversation', fetchRoomConversation, callback);
    };

    PCastProtocol.prototype.toString = function () {
        return 'PCastProtocol[' + this._webSocket.toString() + ']';
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

    function removeEventHandler(eventName, handler) {
        var handlers = this._events[eventName];

        _.remove(handlers, function removeHandler(currentHandler) {
            return currentHandler === handler;
        });

        this._events[eventName] = handlers;
    }

    function triggerEvent(eventName, args) {
        var handlers = this._events[eventName];

        if (handlers) {
            for (var i = 0; i < handlers.length; i++) {
                handlers[i].apply(this, args);
            }
        }
    }

    function onMessage(evt) {
        var response = this._mqProtocol.decode('mq.Response', ByteBuffer.wrap(evt.data, 'base64'));
        this._logger.info('>> [%s]', response.type);

        var message = this._mqProtocol.decode(response.type, response.payload);

        if (response.type === 'pcast.AuthenticateResponse') {
            this._observableSessionId.setValue(message.sessionId);
        } else if (response.type === 'pcast.StreamEnded') {
            triggerEvent.call(this, 'streamEnded', [message]);
        } else if (response.type === 'pcast.StreamDataQuality') {
            triggerEvent.call(this, 'dataQuality', [message]);
        } else if (response.type === 'chat.RoomEvent') {
            triggerEvent.call(this, 'roomEvent', [message]);
        } else if (response.type === 'chat.RoomConversationEvent') {
            triggerEvent.call(this, 'roomChatEvent', [message]);
        }

        var callback = this._requests[response.requestId];

        if (callback) {
            delete this._requests[response.requestId];

            if (response.type === 'mq.Error') {
                var error = message;

                callback(error, null);
            } else {
                callback(null, message);
            }
        }
    }

    function onReconnecting(evt) {
        triggerEvent.call(this, 'reconnecting');
    }

    function onConnected(evt) {
        triggerEvent.call(this, 'connected');
    }

    function onReconnected(evt) {
        triggerEvent.call(this, 'reconnected');
    }

    function onDisconnected(evt) {
        triggerEvent.call(this, 'disconnected', [evt.code, evt.reason]);
    }

    function onError(evt) {
        triggerEvent.call(this, 'error', [evt.data]);
    }

    return PCastProtocol;
});
