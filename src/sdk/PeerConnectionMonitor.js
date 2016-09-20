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
define('sdk/PeerConnectionMonitor', [
        'sdk/Time',
        'phenix-rtc'
], function (Time, phenixRTC) {
    'use strict';

    var defaultMonitoringInterval = 4000;
    var defaultConditionMonitoringInterval = 1500;
    var defaultFrameRateThreshold = 2;
    var defaultBitRateThreshold = 10000;
    var defaultConditionCountForNotificationThreshold = 3;

    function PeerConnectionMonitor(name, peerConnection, logger) {
        if (typeof name !== 'string') {
            throw new Error('Must pass a valid "name"');
        }
        if (typeof peerConnection !== 'object') {
            throw new Error('Must pass a valid "peerConnection"');
        }
        if (typeof logger !== 'object') {
            throw new Error('Must pass a valid "logger"');
        }
        this._name = name;
        this._peerConnection = peerConnection;
        this._logger = logger;
    }

    PeerConnectionMonitor.prototype.start = function (options, activeCallback, monitorCallback) {
        return monitorPeerConnection.call(this, this._name, this._peerConnection, options, activeCallback, monitorCallback);
    };

    PeerConnectionMonitor.prototype.toString = function () {
        return 'PeerConnectionMonitor[]';
    };


    function monitorPeerConnection(name, peerConnection, options, activeCallback, monitorCallback) {
        if (typeof name !== 'string') {
            throw new Error('Must pass a valid "name"');
        }
        if (typeof peerConnection !== 'object') {
            throw new Error('Must pass a valid "peerConnection"');
        }
        if (typeof options !== 'object') {
            throw new Error('Must pass a valid "options"');
        }
        if (typeof activeCallback !== 'function') {
            throw new Error('Must pass a valid "activeCallback"');
        }
        if (typeof monitorCallback !== 'function') {
            throw new Error('Must pass a valid "monitorCallback"');
        }
        if (options.direction !== 'inbound' && options.direction !== 'outbound') {
            throw new Error('Invalid monitoring direction');
        }

        var that = this;
        var conditionCount = 0;
        var frameRate = undefined;
        var bitRate = undefined;
        var lastBytesReceived = {time: Time.now(), value: 0};
        var frameRateFailureThreshold = options.frameRateThreshold || defaultFrameRateThreshold;
        var bitRateFailureThreshold = options.bitRateThreshold || defaultBitRateThreshold;
        var conditionCountForNotificationThreshold = options.conditionCountForNotificationThreshold || defaultConditionCountForNotificationThreshold;
        var monitoringInterval = options.monitoringInterval || defaultMonitoringInterval;
        var conditionMonitoringInterval = options.monitoringInterval || defaultConditionMonitoringInterval;
        var monitorFrameRate = options.monitorFrameRate || true;
        var monitorBitRate = options.monitorBitRate || true;
        var monitorState = options.monitorState || true;

        function nextCheck() {
            var selector = null;

            getStats(peerConnection, selector, function successCallback(report) {
                var hasFrameRate = false;
                var hasBitRate = false;

                function eachStats(stats, reportId) {
                    switch (phenixRTC.browser) {
                        case 'Firefox':
                            if (options.direction === 'outbound' && stats.type === 'outboundrtp') {
                                if (stats.framerateMean !== undefined) {
                                    hasFrameRate = true;
                                    frameRate = stats.framerateMean;

                                    if (stats.bytesSent !== undefined) {
                                        var currentBytesReceived = {
                                            time: Time.now(),
                                            value: stats.bytesSent
                                        };

                                        hasBitRate = true;
                                        bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                            / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                        lastBytesReceived = currentBytesReceived;
                                    }
                                }
                            }
                            if (options.direction === 'inbound' && stats.type === 'inboundrtp') {
                                if (stats.framerateMean !== undefined) {
                                    // Inbound frame rate is not calculated
                                    if (stats.bytesReceived !== undefined) {
                                        var currentBytesReceived = {
                                            time: Time.now(),
                                            value: stats.bytesReceived
                                        };

                                        hasBitRate = true;
                                        bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                            / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                        lastBytesReceived = currentBytesReceived;
                                    }
                                }
                            }
                            break;
                        default:
                            if (options.direction === 'outbound' && stats.googFrameRateSent !== undefined) {
                                hasFrameRate = true;
                                frameRate = stats.googFrameRateSent;

                                if (stats.bytesSent !== undefined) {
                                    var currentBytesReceived = {
                                        time: Time.now(),
                                        value: stats.bytesSent
                                    };

                                    hasBitRate = true;
                                    bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                        / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                    lastBytesReceived = currentBytesReceived;
                                }
                            } else if (options.direction === 'inbound' && stats.googFrameRateReceived !== undefined) {
                                hasFrameRate = true;
                                frameRate = stats.googFrameRateReceived;

                                if (stats.bytesReceived !== undefined) {
                                    var currentBytesReceived = {
                                        time: Time.now(),
                                        value: stats.bytesReceived
                                    };

                                    hasBitRate = true;
                                    bitRate = (8 * (currentBytesReceived.value - lastBytesReceived.value))
                                        / ((currentBytesReceived.time - lastBytesReceived.time) / 1000.0);
                                    lastBytesReceived = currentBytesReceived;
                                }
                            }
                            break;
                    }
                }

                if (report.forEach) {
                    report.forEach(eachStats);
                } else {
                    for (var reportId in report) {
                        var stats = report[reportId];

                        eachStats(stats, reportId);
                    }
                }

                if (hasFrameRate) {
                    that._logger.debug('[%s] Current frame rate is [%s] FPS', name, frameRate);
                }
                if (hasBitRate) {
                    that._logger.debug('[%s] Current bit rate is [%s] bps', name, Math.ceil(bitRate));
                }

                if (!activeCallback()) {
                    that._logger.info('[%s] Finished monitoring of peer connection', name);
                    return;
                }

                if (monitorState
                    && (peerConnection.connectionState === 'closed'
                    || peerConnection.connectionState === 'failed'
                    || peerConnection.iceConnectionState === 'failed')) {
                    conditionCount++;
                } else if (monitorFrameRate && frameRate !== undefined && !hasFrameRate) {
                    conditionCount++;
                } else if (monitorFrameRate && hasFrameRate && frameRate <= frameRateFailureThreshold) {
                    conditionCount++;
                } else if (monitorBitRate && bitRate !== undefined && !hasBitRate) {
                    conditionCount++;
                } else if (monitorBitRate && hasBitRate && bitRate <= bitRateFailureThreshold) {
                    conditionCount++;
                } else {
                    conditionCount = 0;
                }

                if (conditionCount >= conditionCountForNotificationThreshold) {
                    if (!monitorCallback('condition', frameRate, bitRate)) {
                        that._logger.error('[%s] Failure detected with frame rate [%s] FPS and bit rate [%s] bps: [%s]', name, frameRate, bitRate, report);
                    } else {
                        // Failure is acknowledged and muted
                        conditionCount = Number.MIN_VALUE;
                        setTimeout(nextCheck, monitoringInterval);
                    }
                } else {
                    setTimeout(nextCheck, conditionCount > 0 ? conditionMonitoringInterval : monitoringInterval);
                }
            }, function errorCallback(error) {
                monitorCallback('error', error);
            });
        }

        setTimeout(nextCheck, monitoringInterval);
    }

    function normalizeStatsReport(response) {
        if (phenixRTC.browser === 'Firefox') {
            return response;
        }

        var normalizedReport = {};

        response.result().forEach(function (report) {
            var normalizedStatistics = {
                id: report.id,
                type: report.type
            };

            report.names().forEach(function (name) {
                normalizedStatistics[name] = report.stat(name);
            });

            normalizedReport[normalizedStatistics.id] = normalizedStatistics;
        });

        return normalizedReport;
    }

    function getStats(peerConnection, selector, successCallback, monitorCallback) {
        switch (phenixRTC.browser) {
            case  'Firefox':
                return peerConnection.getStats(selector)
                    .then(function (response) {
                        var report = normalizeStatsReport(response);

                        successCallback(report);
                    }).catch(function (e) {
                        monitorCallback('error', e);
                    });
            default:
                return peerConnection.getStats(function (response) {
                    var report = normalizeStatsReport(response);

                    successCallback(report);
                }, selector, function (e) {
                    monitorCallback('error', e);
                });
        }
    }

    return PeerConnectionMonitor;
});