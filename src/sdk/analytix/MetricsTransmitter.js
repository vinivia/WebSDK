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
    '../http',
    'ByteBuffer',
    '../MQProtocol',
    '../NetworkConnectionMonitor',
    'phenix-rtc'
], function (_, assert, http, ByteBuffer, MQProtocol, NetworkConnectionMonitor, rtc) {
    var networkDisconnectHysteresisInterval = 0;

    function MetricsTransmitter() {
        this._loggingUrl = '/analytix/metrics';
        this._domain = location.hostname;
        this._protocol = new MQProtocol();
        this._maxAttempts = 3;
        this._maxBufferedRecords = 1000;
        this._maxBatchSize = 512;
        this._records = [];
        this._pending = false;
        this._baseUri = '';
        this._isEnabled = true;
        this._networkConnectionMonitor = createAndStartNetworkConnectionMonitor.call(this);
        this._browser = (rtc.browser || 'Browser') + '/' + (rtc.browserVersion || '?');
    }

    MetricsTransmitter.prototype.setUri = function setUri(uri) {
        assert.stringNotEmpty(uri, 'uri');

        this._baseUri = uri;
    };

    MetricsTransmitter.prototype.isEnabled = function isEnabled() {
        return this._isEnabled;
    };

    MetricsTransmitter.prototype.setEnabled = function setEnabled(enabled) {
        assert.isBoolean(enabled);

        this._isEnabled = enabled;
    };

    MetricsTransmitter.prototype.submitMetric = function submit(metric, since, sessionId, streamId, environment, version, value) {
        assert.stringNotEmpty(metric, 'metric');
        assert.isObject(value, 'value');

        addMetricToRecords.call(this, metric, since, sessionId, streamId, environment, version, value);

        deleteRecordsIfAtCapacity.call(this, since, sessionId, streamId, environment, version);

        sendBatchMessagesIfNonePending.call(this);
    };

    function createAndStartNetworkConnectionMonitor() {
        var that = this;
        var networkConnectionMonitor = new NetworkConnectionMonitor(networkDisconnectHysteresisInterval);

        function onReconnect() {
            that._isOffline = false;

            sendBatchMessagesIfNonePending.call(that);
        }

        function onDisconnect() {
            that._isOffline = true;
        }

        networkConnectionMonitor.start(onReconnect, onDisconnect);

        return networkConnectionMonitor;
    }

    function addMetricToRecords(metric, since, sessionId, streamId, environment, version, value) {
        var record = _.assign({}, value, {
            metric: metric,
            timestamp: _.isoString(),
            sessionId: sessionId,
            streamId: streamId,
            source: this._browser,
            fullQualifiedName: this._domain,
            environment: environment,
            version: version,
            runtime: since
        });

        this._records.push(record);
    }

    function deleteRecordsIfAtCapacity(since, sessionId, streamId, environment, version) {
        if (this._records.length > this._maxBufferedRecords) {
            var deleteRecords = this._records.length - (this._maxBufferedRecords / 2);

            this._records = this._records.slice(deleteRecords);
            this._records.unshift({
                timestamp: _.isoString(),
                sessionId: sessionId,
                streamId: streamId,
                source: this._browser,
                metric: 'MetricDropped',
                value: {uint64: deleteRecords},
                fullQualifiedName: this._domain,
                environment: environment,
                version: version,
                runtime: since
            });
        }
    }

    function sendBatchMessagesIfNonePending() {
        if (this._pending || !this._baseUri || !this._isEnabled || this._isOffline || this._records.length === 0) {
            return;
        }

        var submitMetricRecords = {records: _.take(this._records, this._maxBatchSize)};

        this._records = this._records.slice(this._maxBatchSize);
        this._pending = true;

        var that = this;

        try {
            sendEncodedHttpRequest.call(this, this._baseUri + this._loggingUrl, submitMetricRecords, function onTimeout() {
                setTimeout(function waitForDisconnectTimeout() {
                    if (!that._isOffline) {
                        return;
                    }

                    that._records = that._records.concat(submitMetricRecords.records);
                }, networkDisconnectHysteresisInterval);
            });
        } catch (e) {
            this._pending = false;

            throw e;
        }
    }

    function sendEncodedHttpRequest(url, dataToEncode, onTimeout) {
        var that = this;

        var data = this._protocol.encode('analytix.SubmitMetricRecords', dataToEncode).toBinary();

        function handlePost(error, result) {
            that._pending = false;

            if (error) {
                if (error.message === 'timeout') {
                    onTimeout();
                }

                return {
                    status: 'error',
                    storedRecords: 0
                };
            }

            return that._protocol.decode('analytix.SubmitMetricRecordsResponse', ByteBuffer.fromBinary(result));
        }

        http.postWithRetry(url, 'protobuf', data, handlePost, this._maxAttempts);
    }

    return MetricsTransmitter;
});