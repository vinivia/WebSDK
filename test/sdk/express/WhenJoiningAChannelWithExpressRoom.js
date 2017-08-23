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
    'sdk/room/Member',
    '../../../test/mock/mockPCast',
    'sdk/room/room.json',
    'sdk/room/member.json',
    'sdk/room/stream.json',
    'sdk/room/track.json'
], function (RoomExpress, Member, MockPCast, room, member, stream, track) {
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
            uri: 'pcast://phenixp2p.com/' + mockStreamId,
            audioState: track.states.trackEnabled.name,
            videoState: track.states.trackEnabled.name,
            getTracks: function () {
                return [mockTrack];
            },
            getUri: function () {
                return mockStream.uri;
            }
        };
        var mockMediaStream = {setStreamEndedCallback: function() {}};
        var noStreamsPlayingStatus = 'no-stream-playing';

        var requests = [];

        before(function() {
            this.xhr = sinon.useFakeXMLHttpRequest();

            var authResponse = {
                status: 'ok',
                authenticationToken: 'newToken'
            };

            this.xhr.onCreate = function (req) {
                requests.push(req);
                req.respond(200, null, authResponse);
            };
        });
        after(function() {
            this.xhr.restore();
        });
        afterEach(function() {
            requests = [];
        });

        var roomExpress;
        var protocol;
        var response;

        beforeEach(function() {
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

            protocol.enterRoom.restore();
            protocol.enterRoom = sinon.stub(protocol, 'enterRoom').callsFake(function (roomId, alias, selfForRequest, timestamp, callback) {
                callback(null, response);
            });
        });

        afterEach(function() {
            roomExpress.stop();
        });

        it('Has method joinRoom', function () {
            expect(roomExpress.joinChannel).to.be.a('function');
        });

        it('Expect joinChannel protocol to be called with just alias and participant member role', function () {
            protocol.enterRoom.restore();
            protocol.enterRoom = sinon.stub(protocol, 'enterRoom').callsFake(function (roomId, alias, selfForRequest) {
                expect(alias).to.be.equal(mockRoom.alias);
                expect(selfForRequest.role).to.be.equal(member.roles.participant.name);
            });

            roomExpress.joinChannel({
                alias: mockRoom.alias,
                role: member.roles.participant.name
            }, function() {}, function(){});
        });

        it('Expect joinChannel protocol to be called with just alias and default audience role', function () {
            protocol.enterRoom.restore();
            protocol.enterRoom = sinon.stub(protocol, 'enterRoom').callsFake(function (roomId, alias, selfForRequest) {
                expect(alias).to.be.equal(mockRoom.alias);
                expect(selfForRequest.role).to.be.equal(member.roles.audience.name);
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