/**
 * Copyright 2017 Phenix Inc. All Rights Reserved.
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
    'sdk/room/Member',
    'sdk/room/Stream',
    'sdk/room/room.json',
    'sdk/room/member.json',
    'sdk/room/stream.json',
    'sdk/room/track.json'
], function (_, RoomExpress, HttpStubber, WebSocketStubber, Member, Stream, room, member, stream, track) {
    describe('When Joining a Channel with ExpressRoom', function () {
        var mockBackendUri = 'https://mockUri';
        var mockStreamId = 'mystreamId';
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
        var mockTrack = {enabled: 'true'};
        var mockStream = {
            type: stream.types.user.name,
            uri: Stream.getPCastPrefix() + mockStreamId,
            audioState: track.states.trackEnabled.name,
            videoState: track.states.trackEnabled.name,
            getTracks: function () {
                return [mockTrack];
            },
            getUri: function () {
                return mockStream.uri;
            }
        };
        var mockMediaStream = {
            setStreamEndedCallback: function() {},
            stop: function() {},
            getStream: function() {}
        };
        var noStreamsPlayingStatus = 'no-stream-playing';

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
            expect(roomExpress.joinChannel).to.be.a('function');
        });

        it('Expect joinChannel protocol to be called with just alias and participant member role', function () {
            websocketStubber.stubResponse('chat.JoinRoom', response, function (type, message) {
                expect(message.alias).to.be.equal(mockRoom.alias);
                expect(message.member.role).to.be.equal(member.roles.participant.name);
            });

            roomExpress.joinChannel({
                alias: mockRoom.alias,
                role: member.roles.participant.name
            }, function() {}, function(){});
        });

        it('Expect joinChannel protocol to be called with just alias and default audience role', function () {
            websocketStubber.stubResponse('chat.JoinRoom', response, function (type, message) {
                expect(message.alias).to.be.equal(mockRoom.alias);
                expect(message.member.role).to.be.equal(member.roles.audience.name);
            });

            roomExpress.joinChannel({alias: mockRoom.alias}, function() {}, function(){});
        });

        // Write member joined logic -
        it('Expect joinChannel members subscription event with presenter with no streams playing to return no-streams-playing', function (done) {
            roomExpress.joinChannel({
                role: member.roles.participant.name,
                alias: mockRoom.alias
            }, function(error, response) {
                var presenter = new Member(response.roomService, member.states.passive.name, 'member1', 'MyName', member.roles.presenter.name, [], 123);

                response.roomService.getObservableActiveRoom().getValue().getObservableMembers().setValue([presenter]);
            }, function(error, response){
                expect(response.status).to.be.equal(noStreamsPlayingStatus);
                expect(response.mediaStream).to.not.exist;

                done();
            });
        });

        it('Expect joinChannel members subscription event with participant with streams to return no streams playing status', function (done) {
            roomExpress.joinChannel({
                role: member.roles.participant.name,
                alias: mockRoom.alias
            }, function(error, response) {
                var presenter = new Member(response.roomService, member.states.passive.name, 'member1', 'MyName', member.roles.participant.name, [mockStream], 123);

                response.roomService.getObservableActiveRoom().getValue().getObservableMembers().setValue([presenter]);
            }, function(error, response){
                expect(response.status).to.be.equal(noStreamsPlayingStatus);
                expect(response.mediaStream).to.not.exist;

                done();
            });
        });

        it('Expect joinChannel members subscription event with presenter with streams playing to parse pcast uri from streamId', function (done) {
            roomExpress.getPCastExpress().subscribe = sinon.stub(roomExpress.getPCastExpress(), 'subscribe').callsFake(function(options) {
                expect(options.streamId).to.be.equal(mockStreamId);

                done();
            });

            roomExpress.joinChannel({
                role: member.roles.participant.name,
                alias: mockRoom.alias
            }, function(error, response) {
                var presenter = new Member(response.roomService, member.states.passive.name, 'member1', 'MyName', member.roles.presenter.name, [mockStream], 123);

                response.roomService.getObservableActiveRoom().getValue().getObservableMembers().setValue([presenter]);
            }, function(){ });
        });

        it('Expect joinChannel members subscription event with presenter with streams playing to trigger subscribe event', function (done) {
            roomExpress.getPCastExpress().subscribe = sinon.stub(roomExpress.getPCastExpress(), 'subscribe').callsFake(function(options, callback) {
                callback(null, {
                    status: 'ok',
                    mediaStream: mockMediaStream
                });
            });

            roomExpress.joinChannel({
                role: member.roles.participant.name,
                alias: mockRoom.alias
            }, function(error, response) {
                var presenter = new Member(response.roomService, member.states.passive.name, 'member1', 'MyName', member.roles.presenter.name, [mockStream], 123);

                response.roomService.getObservableActiveRoom().getValue().getObservableMembers().setValue([presenter]);
            }, function(error, response){
                expect(response.mediaStream).to.exist;

                done();
            });
        });
    });
});