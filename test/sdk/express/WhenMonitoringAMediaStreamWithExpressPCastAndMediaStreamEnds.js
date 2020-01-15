/**
 * Copyright 2020 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
    '../../../test/mock/PeerConnectionStubber'
], function(_, PCastExpress, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber) {
    describe('When Monitoring a Media Stream with Express PCast And Media Stream Ends', function() {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };

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
                backendUri: mockBackendUri,
                authenticationData: mockAuthData,
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

        it('Expect reason of censored to not return retry function', function(done) {
            pcastExpress.subscribe({
                capabilities: [],
                streamId: 'MockStreamId',
                monitor: {
                    callback: function(error, response) {
                        expect(response.retry).to.not.exist;
                        expect(response.reason).to.be.equal('censored');
                        done();
                    }
                }
            }, function() {
                websocketStubber.stubEvent('pcast.StreamEnded', {
                    streamId: 'mockStreamId',
                    reason: 'censored',
                    sessionId: 'mockSessionId'
                });
            });
        });

        it('Expect retry to cause publisher callback to be called twice', function(done) {
            var subscribeCount = 0;

            pcastExpress.subscribe({
                capabilities: [],
                streamId: 'MockStreamId',
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

            pcastExpress.subscribe({
                capabilities: [],
                streamId: 'MockStreamId',
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
            pcastExpress.subscribe({
                capabilities: [],
                streamId: 'MockStreamId',
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

            pcastExpress.subscribe({
                capabilities: [],
                streamId: 'MockStreamId',
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