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
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber',
    '../../../test/mock/PeerConnectionStubber',
    'sdk/room/room.json',
    'sdk/room/member.json',
    'sdk/room/stream.json',
    'sdk/room/track.json'
], function (_, RoomExpress, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber, room, member, stream, track) {
    describe('When Joining a Channel With Express Room That Has A Presenter', function () {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };

        var httpStubber;
        var websocketStubber = new WebSocketStubber();
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var roomExpress;

        before(function() {
            chromeRuntimeStubber.stub();
            peerConnectionStubber.stub();
            websocketStubber.stubAuthRequest();
        });

        beforeEach(function () {
            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            roomExpress = new RoomExpress({
                backendUri: mockBackendUri,
                authenticationData: mockAuthData,
                uri: 'wss://mockURI'
            });

            websocketStubber.stubSetupStream();
            websocketStubber.stubResponse('chat.JoinRoom', {
                status: 'ok',
                room: {
                    roomId: 'ChannelId',
                    alias: 'ChannelAlias',
                    name: 'ChannelAlias',
                    description: 'Channel',
                    type: room.types.channel.name
                },
                members: [{
                    sessionId: 'ChannelMemberId',
                    screenName: 'ChannelMember',
                    role: member.roles.presenter.name,
                    state: member.states.active.name,
                    streams: [{
                        uri: 'pcast://phenixp2p.com/streamId',
                        type: stream.types.presentation.name,
                        audioState: track.states.trackEnabled.name,
                        videoState: track.states.trackEnabled.name
                    }],
                    lastUpdate: _.now()
                }]
            });
        });

        after(function() {
            chromeRuntimeStubber.restore();
            peerConnectionStubber.restore();
        });

        afterEach(function() {
            httpStubber.restore();
            roomExpress.stop();
        });

        it('Expect stream ended reason of censored to trigger a callback and re-subscribe', function (done) {
            var subscribeCount = 0;

            roomExpress.joinChannel({
                capabilities: [],
                alias: 'ChannelAlias'
            }, function() {}, function(error, response) {
                subscribeCount++;

                if (subscribeCount === 1) {
                    return websocketStubber.stubMessage('pcast.StreamEnded', {
                        streamId: 'mockStreamId',
                        reason: 'censored',
                        sessionId: 'mockSessionId'
                    });
                }

                expect(response.status).to.be.equal('ok');
                expect(subscribeCount).to.be.equal(2);
                done();
            });

            setTimeout(websocketStubber.triggerOpen.bind(websocketStubber), 0);
        });

        it('Expect stream ended reason of ended to trigger callback with reason ended', function (done) {
            var subscribeCount = 0;

            roomExpress.joinChannel({
                capabilities: [],
                alias: 'ChannelAlias'
            }, function() {}, function(error, response) {
                subscribeCount++;

                if (subscribeCount === 1) {
                    return websocketStubber.stubMessage('pcast.StreamEnded', {
                        streamId: 'mockStreamId',
                        reason: 'ended',
                        sessionId: 'mockSessionId'
                    });
                }

                expect(response.status).to.be.equal('ended');
                expect(response.reason).to.be.equal('ended');
                done();
            });

            setTimeout(websocketStubber.triggerOpen.bind(websocketStubber), 0);
        });
    });
});