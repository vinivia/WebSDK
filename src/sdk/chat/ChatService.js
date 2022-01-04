/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
    'phenix-web-assert',
    'phenix-web-observable',
    'phenix-web-disposable',
    '../authentication/AuthenticationService'
], function(_, assert, observable, disposable, AuthenticationService) {
    'use strict';

    function ChatService(pcast) {
        assert.isObject(pcast, 'pcast');
        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

        this._pcast = pcast;
        this._logger = pcast.getLogger();
        this._protocol = pcast.getProtocol();
        this._enabled = new observable.Observable(false);

        assert.isObject(this._logger, 'this._logger');
        assert.isObject(this._protocol, 'this._protocol');

        this._authenticationService = new AuthenticationService(pcast);
    }

    ChatService.prototype.setPCast = function setPCast(pcast) {
        assert.isObject(pcast, 'pcast');
        assert.isFunction(pcast.getLogger, 'pcast.getLogger');
        assert.isFunction(pcast.getProtocol, 'pcast.getProtocol');

        this._pcast = pcast;
        this._logger = pcast.getLogger();
        this._protocol = pcast.getProtocol();

        this._authenticationService.setPCast(pcast);
    };

    ChatService.prototype.start = function start() {
        if (this._enabled.getValue()) {
            return;
        }

        this._disposables = new disposable.DisposableList();
        this._roomMessagesListeners = {};

        this._enabled.setValue(true);
        setupSubscriptions.call(this);

        var disposeOfConversationHandler = this._protocol.onEvent('chat.RoomConversationEvent', _.bind(onRoomConversationEvent, this));

        this._disposables.add(disposeOfConversationHandler);
    };

    ChatService.prototype.stop = function stop() {
        if (!this._enabled.getValue()) {
            return;
        }

        this._enabled.setValue(false);

        if (this._disposables) {
            this._disposables.dispose();
        }
    };

    ChatService.prototype.getObservableChatEnabled = function getObservableChatEnabled() {
        return this._enabled;
    };

    ChatService.prototype.canSendMessage = function canSendMessage() {
        return this._authenticationService.checkAuthorized();
    };

    ChatService.prototype.sendMessageToRoom = function sendMessageToRoom(roomId, screenName, role, lastUpdate, message, callback) {
        sendMessageRequest.call(this, roomId, screenName, role, lastUpdate, message, callback);
    };

    ChatService.prototype.subscribeAndLoadMessages = function subscribeAndLoadMessages(roomId, batchSize, onReceiveMessages) {
        var disposeOfListener = setupChatListener.call(this, roomId, onReceiveMessages);

        subscribeToRoomConversationRequest.call(this, roomId, batchSize);

        return disposeOfListener;
    };

    ChatService.prototype.getMessages = function getMessages(roomId, batchSize, afterMessageId, beforeMessageId, onReceiveMessages) {
        getMessagesRequest.call(this, roomId, batchSize, afterMessageId, beforeMessageId, onReceiveMessages);
    };

    ChatService.prototype.toString = function toString() {
        return 'ChatService';
    };

    function setupSubscriptions() {
        var pcastStatusSubscription = this._authenticationService.getObservableStatus().subscribe(_.bind(onStatusChange, this));

        this._disposables.add(pcastStatusSubscription);
    }

    function setupChatListener(roomId, onReceiveMessages) {
        var that = this;

        this._roomMessagesListeners[roomId] = onReceiveMessages;

        var disposeOfHandler = new disposable.Disposable(function() {
            if (that._roomMessagesListeners[roomId] === onReceiveMessages) {
                delete that._roomMessagesListeners[roomId];
            }
        });

        this._disposables.add(disposeOfHandler);

        return disposeOfHandler;
    }

    function onRoomConversationEvent(event) {
        assert.isObject(event, 'event');
        assert.isStringNotEmpty(event.roomId, 'event.roomId');
        assert.isStringNotEmpty(event.eventType, 'event.eventType');
        assert.isArray(event.chatMessages, 'event.chatMessages');

        switch (event.eventType) {
        case 'Message':
            this._logger.debug('[%s] Room messages [%s]', event.roomId, event.chatMessages);

            var listener = this._roomMessagesListeners[event.roomId];

            convertTimeFromLongInChatMessages(event.chatMessages);

            if (listener) {
                listener(null, {
                    status: 'ok',
                    chatMessages: event.chatMessages
                });
            }

            break;
        default:
            this._logger.warn('Unsupported room conversation event [%s]', event.eventType);
        }
    }

    function onStatusChange(status) { // eslint-disable-line no-unused-vars
        // Only reason to redo subscriptions is if sessionId changes, which infers status changed
    }

    function getMessagesRequest(roomId, batchSize, afterMessageId, beforeMessageId, callback) {
        assert.isStringNotEmpty(roomId, 'roomId');
        assert.isFunction(callback, 'callback');

        if (!beforeMessageId || !afterMessageId) {
            assert.isNumber(batchSize, 'batchSize');
        }

        if (beforeMessageId) {
            assert.isStringNotEmpty(beforeMessageId, 'beforeMessageId');
        }

        if (afterMessageId) {
            assert.isStringNotEmpty(afterMessageId, 'afterMessageId');
        }

        assertEnabled.call(this);
        this._authenticationService.assertAuthorized();

        var sessionId = this._authenticationService.getPCastSessionId();

        this._logger.info('Get messages from room [%s] conversation with batch size of [%s], after [%s], and before [%s]', roomId, batchSize, afterMessageId, beforeMessageId);

        var that = this;

        this._protocol.getMessages(sessionId, roomId, batchSize, afterMessageId, beforeMessageId,
            function(error, response) {
                if (error) {
                    that._logger.error('Get messages from room conversation failed with error [%s]', error);

                    return callback(error, null);
                }

                var result = {status: response.status};

                if (response.status !== 'ok') {
                    that._logger.warn('Get messages from room conversation failed with status [%s]', response.status);

                    return callback(null, result);
                }

                result.chatMessages = response.chatMessages;

                convertTimeFromLongInChatMessages(result.chatMessages);

                callback(null, result);
            }
        );
    }

    function subscribeToRoomConversationRequest(roomId, batchSize) {
        assert.isStringNotEmpty(roomId, 'roomId');
        assert.isNumber(batchSize, 'batchSize');

        assertEnabled.call(this);
        this._authenticationService.assertAuthorized();

        var sessionId = this._authenticationService.getPCastSessionId();

        this._logger.info('Subscribe to room [%s] conversation with batch size of [%s]', roomId, batchSize);

        var that = this;

        this._protocol.subscribeToRoomConversation(sessionId, roomId, batchSize, function(error, response) {
            var onReceiveMessages = that._roomMessagesListeners[roomId];

            if (!onReceiveMessages) {
                return that._logger.warn('No subscription callback set for room [%s]', roomId);
            }

            if (error) {
                that._logger.error('Subscribe to room conversation failed with error [%s]', error);

                return onReceiveMessages(error, null);
            }

            var result = {status: response.status};

            if (response.status !== 'ok') {
                delete that._roomMessagesListeners[roomId];

                that._logger.warn('Subscribe to room conversation failed with status [%s]', response.status);

                return onReceiveMessages(null, result);
            }

            result.chatMessages = response.chatMessages;

            convertTimeFromLongInChatMessages(result.chatMessages);

            onReceiveMessages(null, result);
        });
    }

    function sendMessageRequest(roomId, screenName, role, lastUpdate, message, callback) {
        assert.isStringNotEmpty(roomId, 'roomId');
        assert.isStringNotEmpty(screenName, 'screenName');
        assert.isStringNotEmpty(role, 'role');
        assert.isNumber(lastUpdate, 'lastUpdate');
        assert.isStringNotEmpty(message, 'message');
        assert.isFunction(callback, 'callback');

        assertEnabled.call(this);
        this._authenticationService.assertAuthorized();

        var sessionId = this._authenticationService.getPCastSessionId();

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

        this._logger.info('Send message to room [%s] from [%s]', roomId, screenName);

        var that = this;

        return this._protocol.sendMessageToRoom(roomId, chatMessage, function(error, response) {
            if (error) {
                that._logger.error('Send message to room failed with error [%s]', error);

                return callback(error, null);
            }

            var result = {status: response.status};

            if (response.status !== 'ok') {
                that._logger.warn('Send message to room failed with status [%s]', response.status);
            }

            callback(null, result);
        });
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

    return ChatService;
});