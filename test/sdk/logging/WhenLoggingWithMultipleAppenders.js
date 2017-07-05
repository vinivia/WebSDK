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
    'sdk/logging/analytixAppenderFactory',
    'sdk/logging/ConsoleAppender',
    'sdk/logging/Logger'
], function (analytixAppenderFactory, ConsoleAppender, Logger) {
    describe('When Logging With Multiple Appenders', function () {
        var logger;
        var consoleAppender = new ConsoleAppender();
        var analytixAppender = analytixAppenderFactory.getAppender();

        beforeEach(function() {
            logger = new Logger();
        });

        it('Has property trace that is a function', function () {
            expect(logger.trace).to.be.a('function');
        });

        it('Has property debug that is a function', function () {
            expect(logger.debug).to.be.a('function');
        });

        it('Has property info that is a function', function () {
            expect(logger.info).to.be.a('function');
        });

        it('Has property warn that is a function', function () {
            expect(logger.warn).to.be.a('function');
        });

        it('Has property error that is a function', function () {
            expect(logger.error).to.be.a('function');
        });

        it('Has property fatal that is a function', function () {
            expect(logger.fatal).to.be.a('function');
        });

        describe('When logger has both analytix and console appenders', function() {
            var analytixAppenderStub;
            var consoleAppenderStub;

            beforeEach(function() {
                analytixAppenderStub = sinon.stub(analytixAppender, 'log'); // Disable requests to external source
                consoleAppenderStub = sinon.stub(consoleAppender, 'log');
                logger = new Logger();

                logger.addAppender(analytixAppender);
                logger.addAppender(consoleAppender);
            });

            afterEach(function() {
                analytixAppenderStub.restore();
                consoleAppenderStub.restore();
            });

            it('Expect Trace to trigger console logger and not analytix logger', function () {
                logger.trace('Trace Message');

                sinon.assert.calledOnce(analytixAppenderStub);
                sinon.assert.calledOnce(consoleAppenderStub);
            });

            it('Expect Debug to trigger console logger and not analytix logger', function () {
                logger.debug('Debug Message');

                sinon.assert.calledOnce(analytixAppenderStub);
                sinon.assert.calledOnce(consoleAppenderStub);
            });

            it('Expect Info to trigger analytix and console loggers', function () {
                logger.info('Info Message');

                sinon.assert.calledOnce(analytixAppenderStub);
                sinon.assert.calledOnce(consoleAppenderStub);
            });

            it('Expect Warn to trigger analytix and console loggers', function () {
                logger.warn('Warn Message');

                sinon.assert.calledOnce(analytixAppenderStub);
                sinon.assert.calledOnce(consoleAppenderStub);
            });

            it('Expect Error to trigger analytix and console loggers', function () {
                logger.error('Error Message');

                sinon.assert.calledOnce(analytixAppenderStub);
                sinon.assert.calledOnce(consoleAppenderStub);
            });

            it('Expect Fatal to trigger analytix and console loggers', function () {
                logger.fatal('Fatal Message');

                sinon.assert.calledOnce(analytixAppenderStub);
                sinon.assert.calledOnce(consoleAppenderStub);
            });
        });
    });
});