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
    'phenix-web-lodash-light',
    'sdk/PCast',
    'sdk/authentication/AuthenticationService',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber'
], function(_, PCast, AuthenticationService, HttpStubber, WebSocketStubber, ChromeRuntimeStubber) {
    describe('When instantiating an Authentication Service', function() {
        var pcast;
        var authenticationService;
        var httpStubber;
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();

        before(function() {
            chromeRuntimeStubber.stub();
        });

        beforeEach(function(done) {
            httpStubber = new HttpStubber();
            httpStubber.stub();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();
            pcast = new PCast({authToken: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJnWHllRUlIdHZiZERQOU90Y0d5Q1E3WkVITHNsejc3eUsvZXB1aU00UUVxOVd6Qm12akwrdUtYR1JKK003QXhPK0JFM3dJeE13WHlzREdETnRCY2M1UT09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NjgwNDksXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9'});

            pcast.start(function() {}, function onlineCallback() {
                authenticationService = new AuthenticationService(pcast);
                done();
            }, function offlineCallback() {});
        });

        after(function() {
            chromeRuntimeStubber.restore();
        });

        afterEach(function() {
            pcast.stop();
            httpStubber.restore();
            websocketStubber.restore();
        });

        describe('When asserting authorized', function() {
            it('Error thrown when status and sessionId invalid', function() {
                pcast.getObservableStatus().setValue('online');
                pcast.getProtocol().getObservableSessionId().setValue('');

                expect(function() {
                    authenticationService.assertAuthorized();
                }).to.throw(Error);
            });

            it('Error thrown when status invalid', function() {
                pcast.getObservableStatus().setValue('offline');

                expect(function() {
                    authenticationService.assertAuthorized();
                }).to.throw(Error);
            });

            it('Error thrown when sessionId invalid', function() {
                pcast.getProtocol().getObservableSessionId().setValue('');

                expect(function() {
                    authenticationService.assertAuthorized();
                }).to.throw(Error);
            });

            it('No Error thrown when status and sessionId valid', function() {
                expect(function() {
                    authenticationService.assertAuthorized();
                }).to.not.throw();
            });
        });
    });
});