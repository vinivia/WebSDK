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
    'phenix-web-lodash-light',
    'phenix-web-assert',
    'phenix-web-disposable'
], function (_, assert, disposable) {
    'use strict';

    var start = window['__phenixPageLoadTime'] || window['__pageLoadTime'] || _.now();
    var defaultEnvironment = '%ENVIRONMENT%' || '?';
    var sdkVersion = '%SDKVERSION%' || '?';

    function SessionTelemetry(logger, metricsTransmitter) {
        this._environment = defaultEnvironment;
        this._version = sdkVersion;
        this._sessionId = null;
        this._properties = {
            resource: 'Session',
            kind: 'Event'
        };
        this._logger = logger;
        this._metricsTransmitter = metricsTransmitter;
        this._start = _.now();
        this._disposables = new disposable.DisposableList();
        this._records = [];
    }

    SessionTelemetry.prototype.setSessionId = function(sessionId) {
        if (!sessionId && this._sessionId) {
            recordMetricRecord.call(this, {
                metric: 'Stopped',
                elapsed: this.elapsed()
            }, since());
        }

        this._sessionId = sessionId;

        if (sessionId) {
            recordMetricRecord.call(this, {
                metric: 'Initialized',
                elapsed: this.elapsed()
            }, since());

            recordAllMetrics.call(this);
        }
    };

    SessionTelemetry.prototype.setProperty = function(name, value) {
        assert.isStringNotEmpty(name, 'name');
        assert.isStringNotEmpty(value, 'value');

        this._properties[name] = value;
    };

    SessionTelemetry.prototype.recordMetric = function(metric, value, previousValue, additionalProperties) {
        assert.isStringNotEmpty(metric, 'metric');

        var record = _.assign({}, {
            metric: metric,
            elapsed: this.elapsed(),
            value: value,
            previousValue: previousValue
        }, additionalProperties || {});

        recordMetricRecord.call(this, record, since());
    };

    SessionTelemetry.prototype.elapsed = function () {
        var now = _.now();

        return now - this._start;
    };

    SessionTelemetry.prototype.stop = function() {
        this._disposables.dispose();

        this.recordMetric('Stopped');

        logMetric.call(this, 'Stream stopped');
    };

    function logMetric() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length === 0) {
            throw new Error('Invalid logging arguments.');
        }

        var sessionTelemetryPrepend = '[%s] [SessionTelemetry] [%s] ';
        var message = sessionTelemetryPrepend + args[0];
        var loggingArguments = args.slice(1);
        var telemetryArguments = [message, this._streamId, _.now() - this._start].concat(loggingArguments);

        this._logger.debug.apply(this._logger, telemetryArguments);
    }

    function since() {
        var now = _.now();

        return (now - start) / 1000;
    }

    function recordMetricRecord(record, since) {
        assert.isStringNotEmpty(record.metric, 'record.metric');

        if (!this._sessionId) {
            return this._records.push({
                record: record,
                since: since
            });
        }

        var annotatedRecord = _.assign({}, this._properties, record);

        this._metricsTransmitter.submitMetric(record.metric, since, this._sessionId, null, this._environment, this._version, annotatedRecord);
    }

    function recordAllMetrics() {
        if (!this._sessionId) {
            return;
        }

        var that = this;
        var numberOfRecordsToPush = this._records.length;

        while (numberOfRecordsToPush > 0) {
            var records = this._records.splice(numberOfRecordsToPush-1, 1);

            if (records.length === 1) {
                recordMetricRecord.call(that, records[0].record, records[0].since);
            }

            numberOfRecordsToPush--;
        }
    }

    return SessionTelemetry;
});