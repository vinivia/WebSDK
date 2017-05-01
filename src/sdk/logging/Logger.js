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

    function Logger() {
        this._appenders = [];
        this._userId = null;
        this._sessionId = null;
    }

    Logger.prototype.trace = function trace(/*formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.TRACE});
    };

    Logger.prototype.debug = function debug(/*formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.DEBUG});
    };

    Logger.prototype.info = function info(/*formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.INFO});
    };

    Logger.prototype.warn = function warn(/*formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.WARN});
    };

    Logger.prototype.error = function error(/*formatStr, [parameter], ...*/) {
        return log.call(this, arguments, {level: logging.level.ERROR});
    };

    Logger.prototype.fatal = function fatal(/*formatStr, [parameter], ...*/) {
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

    Logger.prototype.getSessionId = function getSessionId() {
        return this._sessionId;
    };

    Logger.prototype.setSessionId = function setSessionId(sessionId) {
        this._sessionId = sessionId;
    };

    function log(messages, context) {
        var now = _.now();
        var since = (now - start) / 1000;
        var level = convertLevel(context.level);
        var category = context.name || defaultCategory;
        var that = this;

        _.forEach(this._appenders, function(appender) {
            try {
                appender.log(since, level, category, Array.prototype.slice.call(messages), that._sessionId, that._userId, context);
            } catch (e) {
            }
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
        }

        throw new Error('Unsupported Logging Level ' + jsLoggerLevel);
    }

    return Logger;
});
