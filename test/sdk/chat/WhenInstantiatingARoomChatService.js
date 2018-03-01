/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
    'phenix-web-observable',
    'phenix-web-disposable',
    'sdk/PCast',
    'sdk/room/RoomService',
    'sdk/chat/RoomChatService',
    'sdk/chat/ChatService',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber'
], function(_, observable, disposable, PCast, RoomService, RoomChatService, ChatService, HttpStubber, WebSocketStubber, ChromeRuntimeStubber) {
    describe('When Instantiating a RoomChatService', function() {
        var httpStubber;
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var roomService;
        var stubChatService;
        var roomChatService;
        var roomObservable;
        var room = {
            getRoomId: function() {
                return '';
            }
        };
        var pcast;

        before(function() {
            chromeRuntimeStubber.stub();
        });

        beforeEach(function(done) {
            httpStubber = new HttpStubber();
            httpStubber.stub();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            pcast = new PCast();

            pcast.start('AuthToken', function() {}, function onlineCallback() {
                roomService = new RoomService(pcast);
                stubChatService = sinon.createStubInstance(ChatService);
                roomChatService = new RoomChatService(roomService);
                roomChatService._chatService = stubChatService;

                roomObservable = new observable.Observable(room);

                roomService.getObservableActiveRoom = sinon.stub(roomService, 'getObservableActiveRoom').callsFake(function() {
                    return roomObservable;
                });

                roomService.start('Participant', 'Name');

                done();
            }, function offlineCallback() {});

            websocketStubber.triggerConnected();
        });

        after(function() {
            chromeRuntimeStubber.restore();
        });

        afterEach(function() {
            pcast.stop();
            httpStubber.restore();
            websocketStubber.restore();
        });

        it('Has property start that is a function', function() {
            expect(roomChatService.start).to.be.a('function');
        });

        it('Has property stop that is a function', function() {
            expect(roomChatService.stop).to.be.a('function');
        });

        it('Has property sendMessage that is a function', function() {
            expect(roomChatService.sendMessageToRoom).to.be.a('function');
        });

        it('Has property loadMessages that is a function', function() {
            expect(roomChatService.getMessages).to.be.a('function');
        });

        it('Chat is successfully initialized on start', function() {
            roomChatService.start();

            sinon.assert.calledOnce(stubChatService.start);

            roomChatService.stop();
        });

        it('Chat is successfully stopped on stop', function() {
            roomChatService.start();
            roomChatService.stop();

            sinon.assert.calledOnce(stubChatService.stop);
        });

        describe('When room chat service is started', function() {
            beforeEach(function() {
                roomChatService.start();
            });

            afterEach(function() {
                roomChatService.stop();
            });

            it('getObservableChatMessages returns observable', function() {
                var chatMessagesObservable = roomChatService.getObservableChatMessages();

                expect(chatMessagesObservable.subscribe).to.be.a('function');
            });

            it('start calls chatService subscribeAndLoadMessages', function() {
                sinon.assert.calledOnce(stubChatService.subscribeAndLoadMessages);
            });

            it('sendMessage calls chatService sendMessage', function() {
                roomChatService.sendMessageToRoom('message');

                sinon.assert.calledOnce(stubChatService.sendMessageToRoom);
            });

            it('getMessages calls chatService getMessages', function() {
                roomChatService.getMessages(10, 'fromMessageId', 'toMessageId', function() {});

                sinon.assert.calledOnce(stubChatService.getMessages);
            });
        });

        describe('When Room Changes', function() {
            var newMessagesCallback;
            var disposableSpy;

            beforeEach(function() {
                if (stubChatService.subscribeAndLoadMessages.restore) {
                    stubChatService.subscribeAndLoadMessages.restore();
                }

                disposableSpy = sinon.spy();
                stubChatService.subscribeAndLoadMessages = sinon.stub(stubChatService, 'subscribeAndLoadMessages').callsFake(function(roomId, batchSize, callback) {
                    newMessagesCallback = callback;

                    return new disposable.Disposable(disposableSpy);
                });

                roomChatService.start();
            });

            afterEach(function() {
                if (stubChatService.subscribeAndLoadMessages.restore) {
                    stubChatService.subscribeAndLoadMessages.restore();
                }

                roomChatService.stop();
            });

            it('No room causes dispose of current room chat listeners', function(done) {
                roomObservable.setValue(null);

                setTimeout(function() {
                    sinon.assert.calledOnce(disposableSpy);
                    done();
                }, 101);
            });

            it('New room causes new subscription', function(done) {
                roomObservable.setValue(null);

                setTimeout(function() {
                    roomObservable.setValue(room);

                    sinon.assert.calledOnce(stubChatService.subscribeAndLoadMessages);
                    done();
                }, 101);
            });

            describe('When internal queue is at max size (100)', function() {
                beforeEach(function() {
                    var messages = [];

                    messages.length = 100;
                    messages[0] = 0;
                    messages[1] = 1;
                    messages[99] = 99;

                    newMessagesCallback(null, {
                        status: 'ok',
                        chatMessages: messages
                    });
                });

                it('new message yields array of size 100', function() {
                    roomChatService.getObservableChatMessages().subscribe(function(messages) {
                        expect(messages.length).to.be.equal(100);
                    });

                    newMessagesCallback(null, {
                        status: 'ok',
                        chatMessages: [100]
                    });
                });

                it('new message removes first element in array', function() {
                    roomChatService.getObservableChatMessages().subscribe(function(messages) {
                        expect(messages[0]).to.be.equal(1);
                    });

                    newMessagesCallback(null, {
                        status: 'ok',
                        chatMessages: [100]
                    });
                });

                it('new message is added at the end of array', function() {
                    roomChatService.getObservableChatMessages().subscribe(function(messages) {
                        expect(messages[99]).to.be.equal(100);
                    });

                    newMessagesCallback(null, {
                        status: 'ok',
                        chatMessages: [100]
                    });
                });

                it('multiple new messages returns fixed sized array of size 100 with new values at end', function() {
                    roomChatService.getObservableChatMessages().subscribe(function(messages) {
                        expect(messages.length).to.be.equal(100);
                        expect(messages[98]).to.be.equal(100);
                        expect(messages[99]).to.be.equal(101);
                        expect(messages[0]).to.be.undefined;
                        expect(messages[1]).to.be.undefined;
                    });

                    newMessagesCallback(null, {
                        status: 'ok',
                        chatMessages: [100, 101]
                    });
                });
            });
        });
    });
});