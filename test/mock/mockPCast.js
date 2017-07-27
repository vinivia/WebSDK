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
    'phenix-web-observable',
    'phenix-web-logging',
    'sdk/PCastProtocol',
    'sdk/PCast'
], function (observable, logging, Protocol, PCast) {
    function MockPCast () {
        var pcast = sinon.createStubInstance(PCast);

        buildUpPcast(pcast);

        return pcast;
    }

    MockPCast.buildUpMockPCast = function(pcast) {
        buildUpPcast(pcast);
    };

    function buildUpPcast(pcast) {
        var logger = sinon.createStubInstance(logging.Logger);
        var protocol = sinon.createStubInstance(Protocol);
        var sessionId = new observable.Observable('mockSessionId');
        var status = new observable.Observable('online');

        pcast.getLogger = function() {
            return logger;
        };

        pcast.getProtocol = function() {
            return protocol;
        };

        pcast.getStatus = function() {
            return 'online';
        };

        pcast.getObservableStatus = function() {
            return status;
        };

        protocol.getSessionId = function() {
            return 'mockSessionId';
        };

        protocol.getObservableSessionId = function() {
            return sessionId;
        };

        if (pcast.start.restore) {
            pcast.start.restore();
        }

        pcast.start = sinon.stub(pcast, 'start', function(authToken, authenticationCallback, onlineCallback) {
            authenticationCallback(pcast, 'ok', sessionId.getValue());
            onlineCallback();
        });
    }

    return MockPCast;
});