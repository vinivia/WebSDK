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
    'sdk/PCast',
    '../../../test/mock/HttpStubber',
    '../../../test/mock/WebSocketStubber',
    '../../../test/mock/ChromeRuntimeStubber'
], function (PCast, HttpStubber, WebSocketStubber, ChromeRuntimeStubber) {
    describe('When Subscribing to a Stream', function () {
        var httpStubber = new HttpStubber();
        var websocketStubber = new WebSocketStubber();
        var chromeRuntimeStubber = new ChromeRuntimeStubber();
        var pcast;

        before(function() {
            httpStubber.stubAuthRequest();
            chromeRuntimeStubber.stub();
        });

        beforeEach(function () {
            pcast = new PCast({uri: 'wss://mockURI'});
        });

        after(function() {
            httpStubber.restore();
            chromeRuntimeStubber.restore();
        });

        it('Has method subscribe', function () {
            expect(pcast.subscribe).to.be.a('function');
        });

        it('Expect an error to be thrown if pcast has not been started when subscribing', function () {
            expect(function () {
                pcast.subscribe('mockStreamToken', function() {}, {});
            }).to.throw(Error);
        });

        describe('When pcast has been started', function() {
            beforeEach(function() {
                websocketStubber.stubAuthRequest();

                pcast.start('mockAuthToken', function(){}, function(){}, function(){});

                websocketStubber.triggerOpen();
            });

            afterEach(function() {
                pcast.stop();
                websocketStubber.restore();
            });

            it('Expect an error to not be thrown when subscribing', function () {
                websocketStubber.restore();

                expect(function () {
                    pcast.subscribe('mockStreamToken', function() {}, {});
                }).to.not.throw();
            });

            it('Expect connect options to be passed through to websocket send', function (done) {
                websocketStubber.stubResponse('pcast.SetupStream', {status: 'dont-continue-code-execution'}, function(response, message) {
                    expect(message.createStream.connectOptions[0]).to.be.equal('mock-option');

                    done();
                });

                pcast.subscribe('mockStreamToken', function() {}, {connectOptions: ['mock-option']});
            });
        });
    });
});