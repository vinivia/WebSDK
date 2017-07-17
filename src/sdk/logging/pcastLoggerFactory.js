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
    '../LodashLight',
    '../assert',
    './Logger',
    './analytixAppenderFactory',
    './ConsoleAppender',
    './logging.json'
], function (_, assert, Logger, analytixAppenderFactory, ConsoleAppender, logging) {
    'use strict';

    function PCastLoggerFactory() { }

    PCastLoggerFactory.prototype.createPCastLogger = function createPCastLogger(baseUri, observableSessionId, disableConsole) {
        if (baseUri) {
            assert.stringNotEmpty(baseUri, 'baseUri');
        }

        var logger = new Logger(observableSessionId);
        var analytixAppender = analytixAppenderFactory.getAppender(baseUri);

        analytixAppender.setThreshold(logging.level.INFO);

        if (!disableConsole) {
            logger.addAppender(new ConsoleAppender());
        }

        logger.addAppender(analytixAppender);

        logger.isPCastLogger = true;

        return logger;
    };

    return new PCastLoggerFactory();
});