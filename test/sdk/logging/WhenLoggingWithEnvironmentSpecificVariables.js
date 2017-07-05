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
    'sdk/logging/Logger'
], function (ConsoleAppender, Logger) {
    describe('When Logging With Environment Specific Variables', function () {
        var logger;
        var consoleAppender = new ConsoleAppender();

        beforeEach(function() {
            logger = new Logger();
        });

        it('Has property getEnvironment that is a function', function () {
            expect(logger.getEnvironment).to.be.a('function');
        });

        it('Has property setEnvironment that is a function', function () {
            expect(logger.setEnvironment).to.be.a('function');
        });

        it('Has property getUserId that is a function', function () {
            expect(logger.getUserId).to.be.a('function');
        });

        it('Has property setUserId that is a function', function () {
            expect(logger.setUserId).to.be.a('function');
        });

        it('Has property getApplicationVersion that is a function', function () {
            expect(logger.getApplicationVersion).to.be.a('function');
        });

        it('Has property setApplicationVersion that is a function', function () {
            expect(logger.setApplicationVersion).to.be.a('function');
        });

        describe('When logger has both analytix and console appenders', function() {
            beforeEach(function() {
                logger = new Logger();

                logger.addAppender(consoleAppender);
            });

            it('Expect Trace to trigger appender log call with version variable', function () {
                var consoleAppenderStub = sinon.stub(consoleAppender, 'log', function(since, level, category, messages, sessionId, userId, environment, version) {
                    expect(version).to.be.equal('version');
                });

                logger.setApplicationVersion('version');

                expect(logger.getApplicationVersion()).to.be.equal('version');

                logger.trace('Trace Message');

                consoleAppenderStub.restore();
            });

            it('Expect Trace to trigger appender log call with environment variable', function () {
                var consoleAppenderStub = sinon.stub(consoleAppender, 'log', function(since, level, category, messages, sessionId, userId, environment) {
                    expect(environment).to.be.equal('environment');
                });

                logger.setEnvironment('environment');

                expect(logger.getEnvironment()).to.be.equal('environment');

                logger.trace('Trace Message');

                consoleAppenderStub.restore();
            });

            it('Expect Trace to trigger appender log call with userId variable', function () {
                var consoleAppenderStub = sinon.stub(consoleAppender, 'log', function(since, level, category, messages, sessionId, userId) {
                    expect(userId).to.be.equal('userId');
                });

                logger.setUserId('userId');

                expect(logger.getUserId()).to.be.equal('userId');

                logger.trace('Trace Message');

                consoleAppenderStub.restore();
            });
        });
    });
});