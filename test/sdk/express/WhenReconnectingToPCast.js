/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
    describe('When Reconnecting to PCast', function() {
        var mockBackendUri = 'https://mockUri';
        var mockAuthData = {
            name: 'mockUser',
            password: 'somePassword'
        };

        var setTimeoutClone = setTimeout;
        var httpStubber;
        var websocketStubber;
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var peerConnectionStubber = new PeerConnectionStubber();
        var pcastExpress;

        before(function() {
            chromeRuntimeStubber.stub();
            peerConnectionStubber.stub();
        });

        beforeEach(function(done) {
            window.setTimeout = function(callback, timeout) {
                return setTimeoutClone(callback, timeout / 100);
            };

            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();

            pcastExpress = new PCastExpress({
                backendUri: mockBackendUri,
                authenticationData: mockAuthData,
                uri: 'wss://mockURI',
                onError: _.noop,
                onlineTimeout: 60000
            });

            websocketStubber.stubSetupStream();
            websocketStubber.triggerConnected();

            pcastExpress.waitForOnline(function() {
                websocketStubber.triggerReconnected();
                done();
            });
        });

        after(function() {
            chromeRuntimeStubber.restore();
            peerConnectionStubber.restore();
        });

        afterEach(function() {
            httpStubber.restore();
            websocketStubber.restore();
            pcastExpress.dispose();
            window.setTimeout = setTimeoutClone;
        });

        it('successfully subscribes to stream', function(done) {
            pcastExpress.subscribe({
                capabilities: [],
                streamId: 'MockStreamId'
            }, function(error, response) {
                expect(error).to.not.exist;
                expect(response.mediaStream).to.be.a('object');
                done();
            });
        });

        it('successfully publishes a stream', function(done) {
            pcastExpress.publish({
                capabilities: [],
                userMediaStream: UserMediaStubber.getMockMediaStream()
            }, function(error, response) {
                expect(response.publisher).to.be.a('object');
                done();
            });
        });

        describe('When auth fails with status unauthorized and then successfully reconnects with a new session id after getting a new auth token', function() {
            var reauthTokenSpy = null;

            beforeEach(function(done) {
                reauthTokenSpy = sinon.spy();

                websocketStubber.stubAuthRequestFailure('unauthorized');
                httpStubber.stubAuthRequest(function() {
                    websocketStubber.stubAuthRequest('NewSessionId');
                    reauthTokenSpy();
                });
                websocketStubber.triggerReconnected();

                pcastExpress.waitForOnline(function() {
                    sinon.assert.calledOnce(reauthTokenSpy);
                    done();
                });
            });

            it('successfully subscribes to stream', function(done) {
                pcastExpress.subscribe({
                    capabilities: [],
                    streamId: 'MockStreamId'
                }, function(error, response) {
                    expect(error).to.not.exist;
                    expect(response.mediaStream).to.be.a('object');
                    done();
                });
            });

            it('successfully publishes a stream', function(done) {
                pcastExpress.publish({
                    capabilities: [],
                    userMediaStream: UserMediaStubber.getMockMediaStream()
                }, function(error, response) {
                    expect(response.publisher).to.be.a('object');
                    done();
                });
            });
        });

        describe('When auth fails with status unauthorized while publishing and then successfully reconnects with a new session id after getting a new auth token', function() {
            var reauthTokenSpy = null;

            beforeEach(function(done) {
                reauthTokenSpy = sinon.spy();

                pcastExpress.publish({
                    capabilities: [],
                    userMediaStream: UserMediaStubber.getMockMediaStream()
                }, function(error, response) {
                    expect(response.publisher).to.be.a('object');

                    websocketStubber.stubAuthRequestFailure('unauthorized');
                    httpStubber.stubAuthRequest(function() {
                        websocketStubber.stubAuthRequest('NewSessionId');
                        reauthTokenSpy();
                    });
                    websocketStubber.triggerReconnected();

                    pcastExpress.waitForOnline(function() {
                        expect(response.publisher.isActive()).to.be.true;
                        sinon.assert.calledOnce(reauthTokenSpy);
                        done();
                    });
                });
            });

            it('successfully subscribes to stream', function(done) {
                pcastExpress.subscribe({
                    capabilities: [],
                    streamId: 'MockStreamId'
                }, function(error, response) {
                    expect(error).to.not.exist;
                    expect(response.mediaStream).to.be.a('object');
                    done();
                });
            });

            it('successfully publishes a stream', function(done) {
                pcastExpress.publish({
                    capabilities: [],
                    userMediaStream: UserMediaStubber.getMockMediaStream()
                }, function(error, response) {
                    expect(response.publisher).to.be.a('object');
                    done();
                });
            });
        });

        describe('When auth fails with status unauthorized and then fails to reconnect', function() {
            beforeEach(function() {
                websocketStubber.stubAuthRequestFailure('unauthorized');
                websocketStubber.triggerReconnected();
            });

            it('fails to subscribe to stream within 20000 ms', function(done) {
                var start = _.now();

                pcastExpress.subscribe({
                    capabilities: [],
                    streamId: 'MockStreamId'
                }, function(error) {
                    expect(error.message).to.be.equal('timeout');
                    expect((_.now() - start) >= (20000 / 100)).to.be.true;
                    done();
                });
            });

            it('fails to publish a stream within 20000 ms', function(done) {
                var start = _.now();

                pcastExpress.publish({
                    capabilities: [],
                    userMediaStream: UserMediaStubber.getMockMediaStream()
                }, function(error) {
                    expect(error.message).to.be.equal('timeout');
                    expect((_.now() - start) >= (20000 / 100)).to.be.true;
                    done();
                });
            });
        });

        // TODO(dy) Fix randomness so it passes every time
        describe('When auth fails with status capacity', function() {
            var reauthTokenSpy = null;

            beforeEach(function() {
                reauthTokenSpy = sinon.spy();
                websocketStubber.stubAuthRequestFailure('capacity');
                httpStubber.stubAuthRequest(reauthTokenSpy);
                websocketStubber.triggerReconnected();
            });

            it('attempts to reconnect at least 2 times after 6000 ms plus some randomness', function(done) {
                setTimeout(function() {
                    expect(reauthTokenSpy.callCount >= 2).to.be.true;
                    done();
                }, 20000);
            });

            it('attempts to reconnect at least 3 times after 15000 ms plus some randomness', function(done) {
                setTimeout(function() {
                    expect(reauthTokenSpy.callCount >= 3).to.be.true;
                    done();
                }, 40000);
            });
        });

        describe('When PCast disconnects then reconnects', function() {
            beforeEach(function(done) {
                websocketStubber.triggerDisconnected();

                setTimeout(function() {
                    websocketStubber.triggerReconnected();
                    done();
                }, 100);
            });

            it('successfully subscribes to stream', function(done) {
                pcastExpress.subscribe({
                    capabilities: [],
                    streamId: 'MockStreamId'
                }, function(error, response) {
                    expect(error).to.not.exist;
                    expect(response.mediaStream).to.be.a('object');
                    done();
                });
            });

            it('successfully publishes a stream', function(done) {
                pcastExpress.publish({
                    capabilities: [],
                    userMediaStream: UserMediaStubber.getMockMediaStream()
                }, function(error, response) {
                    expect(response.publisher).to.be.a('object');
                    done();
                });
            });
        });
    });
});