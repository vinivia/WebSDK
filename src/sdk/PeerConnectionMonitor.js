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
    'phenix-rtc'
], function (_, phenixRTC) {
    'use strict';

    var defaultMonitoringInterval = 4000;
    var defaultConditionMonitoringInterval = 1500;
    var defaultFrameRateThreshold = 2;
    var defaultAudioBitRateThreshold = 5000;
    var defaultVideoBitRateThreshold = 6000;
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
        var videoBitRate = undefined;
        var audioBitRate = undefined;
        var lastAudioBytes = {};
        var lastVideoBytes = {};
        var frameRateFailureThreshold = options.frameRateThreshold || defaultFrameRateThreshold;
        var videoBitRateFailureThreshold = options.videoBitRateThreshold || defaultVideoBitRateThreshold;
        var audioBitRateFailureThreshold = options.audioBitRateThreshold || defaultAudioBitRateThreshold;
        var conditionCountForNotificationThreshold = options.conditionCountForNotificationThreshold || defaultConditionCountForNotificationThreshold;
        var monitoringInterval = options.monitoringInterval || defaultMonitoringInterval;
        var conditionMonitoringInterval = options.monitoringInterval || defaultConditionMonitoringInterval;
        var monitorFrameRate = options.hasOwnProperty('monitorFrameRate') ? options.monitorFrameRate : true;
        var monitorBitRate = options.hasOwnProperty('monitorBitRate') ? options.monitorBitRate : true;
        var monitorState = options.hasOwnProperty('monitorState') ? options.monitorState : true;

        function nextCheck() {
            var selector = null;

            getStats(peerConnection, selector, function successCallback(report) {
                var hasFrameRate = false;
                var hasVideoBitRate = false;
                var hasAudioBitRate = false;
                var readable = false;
                var writable = false;

                function eachStats(stats, reportId) {
                    switch (phenixRTC.browser) {
                        case 'Firefox':
                            writable = readable |= stats.selected && stats.state === 'succeeded';

                            var trackId = stats.ssrc;

                            if (options.direction === 'outbound' && (stats.type === 'outboundrtp' || stats.type === 'outbound-rtp')) {
                                var currentBytes = new StatsBytes(stats.bytesSent);

                                switch (stats.mediaType) {
                                    case 'video':
                                        that._logger.debug('[%s] Outbound [%s] [%s] with bitrate [%s], droppedFrames [%s] and frame rate [%s]',
                                            name, stats.mediaType, stats.ssrc, stats.bitrateMean, stats.droppedFrames, stats.framerateMean);
                                        hasFrameRate = true;
                                        frameRate = stats.framerateMean || 0;
                                        hasVideoBitRate = true;
                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId]);
                                        lastVideoBytes[trackId] = currentBytes;
                                        break;
                                    case 'audio':
                                        that._logger.debug('[%s] Outbound [%s] [%s]',
                                            name, stats.mediaType, stats.ssrc);
                                        hasAudioBitRate = true;
                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId]);
                                        lastAudioBytes[trackId] = currentBytes;
                                        break;
                                }
                            }
                            if (options.direction === 'inbound' && (stats.type === 'inboundrtp' || stats.type === 'inbound-rtp')) {
                                var currentBytes = new StatsBytes(stats.bytesReceived);

                                switch (stats.mediaType) {
                                    case 'video':
                                        that._logger.debug('[%s] Inbound [%s] [%s] with framerate [%s] and jitter [%s]',
                                            name, stats.mediaType, stats.ssrc, stats.framerateMean, stats.jitter);

                                        // Inbound frame rate is not calculated correctly
                                        // hasFrameRate = true;
                                        // frameRate = stats.framerateMean || 0;
                                        hasVideoBitRate = true;
                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId]);
                                        lastVideoBytes[trackId] = currentBytes;
                                        break;
                                    case 'audio':
                                        that._logger.debug('[%s] Inbound [%s] [%s] with jitter [%s]',
                                            name, stats.mediaType, stats.ssrc, stats.jitter);
                                        hasAudioBitRate = true;
                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId]);
                                        lastAudioBytes[trackId] = currentBytes;
                                        break;
                                }
                            }
                            break;
                        default:
                            if (stats.googWritable === 'true') {
                                writable = true;
                            }
                            if (stats.googReadable === 'true') {
                                readable = true;
                            }
                            if (stats.type !== 'ssrc') {
                                return;
                            }

                            var trackId = stats.ssrc;

                            if (options.direction === 'outbound') {
                                var currentBytes = new StatsBytes(stats.bytesSent);

                                switch (stats.mediaType) {
                                    case 'video':
                                        that._logger.debug('[%s] Outbound [%s] [%s] with average encoding time [%s] ms (CPU limited=[%s]) and RTT [%s]',
                                            name, stats.mediaType, stats.ssrc, stats.googAvgEncodeMs, stats.googCpuLimitedResolution, stats.googRtt);
                                        hasFrameRate = true;
                                        frameRate = stats.googFrameRateSent || 0;
                                        hasVideoBitRate = true;
                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId]);
                                        lastVideoBytes[trackId] = currentBytes;
                                        break;
                                    case 'audio':
                                        that._logger.debug('[%s] Outbound [%s] [%s] with audio input level [%s] and RTT [%s] and jitter [%s]',
                                            name, stats.mediaType, stats.ssrc, stats.audioInputLevel, stats.googRtt, stats.googJitterReceived);
                                        hasAudioBitRate = true;
                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId]);
                                        lastAudioBytes[trackId] = currentBytes;
                                        break;
                                }
                            } else if (options.direction === 'inbound') {
                                var currentBytes = new StatsBytes(stats.bytesReceived);

                                switch (stats.mediaType) {
                                    case 'video':
                                        that._logger.debug('[%s] Inbound [%s] [%s] with current delay [%s] ms and target delay [%s] ms',
                                            name, stats.mediaType, stats.ssrc, stats.googCurrentDelayMs, stats.googTargetDelayMs);
                                        hasFrameRate = true;
                                        frameRate = stats.googFrameRateReceived || 0;
                                        hasVideoBitRate = true;
                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId]);
                                        lastVideoBytes[trackId] = currentBytes;
                                        break;
                                    case 'audio':
                                        that._logger.debug('[%s] Inbound [%s] [%s] with output level [%s] and jitter [%s] and jitter buffer [%s] ms',
                                            name, stats.mediaType, stats.ssrc, stats.audioOutputLevel, stats.googJitterReceived, stats.googJitterBufferMs);
                                        hasAudioBitRate = true;
                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId]);
                                        lastAudioBytes[trackId] = currentBytes;
                                        break;
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

                var hasActiveAudio = hasActiveAudioInSdp(peerConnection);
                var hasActiveVideo = hasActiveVideoInSdp(peerConnection);

                if (hasVideoBitRate && videoBitRate === 0 || hasAudioBitRate && audioBitRate === 0 || hasFrameRate && frameRate === 0) {
                    hasVideoBitRate = hasVideoBitRate && hasActiveVideo;
                    hasAudioBitRate = hasAudioBitRate && hasActiveAudio;
                    hasFrameRate = hasFrameRate && hasActiveVideo;

                    readable = readable || !(hasActiveVideo || hasActiveAudio);
                    writable = writable || !(hasActiveVideo || hasActiveAudio);
                }

                if (hasAudioBitRate || hasVideoBitRate || hasFrameRate) {
                    that._logger.debug('[%s] Current bit rate is [%s] bps for audio and [%s] bps for video with [%s] FPS',
                        name, Math.ceil(audioBitRate || 0), Math.ceil(videoBitRate || 0), frameRate || '?');
                }

                if (!activeCallback()) {
                    that._logger.info('[%s] Finished monitoring of peer connection', name);
                    return;
                }

                if (monitorState
                    && (peerConnection.connectionState === 'closed'
                    || peerConnection.connectionState === 'failed'
                    || peerConnection.iceConnectionState === 'failed')) {
                    var active = hasActiveAudio && hasActiveVideo;
                    var tracks = getAllTracks.call(that, peerConnection);

                    if (!active && hasMediaSectionsInSdp(peerConnection)) {
                        that._logger.info('[%s] Finished monitoring of peer connection with [%s] inactive tracks', name, tracks.length);
                        return;
                    }

                    conditionCount++;
                } else if (monitorFrameRate && hasFrameRate && frameRate <= frameRateFailureThreshold) {
                    conditionCount++;
                } else if (monitorBitRate && hasAudioBitRate && audioBitRate <= audioBitRateFailureThreshold) {
                    conditionCount++;
                } else if (monitorBitRate && hasVideoBitRate && videoBitRate <= videoBitRateFailureThreshold) {
                    conditionCount++;
                } else if (!readable || !writable) {
                    conditionCount++;
                } else {
                    conditionCount = 0;
                }

                if (conditionCount >= conditionCountForNotificationThreshold) {
                    if (!monitorCallback('condition', frameRate, videoBitRate, audioBitRate)) {
                        that._logger.error('[%s] Failure detected with frame rate [%s] FPS and bit rate [%s/%s] bps: [%s]', name, frameRate, audioBitRate, videoBitRate, report);
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

    function StatsBytes(value) {
        this.time = _.now();
        this.value = value || 0;
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

    function getAllTracks(peerConnection) {
        var localStreams = peerConnection.getLocalStreams();
        var remoteStreams = peerConnection.getRemoteStreams();
        var localTracks = [];
        var remoteTracks = [];

        _.forEach(localStreams, function(stream) {
            localTracks = localTracks.concat(stream.getTracks());
        });

        _.forEach(remoteStreams, function(stream) {
            remoteTracks = remoteTracks.concat(stream.getTracks());
        });

        if (localTracks.length !== 0 && remoteTracks.length !== 0) {
            this._logger.error('Invalid State. PeerConnection contains [%s] local and [%s] remote streams.', localStreams.length, remoteStreams.length);

            throw new Error('Invalid State. PeerConnection contains both local and remote streams.');
        } else if (localTracks.length !== 0) {
            return localTracks;
        } else if (remoteTracks.length !== 0) {
            return remoteTracks;
        }

        return [];
    }

    function hasMediaSectionsInSdp(peerConnection) {
        var indexOfSection = findInSdpSections(peerConnection, function(section) {
            return section.startsWith('video') || section.startsWith('audio');
        });

        return _.isNumber(indexOfSection);
    }

    function hasActiveAudioInSdp(peerConnection) {
        var indexOfActiveVideo = findInSdpSections(peerConnection, function(section, index, remoteSections) {
            if (section.startsWith('audio')) {
                return section.indexOf('a=inactive') === -1 && remoteSections[index].indexOf('a=inactive') === -1
            }

            return false;
        });

        return _.isNumber(indexOfActiveVideo);
    }

    function hasActiveVideoInSdp(peerConnection) {
        var indexOfActiveVideo = findInSdpSections(peerConnection, function(section, index, remoteSections) {
            if (section.startsWith('video')) {
                return section.indexOf('a=inactive') === -1 && remoteSections[index].indexOf('a=inactive') === -1
            }

            return false;
        });

        return _.isNumber(indexOfActiveVideo);
    }

    function findInSdpSections(peerConnection, callback) {
        var localSections = peerConnection.localDescription.sdp.split('m=');
        var remoteSections = peerConnection.remoteDescription.sdp.split('m=');

        if (localSections.length !== remoteSections.length) {
            return false;
        }

        return _.findIndex(localSections, function(section, index) {
            return callback(section, index, remoteSections);
        });
    }

    function calculateBitRate(currentBytes, lastBytes) {
        lastBytes = lastBytes || new StatsBytes();

        return (8 * (currentBytes.value - lastBytes.value))
            / ((currentBytes.time - lastBytes.time) / 1000.0);
    }

    return PeerConnectionMonitor;
});