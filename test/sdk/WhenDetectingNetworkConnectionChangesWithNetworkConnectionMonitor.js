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
    'sdk/NetworkConnectionMonitor',
    'sdk/logging/Logger'
], function (NetworkConnectionMonitor, Logger) {
    'use strict';

    describe('When Detecting Network Connection Changes with NetworkConnectionMonitor', function () {
        var networkConnectionMonitor;
        var offlineTimeoutLength = 200;
        var onlineCallbackStub;
        var offlineCallbackStub;

        beforeEach(function () {
            networkConnectionMonitor = new NetworkConnectionMonitor(offlineTimeoutLength, sinon.createStubInstance(Logger));

            onlineCallbackStub = sinon.stub();
            offlineCallbackStub = sinon.stub();

            networkConnectionMonitor.start(onlineCallbackStub, offlineCallbackStub);
        });

        it('online event triggers online callback', function () {
            var event = new Event('online');

            window.dispatchEvent(event);

            sinon.assert.calledOnce(onlineCallbackStub);
        });

        it('Expect correctly handles 0 timeout', function () {
            var monitor = new NetworkConnectionMonitor(0);

            expect(monitor._offlineHysteresisTimeout).to.be.equal(0);
        });

        it('Expect correctly handles 1 timeout', function () {
            var monitor = new NetworkConnectionMonitor(1);

            expect(monitor._offlineHysteresisTimeout).to.be.equal(1);
        });

        it('offline event triggers offline callback after timeout', function (done) {
            var event = new Event('offline');

            window.dispatchEvent(event);

            setTimeout(function() {
                sinon.assert.calledOnce(offlineCallbackStub);
                done();
            }, offlineTimeoutLength*2);
        });

        it('offline event does not trigger offline callback before timeout', function (done) {
            var event = new Event('offline');

            window.dispatchEvent(event);

            setTimeout(function() {
                sinon.assert.notCalled(offlineCallbackStub);
                done();
            }, offlineTimeoutLength/2);
        });

        it('offline event does not trigger offline callback after monitor stopped', function (done) {
            var event = new Event('offline');

            window.dispatchEvent(event);

            networkConnectionMonitor.stop();

            setTimeout(function() {
                sinon.assert.notCalled(offlineCallbackStub);
                done();
            }, offlineTimeoutLength);
        });

        it('offline event followed by an online event does not trigger offline callback', function (done) {
            var offlineEvent = new Event('offline');
            var onlineEvent = new Event('online');

            window.dispatchEvent(offlineEvent);
            window.dispatchEvent(onlineEvent);

            setTimeout(function() {
                sinon.assert.notCalled(offlineCallbackStub);
                done();
            }, offlineTimeoutLength);
        });
    });
});