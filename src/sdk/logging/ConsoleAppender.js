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

    ConsoleAppender.prototype.log = function (since, level, category, messages, sessionId, userId, context) {
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
        console.log.apply(console, stringify(args));
    } || function () { };

    var logError = function (args) {
        console.error.apply(console, stringify(args));
    } || log;

    var stringify = function stringify(args) {
        if (args.length === 0) {
            return;
        }

        var newArgs = [];

        for (var i = 0; i < args.length - 1; i++) {
            newArgs.push(toString(args[i]));
        }

        if (args.length > 0) {
            var last = args[args.length - 1];

            if (last instanceof Error) {
                newArgs.push(last);
                newArgs.push(last.stack);
            } else {
                newArgs.push(toString(last));
            }
        }

        return format(newArgs);
    };

    var format = function format(args) {
        var fmt = args[0];
        var idx = 0;

        while (fmt.indexOf && args.length > 1 && idx >= 0) {
            idx = fmt.indexOf('%', idx);

            if (idx > 0) {
                var type = fmt.substring(idx + 1, idx + 2);

                switch (type) {
                    case '%':
                        // Escaped '%%' turns into '%'
                        fmt = fmt.substring(0, idx) + fmt.substring(idx + 1);
                        idx++;
                        break;
                    case 's':
                    case 'd':
                        // Replace '%d' or '%s' with the argument
                        args[0] = fmt = fmt.substring(0, idx) + args[1] + fmt.substring(idx + 2);
                        args.splice(1, 1);
                        break;
                    default:
                        return args;
                        break;
                }
            }
        }

        return args;
    };

    var toString = function toString(data) {
        if (_.isString(data)) {
            return data;
        }

        if (_.isBoolean(data)) {
            return data ? 'true' : 'false';
        }

        if (_.isNumber(data)) {
            return data.toString();
        }

        var toStringStr = '';

        if (data) {
            if (_.isFunction(data.toString)) {
                toStringStr = data.toString();
            } else if (_.isObject(data.toString)) {
                try {
                    toStringStr = data.toString();
                } catch (e) {
                    toStringStr = '[object invalid toString()]';
                }
            }
        }

        if (toStringStr.indexOf('[object') !== 0) {
            return toStringStr;
        }

        var cache = [];

        return toStringStr + JSON.stringify(data, function (key, value) {
                if (_.isObject(value) && !_.isNullOrUndefined(value)) {
                    if (_.includes(cache, value)) {
                        return '<recursive>';
                    }

                    cache.push(value);
                }

                return key === '' ? value : toString(value);
            });
    };

    return ConsoleAppender;
});
