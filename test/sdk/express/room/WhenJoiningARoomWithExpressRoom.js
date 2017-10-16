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
    'sdk/express/RoomExpress',
    '../../../../test/mock/HttpStubber',
    '../../../../test/mock/WebSocketStubber',
    'sdk/room/room.json',
    'sdk/room/member.json'
], function (_, RoomExpress, HttpStubber, WebSocketStubber, room, member) {
    describe('When Joining a Room with ExpressRoom', function () {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };
        var mockRoom = {
            roomId: 'TestRoom123',
            alias: 'TestRoom123Alias',
            name: 'Test123',
            description: 'My Test Room',
            bridgeId: '',
            pin: '',
            type: room.types.multiPartyChat.name,
            members: []
        };

        var httpStubber;
        var websocketStubber;
        var roomExpress;
        var response;

        beforeEach(function(done) {
            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            roomExpress = new RoomExpress({
                backendUri: mockBackendUri,
                authenticationData: mockAuthData
            });

            response = {
                status: 'ok',
                room: mockRoom,
                members: []
            };

            websocketStubber.stubResponse('chat.JoinRoom', response);

            roomExpress.getPCastExpress().waitForOnline(done);

            websocketStubber.triggerConnected();
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            roomExpress.dispose();
        });

        it('Has method joinRoom', function () {
            expect(roomExpress.joinRoom).to.be.a('function');
        });

        it('Expect joinRoom protocol to be called with just roomId', function () {
            websocketStubber.stubResponse('chat.JoinRoom', response, function (type, message) {
                expect(message.roomId).to.be.equal(mockRoom.roomId);
            });

            roomExpress.joinRoom({
                roomId: mockRoom.roomId,
                role: member.roles.participant.name
            }, function() {}, function(){});
        });

        it('Expect joinRoom protocol to be called with just alias', function () {
            websocketStubber.stubResponse('chat.JoinRoom', response, function (type, message) {
                expect(message.alias).to.be.equal(mockRoom.alias);
            });

            roomExpress.joinRoom({
                alias: mockRoom.alias,
                role: member.roles.participant.name
            }, function() {}, function(){});
        });

        it('Expect joinRoom protocol without alias or roomId to throw an error', function () {
            websocketStubber.stubResponse('chat.JoinRoom', response, function (type, message) {
                expect(message.alias).to.be.equal(mockRoom.alias);
            });

            expect(function () {
                roomExpress.joinRoom({role: member.roles.participant.name}, function() {}, function(){});
            }).to.throw(Error);
        });

        it('Expect joinRoom callback to return response object with a roomService and active room', function () {
            roomExpress.joinRoom({
                role: member.roles.participant.name,
                alias: 'roomAlias'
            }, function(error, response) {
                expect(response.roomService).to.exist;
                expect(response.roomService.getObservableActiveRoom().getValue()).to.exist;
            }, function(){});
        });

        it('Expect member subscription callback to trigger when members changed after successfully joining a room', function (done) {
            roomExpress.joinRoom({
                role: member.roles.participant.name,
                alias: 'roomAlias'
            }, function(error, response) {
                response.roomService.getObservableActiveRoom().getValue().getObservableMembers().setValue([{}]);
            }, function(members){
                expect(members.length).to.be.equal(1);

                done();
            });
        });
    });
});