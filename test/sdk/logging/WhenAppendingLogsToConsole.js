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
    'sdk/logging/ConsoleAppender',
    'ByteBuffer',
    'sdk/MQProtocol',
    'sdk/logging/logging.json'
], function (ConsoleAppender, ByteBuffer, MQProtocol, logging) {
    describe('When Appending Logs to Console', function () {
        var consoleAppender;
        var consoleLogStub;
        var consoleErrorStub;

        var sessionId = 'mockSessionId';

        beforeEach(function() {
            consoleAppender = new ConsoleAppender();

            consoleLogStub = sinon.stub(console, 'log'); // Disable requests to external source
            consoleErrorStub = sinon.stub(console, 'error');
        });

        afterEach(function() {
            consoleAppender.setThreshold(logging.level.TRACE);

            consoleLogStub.restore();
            consoleErrorStub.restore();
        });

        it('Has property log that is a function', function () {
            expect(consoleAppender.log).to.be.a('function');
        });

        it('Has property setThreshold that is a function', function () {
            expect(consoleAppender.setThreshold).to.be.a('function');
        });

        it('Has property getThreshold that is a function', function () {
            expect(consoleAppender.getThreshold).to.be.a('function');
        });

        it('Expect logging below Warn to trigger console log', function () {
            consoleAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            sinon.assert.calledOnce(consoleLogStub);
            sinon.assert.notCalled(consoleErrorStub);
        });

        it('Expect logging at Warn or above to trigger console error', function () {
            consoleAppender.log(0, 'Warn', '', ['Message'], sessionId, '', '', '', {level: logging.level.WARN});

            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.calledOnce(consoleErrorStub);
        });

        it('Expect threshold to be set when setThreshold is passed a log level', function () {
            consoleAppender.setThreshold(logging.level.WARN);

            expect(consoleAppender.getThreshold()).to.be.equal(logging.level.WARN);
        });

        it('Expect only logs of level at the threshold to be logged', function () {
            consoleAppender.setThreshold(logging.level.WARN);

            consoleAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});
            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.notCalled(consoleErrorStub);

            consoleAppender.log(0, 'Debug', '', ['Message'], sessionId, '', '', '', {level: logging.level.DEBUG});
            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.notCalled(consoleErrorStub);

            consoleAppender.log(0, 'Info', '', ['Message'], sessionId, '', '', '', {level: logging.level.INFO});
            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.notCalled(consoleErrorStub);

            consoleAppender.log(0, 'Warn', '', ['Message'], sessionId, '', '', '', {level: logging.level.WARN});
            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.calledOnce(consoleErrorStub);

            consoleAppender.log(0, 'Error', '', ['Message'], sessionId, '', '', '', {level: logging.level.ERROR});
            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.calledTwice(consoleErrorStub);

            consoleAppender.log(0, 'Fatal', '', ['Message'], sessionId, '', '', '', {level: logging.level.FATAL});
            sinon.assert.notCalled(consoleLogStub);
            sinon.assert.calledThrice(consoleErrorStub);
        });
    });
});