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
define([ ], function () {
    'use strict';

    var log = function () {
            console.log.apply(console, arguments);
        } || function () {
        };
    var logError = function () {
            console.error.apply(console, arguments);
        } || log;

    function Logger() {
    }

    Logger.prototype.trace = function (/*formatStr, [parameter], ...*/) {
        return log(arguments);
    };

    Logger.prototype.debug = function (/*formatStr, [parameter], ...*/) {
        return log(arguments);
    };

    Logger.prototype.info = function (/*formatStr, [parameter], ...*/) {
        return log(arguments);
    };

    Logger.prototype.warn = function (/*formatStr, [parameter], ...*/) {
        return logError(arguments);
    };

    Logger.prototype.error = function (/*formatStr, [parameter], ...*/) {
        return logError(arguments);
    };

    Logger.prototype.fatal = function (/*formatStr, [parameter], ...*/) {
        return logError(arguments);
    };

    return Logger;
});
