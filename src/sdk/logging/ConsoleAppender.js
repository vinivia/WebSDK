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
    './logging.json'
], function (_, assert, logging) {
    'use strict';

    function ConsoleAppender() {
        this._minLevel = logging.level.TRACE;
    }

    ConsoleAppender.prototype.setThreshold = function setThreshold(level) {
        assert.isNumber(level);

        this._minLevel = level;
    };

    ConsoleAppender.prototype.getThreshold = function getThreshold() {
        return this._minLevel;
    };

    ConsoleAppender.prototype.log = function (since, level, category, messages, sessionId, userId, environment, version, context) {
        if (context.level < this._minLevel) {
            return;
        }

        messages[0] = since + ' [' + category + '] ' + level + ' ' + messages[0];

        if (context.level > logging.level.INFO) {
            logError(messages)
        } else {
            log(messages);
        }
    };

    var log = function (args) {
        console.log.apply(console, args);
    } || function () { };

    var logError = function (args) {
        console.error.apply(console, args);
    } || log;

    return ConsoleAppender;
});
