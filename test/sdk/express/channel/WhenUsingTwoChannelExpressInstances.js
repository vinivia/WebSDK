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
    'sdk/express/ChannelExpress',
    '../../../../test/mock/HttpStubber',
    '../../../../test/mock/WebSocketStubber',
    '../../../../test/mock/ChromeRuntimeStubber',
    '../../../../test/mock/PeerConnectionStubber',
    'sdk/room/room.json',
    'sdk/room/member.json'
], function(_, ChannelExpress, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber, room, member) {
    describe('When using two ChannelExpress instances', function() {
        var httpStubber;
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var channelExpressPublisher;
        var channelExpressSubscriber;
        var mockRoom = {
            roomId: 'ChannelId',
            alias: 'ChannelAlias',
            name: 'ChannelAlias',
            description: 'Channel',
            bridgeId: '',
            pin: '',
            type: room.types.channel.name,
            members: []
        };
        var token = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJoaExsSnJsYjJQOFFWL3hZcjk2MUxNb3lzS3l3Sk1XNzI5MFlvTU1WWVJBMkZSQklkUDhMOWJEcytMVGdJVVIrWnhIcmlTTmtoakVwVlVqTFg0OUtVUT09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODUxODA2MDk2MzQsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9';
        var publishToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJEUzBjQzVwQ3pJMGNtRHVEVm1xcHR0Rm5oWHhpZzFzYkpEVjV3Vi95ZEQyTnJKckR1NUxWVzhtK3hEQ0tKa3JFbE04OVUrRVR3akMzK1lvejlEdEVOdz09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODUxMDU1Nzc5OTEsXCJ0eXBlXCI6XCJwdWJsaXNoXCIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9';

        before(function() {
            chromeRuntimeStubber.stub();
            peerConnectionStubber.stub();
        });

        beforeEach(function() {
            httpStubber = new HttpStubber();

            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            websocketStubber.stubSetupStream();
            websocketStubber.stubResponse('chat.CreateRoom', {
                status: 'ok',
                room: mockRoom
            });
            websocketStubber.stubResponse('chat.JoinRoom', {
                status: 'ok',
                room: mockRoom,
                members: []
            });

            const initChannaleExpress = () => new ChannelExpress({authToken: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJvNk04cDBvMEYyK2ZNV0dLZ09sQmNKUU1oN0pmWWhnRFcwU1hXZHJnM3VwVlBpTEJXa2wvTnZMRUE4Y3Rnb0VRNUs2SEI0OENHMWxpMTRHcDJ4cWNIQT09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODUxODA1Nzg5MDIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9'});
            channelExpressPublisher = initChannaleExpress();
            channelExpressSubscriber = initChannaleExpress();
        });

        after(function() {
            chromeRuntimeStubber.restore();
            peerConnectionStubber.restore();
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            channelExpressPublisher.dispose();
            channelExpressSubscriber.dispose();
        });

        // TODO (IS) understand why this test is breaking the flow of other tests (other tests get sessionId undefined on init)
        it('successfully publishes to a channel then joins in another', function(done) {
            channelExpressPublisher.publishToChannel({
                token: publishToken,
                room: {
                    alias: 'ChannelAlias',
                    name: 'Channel'
                },
                streamUri: 'StreamUri'
            }, function() {
                channelExpressSubscriber.joinChannel({
                    role: member.roles.participant.name,
                    alias: 'ChannelAlias',
                    token: token
                }, _.noop, function(error, response){
                    expect(response.status).to.be.equal('no-stream-playing');

                    done();
                });
            });
        });
        it('successfully joins a channel then publishes to another', function(done) {
            var responseCount = 0;

            channelExpressSubscriber.joinChannel({
                role: member.roles.participant.name,
                token: token
            }, _.noop, function(error, response){
                expect(response.status).to.be.equal('no-stream-playing');
                channelExpressPublisher.publishToChannel({
                    token: publishToken,
                    room: {
                        alias: 'ChannelAlias',
                        name: 'Channel'
                    },
                    streamUri: 'StreamUri'
                }, function(error, response) {
                    responseCount++;

                    if (responseCount === 1) {
                        expect(response.status).to.be.equal('ok');

                        done();
                    }
                });
            });
        });
    });
});