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
    'sdk/room/room.json'
], function (_, RoomExpress, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber, room) {
    describe('When Publishing to a Channel With Express Room', function () {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };

        var httpStubber;
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var roomExpress;

        before(function() {
            chromeRuntimeStubber.stub();
            peerConnectionStubber.stub();
        });

        beforeEach(function () {
            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            roomExpress = new RoomExpress({
                backendUri: mockBackendUri,
                authenticationData: mockAuthData,
                uri: 'wss://mockURI'
            });

            websocketStubber.stubSetupStream();
            websocketStubber.stubResponse('chat.CreateRoom', {
                status: 'ok',
                room: {
                    roomId: 'ChannelId',
                    alias: 'ChannelAlias',
                    name: 'ChannelAlias',
                    description: 'Channel',
                    type: room.types.channel.name
                }
            });
        });

        after(function() {
            chromeRuntimeStubber.restore();
            peerConnectionStubber.restore();
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            roomExpress.stop();
        });

        it('Expect stream ended reason of censored to trigger a callback and re-publish', function (done) {
            var subscribeCount = 0;

            roomExpress.publishToChannel({
                capabilities: [],
                room: {
                    alias: 'ChannelAlias',
                    name: 'Channel'
                },
                streamUri: 'StreamUri'
            }, function(error, response) {
                subscribeCount++;

                if (subscribeCount === 1) {
                    return websocketStubber.stubMessage('pcast.StreamEnded', {
                        streamId: 'mockStreamId',
                        reason: 'censored',
                        sessionId: 'mockSessionId'
                    });
                }

                expect(subscribeCount).to.be.equal(2);
                expect(response.status).to.be.equal('ok');
                done();
            });

            websocketStubber.triggerConnected();
        });

        it('Expect stream ended reason of ended to trigger callback with reason ended', function (done) {
            var subscribeCount = 0;

            roomExpress.publishToChannel({
                capabilities: [],
                room: {
                    alias: 'ChannelAlias',
                    name: 'Channel'
                },
                streamUri: 'StreamUri'
            }, function(error, response) {
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

            websocketStubber.triggerConnected();
        });
    });
});