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

    var defaultCategory= 'websdk';
    var start = window['__phenixPageLoadTime'] || _.now();
    var defaultEnvironment = '%ENVIRONMENT%' || '?';
    var sdkVersion = '%SDKVERSION%' || '?';
    var releaseVersion = '%RELEASEVERSION%';

    function Logger(observableSessionId) {
        this._appenders = [];
        this._userId = null;
        this._sessionId = null;
        this._environment = defaultEnvironment;
        this._applicationVersion = sdkVersion;

        if (observableSessionId) {
            assert.isObject(observableSessionId);

            observableSessionId.subscribe(_.bind(onSessionIdChange, this), {initial: 'notify'});
        }
    }

    Logger.prototype.trace = function trace(/* formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.TRACE});
    };

    Logger.prototype.debug = function debug(/* formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.DEBUG});
    };

    Logger.prototype.info = function info(/* formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.INFO});
    };

    Logger.prototype.warn = function warn(/* formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.WARN});
    };

    Logger.prototype.error = function error(/* formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.ERROR});
    };

    Logger.prototype.fatal = function fatal(/* formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.FATAL});
    };

    Logger.prototype.addAppender = function addAppender(appender) {
        assert.isObject(appender, 'appender');
        assert.isFunction(appender.log, 'appender.log');

        this._appenders.push(appender);
    };

    Logger.prototype.getAppenders = function getAppenders() {
        return this._appenders;
    };

    Logger.prototype.getUserId = function getUserId() {
        return this._userId;
    };

    Logger.prototype.setUserId = function setUserId(userId) {
        this._userId = userId;
    };

    Logger.prototype.getEnvironment = function getEnvironment() {
        return this._environment;
    };

    Logger.prototype.setEnvironment = function setEnvironment(environment) {
        this._environment = environment;
    };

    Logger.prototype.getApplicationVersion = function getApplicationVersion() {
        return this._applicationVersion;
    };

    Logger.prototype.setApplicationVersion = function setApplicationVersion(version) {
        this._applicationVersion = version;
    };

    function onSessionIdChange(sessionId) {
        this._sessionId = sessionId;

        if (!sessionId) {
            this.info('Websdk version [%s] ([%s]), user agent [%s]', sdkVersion, releaseVersion, navigator.userAgent);
        } else {
            this.info('Session started on websdk version [%s] ([%s]), user agent [%s]', sdkVersion, releaseVersion, navigator.userAgent);
        }
    }

    function log(messages, context) {
        var now = _.now();
        var since = (now - start) / 1000;
        var level = convertLevel(context.level);
        var category = context.name || defaultCategory;
        var that = this;

        _.forEach(this._appenders, function(appender) {
            try {
                appender.log(since, level, category, stringify(Array.prototype.slice.call(messages)), that._sessionId, that._userId, that._environment, that._applicationVersion, context);
            } catch (e) { } // eslint-disable-line no-empty
        });
    }

    function convertLevel(jsLoggerLevel) {
        switch (jsLoggerLevel) {
        case logging.level.TRACE:
            return 'Trace';
        case logging.level.DEBUG:
            return 'Debug';
        case logging.level.INFO:
            return 'Info';
        case logging.level.WARN:
            return 'Warn';
        case logging.level.ERROR:
            return 'Error';
        case logging.level.FATAL:
            return 'Fatal';
        default:
            throw new Error('Unsupported Logging Level ' + jsLoggerLevel);
        }
    }

    var stringify = function stringify(args) {
        if (args.length === 0) {
            return;
        }

        var newArgs = [];
        var errorStacks = [];

        _.forEach(args, function(arg) {
            newArgs.push(_.toString(arg));

            if (arg instanceof Error) {
                errorStacks.push(arg.stack);
            }
        });

        return format(newArgs.concat(errorStacks));
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
                }
            }
        }

        return args;
    };

    return Logger;
});