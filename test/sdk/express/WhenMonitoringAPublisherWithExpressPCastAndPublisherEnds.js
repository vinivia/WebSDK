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
    'sdk/express/PCastExpress',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber',
    '../../../test/mock/PeerConnectionStubber',
    '../../../test/mock/UserMediaStubber'
], function(_, PCastExpress, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber, UserMediaStubber) {
    describe('When Monitoring a Publisher with Express PCast And Publisher Ends', function() {
        var httpStubber;
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var pcastExpress;

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

            pcastExpress = new PCastExpress({
                authToken: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJnWHllRUlIdHZiZERQOU90Y0d5Q1E3WkVITHNsejc3eUsvZXB1aU00UUVxOVd6Qm12akwrdUtYR1JKK003QXhPK0JFM3dJeE13WHlzREdETnRCY2M1UT09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NjgwNDksXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                uri: 'wss://mockURI'
            });

            websocketStubber.stubSetupStream();
        });

        after(function() {
            chromeRuntimeStubber.restore();
            peerConnectionStubber.restore();
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            pcastExpress.dispose();
        });

        it('Expect reason of app-background to return retry function', function(done) {
            pcastExpress.publish({
                token: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJqNWJkUGRERmNBZU1zK2hqa0hsdmQrYmhQd1VWYUZyTFhnRlA4aCsrSDNGb0JCd3pPbm40RUQxMDZINVc5Ums5WEhLaUMzR0VCd09wVE9EZFY1NmRXdz09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NzI0NDcsXCJ0eXBlXCI6XCJwdWJsaXNoXCIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                userMediaStream: UserMediaStubber.getMockMediaStream(),
                monitor: {
                    callback: function(error, response) {
                        expect(response.retry).to.be.a('function');
                        expect(response.reason).to.be.equal('app-background');
                        done();
                    }
                }
            }, function() {
                websocketStubber.stubEvent('pcast.StreamEnded', {
                    streamId: 'mockStreamId',
                    reason: 'app-background',
                    sessionId: 'mockSessionId'
                });
            });
        });

        it('Expect retry to cause publisher callback to be called twice', function(done) {
            var subscribeCount = 0;

            pcastExpress.publish({
                token: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJqNWJkUGRERmNBZU1zK2hqa0hsdmQrYmhQd1VWYUZyTFhnRlA4aCsrSDNGb0JCd3pPbm40RUQxMDZINVc5Ums5WEhLaUMzR0VCd09wVE9EZFY1NmRXdz09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NzI0NDcsXCJ0eXBlXCI6XCJwdWJsaXNoXCIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                userMediaStream: UserMediaStubber.getMockMediaStream(),
                monitor: {
                    callback: function(error, response) {
                        if (subscribeCount === 1) {
                            return response.retry();
                        }
                    }
                }
            }, function() {
                subscribeCount++;

                if (subscribeCount === 1) {
                    return websocketStubber.stubEvent('pcast.StreamEnded', {
                        streamId: 'mockStreamId',
                        reason: 'app-background',
                        sessionId: 'mockSessionId'
                    });
                }

                expect(subscribeCount).to.be.equal(2);
                done();
            });
        });

        it('Expect reason of error to automatically retry publisher without triggering callback', function(done) {
            var subscribeCount = 0;
            var monitorCallback = sinon.spy();

            pcastExpress.publish({
                token: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJqNWJkUGRERmNBZU1zK2hqa0hsdmQrYmhQd1VWYUZyTFhnRlA4aCsrSDNGb0JCd3pPbm40RUQxMDZINVc5Ums5WEhLaUMzR0VCd09wVE9EZFY1NmRXdz09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NzI0NDcsXCJ0eXBlXCI6XCJwdWJsaXNoXCIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                userMediaStream: UserMediaStubber.getMockMediaStream(),
                monitor: {callback: monitorCallback}
            }, function() {
                subscribeCount++;

                if (subscribeCount === 1) {
                    return websocketStubber.stubEvent('pcast.StreamEnded', {
                        streamId: 'mockStreamId',
                        reason: 'error',
                        sessionId: 'mockSessionId'
                    });
                }

                expect(subscribeCount).to.be.equal(2);
                sinon.assert.notCalled(monitorCallback);
                done();
            });
        });

        it('Expect reason of custom to automatically return no retry function', function(done) {
            pcastExpress.publish({
                token: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJqNWJkUGRERmNBZU1zK2hqa0hsdmQrYmhQd1VWYUZyTFhnRlA4aCsrSDNGb0JCd3pPbm40RUQxMDZINVc5Ums5WEhLaUMzR0VCd09wVE9EZFY1NmRXdz09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NzI0NDcsXCJ0eXBlXCI6XCJwdWJsaXNoXCIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                userMediaStream: UserMediaStubber.getMockMediaStream(),
                monitor: {
                    callback: function(error, response) {
                        expect(response.retry).to.not.be.true;
                        done();
                    }
                }
            }, function() {
                return websocketStubber.stubEvent('pcast.StreamEnded', {
                    streamId: 'mockStreamId',
                    reason: 'custom',
                    sessionId: 'mockSessionId'
                });
            });
        });

        it('Expect reason of capacity to automatically retry after a timeout', function(done) {
            var start = null;
            var subscribeCount = 0;
            var monitorCallback = sinon.spy();
            var setTimeoutClone = setTimeout;

            window.setTimeout = function(callback, timeout) {
                return setTimeoutClone(callback, timeout / 100);
            };

            pcastExpress.publish({
                token: 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoibW9ja1VzZXIiLCJkaWdlc3QiOiJqNWJkUGRERmNBZU1zK2hqa0hsdmQrYmhQd1VWYUZyTFhnRlA4aCsrSDNGb0JCd3pPbm40RUQxMDZINVc5Ums5WEhLaUMzR0VCd09wVE9EZFY1NmRXdz09IiwidG9rZW4iOiJ7XCJ1cmlcIjpcImh0dHBzOi8vbW9ja1VyaVwiLFwiZXhwaXJlc1wiOjE5ODY0NTY3NzI0NDcsXCJ0eXBlXCI6XCJwdWJsaXNoXCIsXCJyZXF1aXJlZFRhZ1wiOlwiY2hhbm5lbEFsaWFzOkNoYW5uZWxBbGlhc1wifSJ9',
                userMediaStream: UserMediaStubber.getMockMediaStream(),
                monitor: {callback: monitorCallback}
            }, function() {
                subscribeCount++;

                if (subscribeCount === 1) {
                    start = _.now();

                    return websocketStubber.stubEvent('pcast.StreamEnded', {
                        streamId: 'mockStreamId',
                        reason: 'capacity',
                        sessionId: 'mockSessionId'
                    });
                }

                var timeoutLength = _.now() - start;

                window.setTimeout = setTimeoutClone;
                expect(timeoutLength).to.be.greaterThan(5);
                done();
            });
        });
    });
});