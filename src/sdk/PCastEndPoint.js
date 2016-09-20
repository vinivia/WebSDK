/**
 * Copyright 2016 PhenixP2P Inc. All Rights Reserved.
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
define('sdk/PCastEndPoint', [
    'sdk/Time'
], function (Time) {
    'use strict';

    function PCastEndPoint(version, baseUri, logger) {
        if (typeof version !== 'string') {
            throw new Error('Must pass a valid "version"');
        }
        if (typeof baseUri !== 'string') {
            throw new Error('Must pass a valid "baseUri"');
        }
        if (typeof logger !== 'object') {
            throw new Error('Must pass a valid "logger"');
        }

        this._version = version;
        this._baseUri = baseUri;
        this._logger = logger;
    }

    PCastEndPoint.DefaultPCastUri = 'https://pcast.phenixp2p.com';

    PCastEndPoint.prototype.getBaseUri = function () {
        return this._baseUri;
    };

    PCastEndPoint.prototype.resolveUri = function (callback /* (error, uri) */) {
        return resolveUri.call(this, this._baseUri, callback);
    };

    PCastEndPoint.prototype.toString = function () {
        return 'PCastEndPoint[' + this._baseUri + ']';
    };

    function resolveUri(baseUri, callback /* (error, uri) */) {
        var that = this;

        if (baseUri.lastIndexOf('wss:', 0) === 0) {
            // WSS - Specific web socket end point
            callback.call(that, undefined, baseUri + '/ws');
        } else if (baseUri.lastIndexOf('https:', 0) === 0) {
            // HTTP - Resolve closest end point
            httpGetWithRetry.call(that, baseUri + '/pcast/endPoints', function (err, responseText) {
                if (err) {
                    callback(new Error('Failed to resolve an end point', err));
                    return callback(err);
                }

                var endPoints = responseText.split(',');

                if (endPoints.length < 1) {
                    callback(new Error('Failed to discover end points'));
                }

                var done = false;
                var minTime = Number.MAX_VALUE;
                var minResponseText = '';

                for (var i = 0; i < endPoints.length; i++) {
                    resolveEndPoint.call(that,
                        endPoints[i],
                        measurementsPerEndPoint,
                        function measurementCallback(endPoint, time, responseText) {
                            if (time < minTime) {
                                that._logger.info('Current closest end point is [%s] with latency of [%s] ms', responseText, time);
                                minTime = time;
                                minResponseText = responseText;
                            }

                            return done;
                        },
                        function completeCallback(endPoint) {
                            if (minResponseText && minTime < Number.MAX_VALUE) {
                                done = true;
                                return callback.call(that, undefined, minResponseText);
                            }
                        });
                }
            }, maxAttempts);
        } else {
            // Not supported
            callback.call(that, new Error('Uri not supported'));
        }
    }

    var measurementsPerEndPoint = 4;
    var maxAttempts = 3;

    function resolveEndPoint(endPoint, measurements, measurementCallback, completeCallback) {
        var that = this;
        var measurement = 1;

        var nextMeasurement = function nextMeasurement(endPoint) {
            var maxAttempts = 1;
            var start = Time.now();

            that._logger.info('[%s] Checking end point [%s]', measurement, endPoint);

            httpGetWithRetry.call(that, endPoint, function (err, responseText) {
                var end = Time.now();
                var time = end - start;

                that._logger.info('[%s] End point [%s] latency is [%s] ms', measurement, endPoint, time);

                measurement++;

                if (!err) {
                    if (measurementCallback(endPoint, time, responseText)) {
                        // done
                        return;
                    }
                }

                if (measurement <= measurements) {
                    if (err) {
                        that._logger.info('Retrying after failure to resolve end point [%s]', endPoint, err);
                    }

                    return nextMeasurement(endPoint);
                } else {
                    return completeCallback(endPoint);
                }
            }, maxAttempts);
        };

        nextMeasurement(endPoint);
    }

    function httpGetWithRetry(url, callback, maxAttempts, attempt) {
        if (attempt === undefined) {
            attempt = 1;
        }

        var that = this;
        var xhr = new XMLHttpRequest();

        xhr.timeout = 15000;

        xhr.open('GET', url + '?version=' + encodeURIComponent(that._version) + '&_=' + Time.now(), true);

        xhr.addEventListener('readystatechange', function () {
            if (xhr.readyState === 4 /* DONE */) {
                if (xhr.status === 200) {
                    callback(undefined, xhr.responseText);
                } else if (xhr.status >= 500 && xhr.status < 600 && attempt <= maxAttempts) {
                    httpGetWithRetry.call(that, url, callback, maxAttempts, attempt + 1);
                } else {
                    that._logger.info('HTTP GET [%s] failed with [%s] [%s]', url, xhr.status. xhr.statusText);

                    var err = new Error(xhr.status === 0 ? 'timeout' : xhr.statusText);

                    err.code = xhr.status;

                    callback(err);
                }
            }
        });

        xhr.send();
    }

    return PCastEndPoint;
});
