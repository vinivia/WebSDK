/**
 * Copyright 2023 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
    'sdk/PCast',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber',
    '../../../test/mock/PeerConnectionStubber',
    '../../../test/mock/UserMediaStubber'
], function(PCast, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber, UserMediaStubber) {
    describe('When Disabling Console Logging with PCast', function() {
        var httpStubber = new HttpStubber();
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var pcast;

        before(function() {
            httpStubber.stubAuthRequest();
            chromeRuntimeStubber.stub();
            peerConnectionStubber.stub();
        });

        beforeEach(function(done) {
            websocketStubber = new WebSocketStubber();

            pcast = new PCast({
                authToken: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJnWHllRUlIdHZiZERQOU90Y0d5Q1E3WkVITHNsejc3eUsvZXB1aU00UUVxOVd6Qm12akwrdUtYR1JKK003QXhPK0JFM3dJeE13WHlzREdETnRCY2M1UT09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NjgwNDksXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                disableConsoleLogging: true
            });

            websocketStubber.stubAuthRequest();

            pcast.start(function(){}, function(){}, function(){});

            websocketStubber.stubSetupStream();

            pcast.getObservableStatus().subscribe(function(status) {
                if (status === 'online') {
                    done();
                }
            });
        });

        after(function() {
            httpStubber.restore();
            chromeRuntimeStubber.restore();
            peerConnectionStubber.restore();
        });

        afterEach(function() {
            pcast.stop();
            websocketStubber.restore();
        });

        it('Expect an error to not be thrown when subscribing', function() {
            expect(function() {
                pcast.subscribe('DIGEST:eyJ0b2tlbiI6IntcImNhcGFiaWxpdGllc1wiOltdfSJ9', function() {}, {});
            }).to.not.throw();
        });

        it('Expect an error to not be thrown when publishing', function() {
            expect(function() {
                pcast.publish('DIGEST:eyJ0b2tlbiI6IntcImNhcGFiaWxpdGllc1wiOltdfSJ9', UserMediaStubber.getMockMediaStream(), function() {});
            }).to.not.throw();
        });
    });
});