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
    'sdk/express/RoomExpress',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/mockPCast',
    'sdk/room/room.json'
], function (RoomExpress, HttpStubber, WebSocketStubber, MockPCast, room) {
    describe('When Creating a Room with ExpressRoom', function () {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };
        var mockRoom = {
            roomId: 'TestRoom123',
            alias: '',
            name: 'Test123',
            description: '',
            bridgeId: '',
            pin: '',
            type: room.types.multiPartyChat.name,
            members: []
        };

        var httpStubber;
        var websocketStubber;
        var roomExpress;
        var protocol;
        var response;

        beforeEach(function() {
            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            roomExpress = new RoomExpress({
                backendUri: mockBackendUri,
                authenticationData: mockAuthData
            });

            MockPCast.buildUpMockPCast(roomExpress.getPCastExpress().getPCast());

            protocol = roomExpress.getPCastExpress().getPCast().getProtocol();

            response = {
                status: 'ok',
                room: mockRoom,
                members: []
            };

            protocol.createRoom.restore();
            protocol.createRoom = sinon.stub(protocol, 'createRoom').callsFake(function (room, callback) {
                callback(null, response);
            });
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            roomExpress.dispose();
        });

        it('Has method createRoom', function () {
            expect(roomExpress.createRoom).to.be.a('function');
        });

        it('Expect createRoom protocol to be called with required values', function () {
            protocol.createRoom.restore();
            protocol.createRoom = sinon.stub(protocol, 'createRoom').callsFake(function (room) {
                expect(room.name).to.be.equal(mockRoom.name);
                expect(room.type).to.be.equal(mockRoom.type);
                expect(room.description).to.not.be.empty;
            });

            roomExpress.createRoom({room: mockRoom}, function() {});
        });

        it('Expect createRoom protocol to be called with default description value', function () {
            protocol.createRoom.restore();
            protocol.createRoom = sinon.stub(protocol, 'createRoom').callsFake(function (room) {
                expect(room.description).to.be.equal('Multi Party Chat');
            });

            roomExpress.createRoom({room: mockRoom}, function() {});
        });

        it('Expect room to be returned from createRoom', function () {
            protocol.createRoom.restore();
            protocol.createRoom = sinon.stub(protocol, 'createRoom').callsFake(function (room, callback) {
                callback(null, {
                    status: 'ok',
                    room: room
                });
            });

            roomExpress.createRoom({room: mockRoom}, function(error, response) {
                expect(response.room).to.exist;
            });
        });
    });
});