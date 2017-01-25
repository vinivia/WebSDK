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
    '../LodashLight',
    '../assert',
    '../observable/Observable',
    '../Logger',
    '../authentication/AuthenticationService'
], function (_, assert, Observable, Logger, AuthenticationService) {
    'use strict';

    function ChatService(pcast) {
        assert.isObject(pcast, 'pcast');
        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

        this._pcast = pcast;
        this._logger = pcast.getLogger();
        this._protocol =  pcast.getProtocol();
        this._enabled = new Observable(false);

        assert.isObject(this._logger, 'this._logger');
        assert.isObject(this._protocol, 'this._protocol');

        this._authService = new AuthenticationService(this._pcast);
    };

    ChatService.prototype.start = function start() {
        if (this._enabled.getValue()) {
            return;
        }

        this._disposables = [];
        this._roomMessagesListeners = {};

        this._enabled.setValue(true);
        this._authService.start();
        setupSubscriptions.call(this);

        var disposeOfConversationHandler = this._protocol.on('roomChatEvent', _.bind(onRoomConversationEvent, this));

        this._disposables.push(disposeOfConversationHandler);
    };

    ChatService.prototype.stop = function stop() {
        if (!this._enabled.getValue()) {
            return;
        }

        this._authService.stop();

        disposeOfArray(this._disposables);
    };

    ChatService.prototype.getObservableChatEnabled = function getObservableChatEnabled() {
        return this._enabled;
    };

    ChatService.prototype.sendMessageToRoom = function sendMessageToRoom(roomId, screenName, role, lastUpdate, message) {
        sendMessageRequest.call(this, roomId, screenName, role, lastUpdate, message, _.bind(onSendMessageSuccess, this));
    };

    ChatService.prototype.subscribeAndLoadMessages = function subscribeAndLoadMessages(roomId, batchSize, onReceiveMessages) {
        var disposeOfListener = setupChatListener.call(this, roomId, onReceiveMessages);

        subscribeToRoomConversationRequest.call(this, roomId, batchSize,
            _.bind(onSubscribeToRoomConversationSuccess, this, roomId)
        );

        return disposeOfListener;
    };

    ChatService.prototype.getMessages = function getMessages(roomId, batchSize, afterMessageId, beforeMessageId, onReceiveMessages) {
        getMessagesRequest.call(this, roomId, batchSize, afterMessageId, beforeMessageId, onReceiveMessages);
    };

    ChatService.prototype.toString = function toString() {
        return 'ChatService';
    };

    function setupSubscriptions() {
        var pcastStatusSubscription = this._authService.getObservableStatus().subscribe(_.bind(onStatusChange, this));
        var pcastSessionIdSubscription = this._authService.getObservableSessionId().subscribe(_.bind(onSessionIdChange, this));

        this._disposables.push(pcastStatusSubscription.dispose);
        this._disposables.push(pcastSessionIdSubscription.dispose);
    }

    function setupChatListener(roomId, onReceiveMessages) {
        var that = this;

        this._roomMessagesListeners[roomId] = onReceiveMessages;

        var disposeOfHandler = function() {
            if (that._roomMessagesListeners[roomId] === onReceiveMessages) {
                delete that._roomMessagesListeners[roomId];
            }
        };

        this._disposables.push(disposeOfHandler);

        return disposeOfHandler;
    }

    function onSendMessageSuccess() {

    }

    function onSubscribeToRoomConversationSuccess(roomId, chatMessages) {
        var onReceiveMessages = this._roomMessagesListeners[roomId];

        onReceiveMessages(chatMessages);
    }

    function onRoomConversationEvent(event) {
        assert.isObject(event, 'event');
        assert.stringNotEmpty(event.roomId, 'event.roomId');
        assert.stringNotEmpty(event.eventType, 'event.eventType');
        assert.isArray(event.chatMessages, 'event.chatMessages');

        switch (event.eventType) {
            case 'Message':
                this._logger.debug('[%s] Room messages [%s]', event.roomId, event.chatMessages);
                var listener = this._roomMessagesListeners[event.roomId];

                convertTimeFromLongInChatMessages(event.chatMessages);

                if (listener) {
                    listener(event.chatMessages);
                }
                break;
            default:
                this._logger.warn('Unsupported room conversation event [%s]', event.eventType)
        }
    }

    function onStatusChange(status) {
        switch (status.toLowerCase()) {
            case 'offline':
                return;
            case 'online':
                return refreshMessageSubscriptions.call(this);
        }
    }

    function onSessionIdChange() {
        refreshMessageSubscriptions.call(this);
    }

    function refreshMessageSubscriptions() {
        var that = this;

        _.forOwn(this._roomMessagesListeners, function(listener, roomId) {
            subscribeToRoomConversationRequest.call(that, roomId, 1, listener);
        });
    }

    function getMessagesRequest(roomId, batchSize, afterMessageId, beforeMessageId, callback) {
        assert.stringNotEmpty(roomId, 'roomId');
        assert.isFunction(callback, 'callback');

        if (!beforeMessageId || !afterMessageId) {
            assert.isNumber(batchSize, 'batchSize');
        }

        if (beforeMessageId) {
            assert.stringNotEmpty(beforeMessageId, 'beforeMessageId');
        }

        if (afterMessageId) {
            assert.stringNotEmpty(afterMessageId, 'afterMessageId');
        }

        assertEnabled.call(this);
        this._authService.assertAuthorized();

        var sessionId = this._authService.getPCastSessionId();

        this._protocol.getMessages(sessionId, roomId, batchSize, afterMessageId, beforeMessageId,
            function (response) {
                if (response.status !== 'ok') {
                    throw new Error('Fetch of room conversation failed: ' + response.status);
                }

                convertTimeFromLongInChatMessages(response.chatMessages);

                callback(response.chatMessages);
            }
        );
    }

    function subscribeToRoomConversationRequest(roomId, batchSize, callback) {
        assert.stringNotEmpty(roomId, 'roomId');
        assert.isNumber(batchSize, 'batchSize');
        assert.isFunction(callback, 'callback');

        assertEnabled.call(this);
        this._authService.assertAuthorized();

        var sessionId = this._authService.getPCastSessionId();

        var that = this;

        this._protocol.subscribeToRoomConversation(sessionId, roomId, batchSize, function (response) {
            if (response.status !== 'ok') {
                delete that._roomMessagesListeners[roomId];

                throw new Error('Fetch of room conversation failed: ' + response.status);
            }

            convertTimeFromLongInChatMessages(response.chatMessages);

            callback(response.chatMessages);
        });
    }

    function sendMessageRequest(roomId, screenName, role, lastUpdate, message, callback) {
        assert.stringNotEmpty(roomId, 'roomId');
        assert.stringNotEmpty(screenName, 'screenName');
        assert.stringNotEmpty(role, 'role');
        assert.isNumber(lastUpdate, 'lastUpdate');
        assert.stringNotEmpty(message, 'message');

        assertEnabled.call(this);
        this._authService.assertAuthorized();

        var sessionId = this._authService.getPCastSessionId();

        var chatMessage = {
            messageId: '',
            timestamp: 0,
            from: {
                sessionId: sessionId,
                screenName: screenName,
                role: role,
                lastUpdate: lastUpdate
            },
            message: message
        };

        return this._protocol.sendMessageToRoom(roomId, chatMessage, callback);
    }

    function assertEnabled() {
        if (!this._enabled.getValue()) {
            throw new Error('ChatService not Enabled. Please start before performing actions.');
        }
    }

    function convertTimeFromLongInChatMessages(chatMessages) {
        _.forEach(chatMessages, function(chatMessage) {
            convertTimeFromLongInChatMessage(chatMessage);
        });
    }

    function convertTimeFromLongInChatMessage(chatMessage) {
        if (chatMessage.timestamp) {
            chatMessage.timestamp = _.utc(chatMessage.timestamp);
        }
        if (chatMessage.from) {
            chatMessage.from.lastUpdate = _.utc(chatMessage.from.lastUpdate);
        }
    }

    function disposeOfArray(arrayOfDisposables) {
        if (!_.isArray(arrayOfDisposables)) {
            return;
        }

        for (var i = 0; i < arrayOfDisposables.length; i++) {
            if (typeof arrayOfDisposables[i] === 'function') {
                arrayOfDisposables[i]();
            }
        }
    }

    return ChatService;
});
