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
    'lodash',
    'sdk/logging/Logger',
    'sdk/ReconnectingWebSocket'
], function (_, Logger, ReconnectingWebSocket) {
    'use strict';

    describe('When connecting to A Reconnecting WebSocket', function () {
        var mockWebSocket;
        var webSocketClone = WebSocket;
        var reconnectingWebSocket;
        var webSocketReconnectCount = 0;
        var uri = 'mockUri';
        var initialBackoffTime = 100;
        var maxAttempts = 3;
        var openReadyState = 1;
        var closedReadyState = 3;

        function closeWebSocket(code) {
            mockWebSocket.readyState = closedReadyState;

            if (mockWebSocket.onclose) {
                mockWebSocket.onclose({
                    code: code || 1001,
                    reason: ''
                });
            }
        }

        function openWebSocket() {
            mockWebSocket.readyState = openReadyState;
            mockWebSocket.onopen({
                code: 0,
                reason: ''
            });
        }

        function goOnline() {
            var event = new Event('online');
            window.dispatchEvent(event);
        }

        function goOffline() {
            var event = new Event('offline');
            window.dispatchEvent(event);
        }

        before(function () {
            mockWebSocket = {
                close: function () {
                    closeWebSocket(1000);
                },
                send: sinon.stub()
            };

            WebSocket = function() { // eslint-disable-line no-global-assign
                webSocketReconnectCount++;

                return mockWebSocket;
            };
        });
        after(function() {
            WebSocket = webSocketClone; // eslint-disable-line no-global-assign
        });

        beforeEach(function() {
            reconnectingWebSocket = new ReconnectingWebSocket(uri, new Logger(), maxAttempts, initialBackoffTime);

            mockWebSocket.readyState = openReadyState; // Open

            webSocketReconnectCount = 0;
        });

        afterEach(function() {
            reconnectingWebSocket.disconnect();
        });

        it('Expect send to trigger send request on webSocket', function () {
            reconnectingWebSocket.send('My Message');

            sinon.assert.calledOnce(mockWebSocket.send);
        });

        it('Expect WebSocket close event of 1001 to trigger reconnect a single time after a successful reconnect', function (done) {
            closeWebSocket();

            setTimeout(function() {
                openWebSocket();

                expect(webSocketReconnectCount).to.be.equal(1);

                done();
            }, initialBackoffTime/10);
        });

        it('Expect WebSocket close event of 1001 to trigger reconnect two times after one backoff interval has elapsed followed by a successful reconnect', function (done) {
            closeWebSocket();

            setTimeout(function() {
                openWebSocket();

                expect(webSocketReconnectCount).to.be.equal(2);

                done();
            }, initialBackoffTime + 1);
        });

        it('Expect WebSocket close event of 1001 to trigger reconnect max times and then disconnect', function (done) {
            closeWebSocket();

            reconnectingWebSocket.ondisconnected = function() {
                expect(webSocketReconnectCount).to.be.equal(maxAttempts);
                done();
            };
        });

        it('Expect WebSocket close event of 1000 to not trigger reconnect', function (done) {
            reconnectingWebSocket.disconnect();

            setTimeout(function() {
                expect(webSocketReconnectCount).to.be.equal(0);

                done();
            }, initialBackoffTime + 1);
        });

        it('Expect WebSocket close event to trigger no reconnects when socket has been disconnected', function (done) {
            reconnectingWebSocket.disconnect();

            closeWebSocket();

            setTimeout(function() {
                expect(webSocketReconnectCount).to.be.equal(0);

                done();
            }, initialBackoffTime + 1);
        });

        it('Expect network close event followed by network reconnect to trigger no reconnects when socket has been disconnected', function (done) {
            goOffline();

            reconnectingWebSocket.disconnect();
            mockWebSocket.readyState = closedReadyState;

            goOnline();

            setTimeout(function() {
                expect(webSocketReconnectCount).to.be.equal(0);

                done();
            }, initialBackoffTime + 1);
        });

        it('Expect network close event followed by network reconnect to trigger a reconnect when websocket is closed', function (done) {
            goOffline();

            mockWebSocket.readyState = closedReadyState;

            goOnline();

            setTimeout(function() {
                openWebSocket();

                expect(webSocketReconnectCount).to.be.equal(1);

                done();
            }, initialBackoffTime/10 + 1001);
        });

        it('Expect network close event followed by network reconnect to trigger no reconnect events when websocket is open', function (done) {
            goOffline();

            mockWebSocket.readyState = openReadyState;

            goOnline();

            setTimeout(function() {
                openWebSocket();

                expect(webSocketReconnectCount).to.be.equal(0);

                done();
            }, initialBackoffTime/10 + 1001);
        });
    });
});