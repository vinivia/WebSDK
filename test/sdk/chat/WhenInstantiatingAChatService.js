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
    'Long',
    'sdk/observable/Observable',
    'sdk/authentication/AuthenticationService',
    'sdk/chat/ChatService',
    '../../../test/mock/mockPCast'
], function (Long, Observable, AuthenticationService, ChatService, MockPCast) {
    var pcast;
    var mockProtocol;
    var chatService;
    var response;

    describe('When Instantiating a ChatService', function () {
        beforeEach(function () {
            pcast = new MockPCast();

            mockProtocol = pcast.getProtocol();
            mockProtocol.getSessionId = function () { return 'mockSessionId'; };

            chatService = new ChatService(pcast);

            response = {
                status: 'ok',
                chatMessages: [],
            };

            mockProtocol.subscribeToRoomConversation.restore();
            mockProtocol.subscribeToRoomConversation = sinon.stub(mockProtocol, 'subscribeToRoomConversation', function (sessionId, roomId, batchSize, callback) {
                callback(response, null);
            });

            mockProtocol.sendMessageToRoom.restore();
            mockProtocol.sendMessageToRoom = sinon.stub(mockProtocol, 'sendMessageToRoom', function (roomId, chatMessage, callback) {
                callback(response, null);
            });
        });

        it('Has property start that is a function', function () {
            expect(chatService.start).to.be.a('function');
        });

        it('Has property stop that is a function', function () {
            expect(chatService.stop).to.be.a('function');
        });

        it('Has property sendMessage that is a function', function () {
            expect(chatService.sendMessageToRoom).to.be.a('function');
        });

        it('Has property loadMessages that is a function', function () {
            expect(chatService.subscribeAndLoadMessages).to.be.a('function');
        });

        it('Chat is successfully initialized on start', function () {
            chatService.start();

            sinon.assert.calledOnce(mockProtocol.on);

            chatService.stop();
        });

        describe('When chat service is started', function () {
            beforeEach(function () {
                chatService.start();
            });

            afterEach(function () {
                chatService.stop();
            });

            it('loadMessages returns list of existing messages for roomId', function () {
                response.chatMessages = [{id:'1'}];

                mockProtocol.subscribeToRoomConversation.restore();
                mockProtocol.subscribeToRoomConversation = sinon.stub(mockProtocol, 'subscribeToRoomConversation', function (sessionId, roomId, batchSize, callback) {
                    callback(response, null);
                });

                chatService.subscribeAndLoadMessages('roomId', 1, function (chatMessages) {
                    expect(chatMessages[0].id).to.be.equal('1');
                });
            });

            it('loadMessages successfully converts Long Timestamp', function () {
                response.chatMessages = [{id:'1',timestamp:Long.fromNumber(1488469432437)}];

                mockProtocol.subscribeToRoomConversation.restore();
                mockProtocol.subscribeToRoomConversation = sinon.stub(mockProtocol, 'subscribeToRoomConversation', function (sessionId, roomId, batchSize, callback) {
                    callback(response, null);
                });

                chatService.subscribeAndLoadMessages('roomId', 1, function (chatMessages) {
                    expect(chatMessages[0].timestamp).to.be.equal(1488469432437);
                });
            });

            it('loadMessages throws error when status is not ok', function () {
                response.status = 'no-room';

                mockProtocol.subscribeToRoomConversation.restore();
                mockProtocol.subscribeToRoomConversation = sinon.stub(mockProtocol, 'subscribeToRoomConversation', function (sessionId, roomId, batchSize, callback) {
                    callback(response, null);
                });

                expect(function () {
                    chatService.subscribeAndLoadMessages('roomId', 1, function () { });
                }).to.throw(Error);
            });

            it('sendMessage results in request to send chat message', function () {
                chatService.sendMessageToRoom('roomId', 'screenName', 'role', 123, 'Hi');

                sinon.assert.calledOnce(mockProtocol.sendMessageToRoom);
            });
        });

        describe('When listening for messages', function () {
            var onChatEvent;

            beforeEach(function () {
                mockProtocol.on.restore();
                mockProtocol.on = sinon.stub(mockProtocol, 'on', function (eventName, chatEventHandler) {
                    onChatEvent = chatEventHandler;
                });

                chatService.start();
            });

            afterEach(function () {
                onChatEvent = null;
                chatService.stop();
            });

            it('Message event returns list of messages to handler', function () {
                mockProtocol.subscribeToRoomConversation.restore();
                mockProtocol.subscribeToRoomConversation = sinon.stub(mockProtocol, 'subscribeToRoomConversation', function (sessionId, roomId, batchSize, callback) {
                    callback(response, null);
                });

                chatService.subscribeAndLoadMessages('roomId', 1, function (chatMessages) {
                    if (chatMessages.length > 0) {
                        expect(chatMessages[0].id).to.be.equal('1');
                    }
                });

                var event = {roomId:'roomId', eventType: 'Message', chatMessages: [{id:'1'}]};
                onChatEvent(event);
            });

            it('Chat Message timestamp Long values successfully converted', function () {
                chatService.subscribeAndLoadMessages('roomId', 1, function (chatMessages) {
                    if (chatMessages.length) {
                        expect(chatMessages[0].timestamp).to.be.equal(1488469432437);
                    }
                });

                var event = {roomId:'roomId', eventType: 'Message', chatMessages: [{id:'1', timestamp: Long.fromNumber(1488469432437)}]};
                onChatEvent(event);
            });

            it('Chat Message From lastUpdate Long values successfully converted', function () {
                chatService.subscribeAndLoadMessages('roomId', 1, function (chatMessages) {
                    if (chatMessages.length) {
                        expect(chatMessages[0].from.lastUpdate).to.be.equal(1488469432437);
                    }
                });

                var event = {roomId:'roomId', eventType: 'Message', chatMessages: [{id:'1', from: { lastUpdate: Long.fromNumber(1488469432437) }}]};
                onChatEvent(event);
            })
        });

        describe('When getting messages', function () {
            var messagesCallback;

            beforeEach(function () {
                mockProtocol.getMessages.restore();
                mockProtocol.getMessages = sinon.stub(mockProtocol, 'getMessages', function (sessionId, roomId, batchSize, beforeMessageId, afterMessageId, callback) {
                    messagesCallback = callback;
                });

                chatService.start();
            });

            afterEach(function () {
                messagesCallback = null;
                chatService.stop();
            });

            it('batchSize and toMessageId yields messages', function () {
                chatService.getMessages('roomId', 1, 'toMessageId', null, function (chatMessages) {
                    if (chatMessages.length > 0) {
                        expect(chatMessages[0].id).to.be.equal('1');
                    }
                });

                var response = {status: 'ok', chatMessages: [{id:'1'}]};
                messagesCallback(response);
            });

            it('batchSize and fromMessageId yields messages', function () {
                chatService.getMessages('roomId', 1, null, 'fromMessageId', function (chatMessages) {
                    if (chatMessages.length > 0) {
                        expect(chatMessages[0].id).to.be.equal('1');
                    }
                });

                var response = {status: 'ok', chatMessages: [{id:'1'}]};
                messagesCallback(response);
            });

            it('toMessageId and fromMessageId yields messages', function () {
                chatService.getMessages('roomId', 1, null, 'fromMessageId', function (chatMessages) {
                    if (chatMessages.length > 0) {
                        expect(chatMessages[0].id).to.be.equal('1');
                    }
                });

                var response = {status: 'ok', chatMessages: [{id:'1'}]};
                messagesCallback(response);
            });

            it('Message lastUpdates are successfully converted from Long', function () {
                chatService.getMessages('roomId', 1, 'toMessageId', null, function (chatMessages) {
                    if (chatMessages.length) {
                        expect(chatMessages[0].from.lastUpdate).to.be.equal(1488469432437);
                    }
                });

                var response = {status: 'ok', chatMessages: [{id:'1', from: { lastUpdate: Long.fromNumber(1488469432437) }}]};
                messagesCallback(response);
            });

            it('Message timestamps are successfully converted from Long', function () {
                chatService.getMessages('roomId', 1, 'toMessageId', null, function (chatMessages) {
                    if (chatMessages.length) {
                        expect(chatMessages[0].timestamp).to.be.equal(1488469432437);
                    }
                });

                var response = {status: 'ok', chatMessages: [{id:'1', timestamp: Long.fromNumber(1488469432437)}]};
                messagesCallback(response);
            });
        });

        describe('When PCast SessionId Changes', function () {
            var sessionIdObservable;

            beforeEach(function () {
                sessionIdObservable = new Observable('mockPCastSessionId');

                AuthenticationService.prototype.getObservableSessionId = sinon.stub(AuthenticationService.prototype, 'getObservableSessionId', function () {
                    return sessionIdObservable;
                });

                chatService.start();
            });

            afterEach(function () {
                AuthenticationService.prototype.getObservableSessionId.restore();
                chatService.stop();
            });

            it('Expect sessionId to cause fetchRoomMessages for all existing listeners', function (done) {
                chatService._roomMessagesListeners = {
                    'id1': function () {},
                    'id2': function () {},
                    'id3': function () {}
                };

                sessionIdObservable.setValue('mockNewSessionId');

                setTimeout(function () {
                    sinon.assert.calledThrice(mockProtocol.subscribeToRoomConversation);
                    done();
                }, 500)
            });
        });

        describe('When PCast Status Changes', function () {
            var statusObservable;

            beforeEach(function () {
                statusObservable = new Observable('online');

                AuthenticationService.prototype.getObservableStatus = sinon.stub(AuthenticationService.prototype, 'getObservableStatus', function () {
                    return statusObservable;
                });

                chatService.start();
            });

            afterEach(function () {
                AuthenticationService.prototype.getObservableStatus.restore();
                chatService.stop();
            });

            it('Status changed to online causes fetchRoomMessages for all existing listeners', function (done) {
                chatService._roomMessagesListeners = {
                    'id1': function () {},
                    'id2': function () {},
                    'id3': function () {}
                };

                statusObservable.setValue('Offline');

                setTimeout(function () {
                    statusObservable.setValue('Online');

                    setTimeout(function () {
                        sinon.assert.calledThrice(mockProtocol.subscribeToRoomConversation);
                        done();
                    }, 200)
                }, 200);
            });
        });
    });
});