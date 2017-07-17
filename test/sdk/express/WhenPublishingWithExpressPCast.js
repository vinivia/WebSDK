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
    'sdk/express/PCastExpress',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber',
    '../../../test/mock/PeerConnectionStubber',
    'sdk/PeerConnectionMonitor'
], function (PCastExpress, HttpStubber, WebSocketStubber, ChromeRuntimeStubber, PeerConnectionStubber, PeerConnectionMonitor) {
    describe('When Publishing with Express PCast', function () {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };

        var httpStubber;
        var websocketStubber = new WebSocketStubber();
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var pcastExpress;

        before(function() {
            chromeRuntimeStubber.stub();
            peerConnectionStubber.stub();
            websocketStubber.stubAuthRequest();
        });

        beforeEach(function () {
            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

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
            pcastExpress.stop();
        });

        it('Has method publish', function () {
            expect(pcastExpress.publish).to.be.a('function');
        });

        it('Expect publisher to be returned in subscribe callback', function (done) {
            pcastExpress.publish({
                capabilities: [],
                userMediaStream: {}
            }, function(error, response) {
                expect(response.publisher).to.be.a('object');
                done();
            });

            setTimeout(websocketStubber.triggerOpen.bind(websocketStubber), 0);
        });

        it('Expect monitor to return a response with retry', function (done) {
            var startClone = PeerConnectionMonitor.prototype.start;

            PeerConnectionMonitor.prototype.start = function(options, activeCallback, monitorCallback) {
                monitorCallback();
            };

            pcastExpress.publish({
                capabilities: [],
                userMediaStream: {},
                monitor: {
                    conditionCountForNotificationThreshold: 0,
                    callback: function(error, response) {
                        expect(response.retry).to.be.a('function');

                        PeerConnectionMonitor.prototype.start = startClone;
                        done();
                    }
                }
            }, function() {});

            setTimeout(websocketStubber.triggerOpen.bind(websocketStubber), 0);
        });

        it('Expect monitor retry to setup a new publisher', function (done) {
            var startClone = PeerConnectionMonitor.prototype.start;
            var subscribeCount = 0;

            PeerConnectionMonitor.prototype.start = function(options, activeCallback, monitorCallback) {
                setTimeout(function() {
                    if (subscribeCount < 2) {
                        monitorCallback();
                    }
                }, 10);
            };

            pcastExpress.publish({
                capabilities: [],
                userMediaStream: {},
                monitor: {
                    conditionCountForNotificationThreshold: 0,
                    callback: function(error, response) {
                        response.retry();

                        PeerConnectionMonitor.prototype.start = startClone;
                    }
                }
            }, function() {
                subscribeCount++;

                if (subscribeCount > 1) {
                    expect(subscribeCount).to.be.equal(2);
                    done();
                }
            });

            setTimeout(websocketStubber.triggerOpen.bind(websocketStubber), 0);
        });

        it('Expect monitor retry with unauthorized status for setupStream to trigger request a single time to get new streamToken', function (done) {
            var startClone = PeerConnectionMonitor.prototype.start;
            var subscribeCount = 0;

            PeerConnectionMonitor.prototype.start = function(options, activeCallback, monitorCallback) {
                setTimeout(function() {
                    if (subscribeCount < 2) {
                        websocketStubber.stubResponse('pcast.SetupStream', {status: 'unauthorized'});

                        monitorCallback();
                    }
                }, 10);
            };

            pcastExpress.publish({
                capabilities: [],
                userMediaStream: {},
                monitor: {
                    conditionCountForNotificationThreshold: 0,
                    callback: function(error, response) {
                        response.retry();

                        PeerConnectionMonitor.prototype.start = startClone;
                    }
                }
            }, function(error, response) {
                subscribeCount++;

                if (subscribeCount > 1) {
                    expect(response.status).to.be.equal('unauthorized');
                    done();
                }
            });

            setTimeout(websocketStubber.triggerOpen.bind(websocketStubber), 0);
        });
    });
});