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
    './LodashLight',
    './http'
], function (_, http) {
    'use strict';

    var measurementsPerEndPoint = 4;
    var endpointClosenessThreshold = 30;

    function ClosestEndPointResolver(onClosestEndpointFound, version, baseUri, logger) {
        this._done = false;
        this._minTime = Number.MAX_VALUE;
        this._minResponseText = '';
        this._onClosestEndpointFound = onClosestEndpointFound;
        this._logger = logger;
        this._version = version;
    }

    ClosestEndPointResolver.prototype.isResolved = function isResolved() {
        return this._done;
    };

    ClosestEndPointResolver.prototype.measurementCallback = function measurementCallback(endPoint, time, responseText) {
        if (time < this._minTime) {
            this._logger.info('Current closest end point is [%s] with latency of [%s] ms', responseText, time);
            this._minTime = time;
            this._minResponseText = responseText;
        }

        return this.isResolved();
    };

    ClosestEndPointResolver.prototype.completeCallback = function completeCallback(endPoint) { // eslint-disable-line no-unused-vars
        if (this._minResponseText && this._minTime < Number.MAX_VALUE && !this.isResolved()) {
            this._done = true;

            return this._onClosestEndpointFound(undefined, {
                uri: this._minResponseText,
                roundTripTime: this._minTime
            });
        }
    };

    ClosestEndPointResolver.prototype.resolveAll = function resolveAll(endPoints) {
        for (var i = 0; i < endPoints.length; i++) {
            this.resolve(endPoints[i], measurementsPerEndPoint);
        }
    };

    ClosestEndPointResolver.prototype.resolve = function resolve(endPoint, measurements) {
        var that = this;
        var measurement = 1;
        var successfulAttempts = 0;

        var nextMeasurement = function nextMeasurement(endPoint) {
            var maxAttempts = 1;
            var start = _.now();

            that._logger.info('[%s] Checking end point [%s]', measurement, endPoint);

            http.getWithRetry(endPoint, function (err, responseText) {
                var end = _.now();
                var time = end - start;
                var timeAboveThreshold = time > endpointClosenessThreshold;

                that._logger.info('[%s] End point [%s] latency is [%s] ms', measurement, endPoint, time);

                measurement++;

                if (!err) {
                    if (that.measurementCallback(endPoint, time, responseText)) {
                        // Done
                        return;
                    }

                    successfulAttempts++;
                }

                if (measurement <= measurements && !that.isResolved() && (timeAboveThreshold || err)) {
                    if (err) {
                        that._logger.info('Retrying after failure to resolve end point [%s] with [%s]', endPoint, err);
                    }

                    return nextMeasurement(endPoint);
                } else if (successfulAttempts === 0) {
                    return that._logger.warn('Unable to resolve end point [%s] with [%s]', endPoint, err);
                }

                return that.completeCallback(endPoint);
            }, maxAttempts);
        };

        nextMeasurement(endPoint);
    };

    return ClosestEndPointResolver;
});