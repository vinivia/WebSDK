/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
    'phenix-rtc'
], function(_, assert, phenixRTC) {
    'use strict';

    var defaultMonitoringInterval = 4000;
    var defaultConditionMonitoringInterval = 1500;
    var defaultFrameRateThreshold = 2;
    var defaultAudioBitRateThreshold = 5000;
    var defaultVideoBitRateThreshold = 6000;
    var defaultConditionCountForNotificationThreshold = 3;
    var defaultTimeoutForNoData = 5000;
    var minEdgeMonitoringInterval = 6000;
    var minEdgeConditionCountForNotification = 2;

    function PeerConnectionMonitor(name, peerConnection, logger) {
        assert.isString(name, 'name');
        assert.isObject(peerConnection, 'peerConnection');
        assert.isObject(logger, 'logger');

        this._name = name;
        this._peerConnection = peerConnection;
        this._logger = logger;
    }

    PeerConnectionMonitor.prototype.start = function(options, activeCallback, monitorCallback) {
        assert.isObject(options, 'options');
        assert.isFunction(activeCallback, 'activeCallback');
        assert.isFunction(monitorCallback, 'monitorCallback');

        if (options.direction !== 'inbound' && options.direction !== 'outbound') {
            throw new Error('Invalid monitoring direction');
        }

        this._frameRateFailureThreshold = options.frameRateThreshold || defaultFrameRateThreshold;
        this._videoBitRateFailureThreshold = options.videoBitRateThreshold || defaultVideoBitRateThreshold;
        this._audioBitRateFailureThreshold = options.audioBitRateThreshold || defaultAudioBitRateThreshold;
        this._conditionCountForNotificationThreshold = options.conditionCountForNotificationThreshold || defaultConditionCountForNotificationThreshold;
        this._monitoringInterval = options.monitoringInterval || defaultMonitoringInterval;
        this._conditionMonitoringInterval = options.monitoringInterval || defaultConditionMonitoringInterval;
        this._monitorFrameRate = options.hasOwnProperty('monitorFrameRate') ? options.monitorFrameRate : true;
        this._monitorBitRate = options.hasOwnProperty('monitorBitRate') ? options.monitorBitRate : true;
        this._monitorState = options.hasOwnProperty('monitorState') ? options.monitorState : true;
        this._pausedTracks = [];

        if (phenixRTC.browser === 'Edge') {
            var conditionMaxDuration = this._conditionMonitoringInterval * this._conditionCountForNotificationThreshold;

            this._monitoringInterval = Math.max(this._monitoringInterval, minEdgeMonitoringInterval);
            this._conditionMonitoringInterval = Math.max(this._conditionMonitoringInterval, minEdgeMonitoringInterval);
            this._conditionCountForNotificationThreshold = Math.max(Math.ceil(conditionMaxDuration / this._monitoringInterval), minEdgeConditionCountForNotification);

            this._logger.info('Using modified options for optimal monitoring of PeerConnection on [Edge]. Monitor Interval [%s], Condition Monitor Interval [%s], Condition Count For Notification [%s]',
                this._monitoringInterval, this._conditionMonitoringInterval, this._conditionCountForNotificationThreshold);
        }

        return monitorPeerConnection.call(this, this._name, this._peerConnection, options, activeCallback, monitorCallback);
    };

    PeerConnectionMonitor.prototype.setMonitorTrackState = function(track, state) {
        assert.isObject(track, 'track');
        assert.isBoolean(state, 'state');

        var peerConnectionTracks = getAllTracks(this._peerConnection);
        var foundTrack = !!_.find(peerConnectionTracks, function(pcTrack) {
            return pcTrack.id === track.id;
        });

        if (!foundTrack) {
            return this._logger.warn('[%s] Unable to find track [%s] [%s] in peer connection', this._name, track.kind, track.id);
        }

        if (!state) {
            this._logger.info('[%s] Pausing monitoring of track [%s] [%s]', this._name, track.kind, track.id);

            return this._pausedTracks.push(track);
        }

        var pausedTrackLength = this._pausedTracks.length;

        this._pausedTracks = _.filter(this._pausedTracks, function(pausedTrack) {
            return pausedTrack.id !== track.id;
        });

        if (pausedTrackLength !== this._pausedTracks.length) {
            this._logger.info('[%s] Starting monitoring of track [%s] [%s] after it was paused', this._name, track.kind, track.id);
        }
    };

    PeerConnectionMonitor.prototype.toString = function() {
        return 'PeerConnectionMonitor[' + this._name + ']';
    };

    function monitorPeerConnection(name, peerConnection, options, activeCallback, monitorCallback) {
        var that = this;
        var conditionCount = 0;
        var frameRate = undefined;
        var videoBitRate = undefined;
        var audioBitRate = undefined;
        var lastAudioBytes = {};
        var lastVideoBytes = {};
        var lastFramesEncoded = {};
        var checkForNoDataTimeout = null;

        function nextCheck(checkForNoData) {
            var selector = null;

            getStats.call(that, peerConnection, selector, activeCallback, function successCallback(report) {
                var hasFrameRate = false;
                var hasVideoBitRate = false;
                var hasAudioBitRate = false;
                var readable = false;
                var writable = false;

                if (!activeCallback()) {
                    return that._logger.info('[%s] Finished monitoring of peer connection', name);
                }

                function eachStats(stats, reportId) { // eslint-disable-line no-unused-vars
                    var trackId = stats.id || stats.ssrc;
                    var currentBytes = null;

                    if (stats.framesEncoded) {
                        var framesEncoded = new Stats(stats.framesEncoded);

                        stats.framerateMean = calculateFrameRate(framesEncoded, lastFramesEncoded[trackId], that._frameRateFailureThreshold * 2);
                        lastFramesEncoded[trackId] = framesEncoded;
                    }

                    switch (phenixRTC.browser) {
                    case 'Safari':
                    case 'Firefox':
                    case 'Edge':
                    case 'IE':
                        writable = readable |= stats.selected &&
                            stats.state === 'succeeded' ||
                            phenixRTC.browser === 'IE' ||
                            phenixRTC.browser === 'Edge' ||
                            phenixRTC.browser === 'Safari';

                        if (options.direction === 'outbound' && (stats.type === 'outboundrtp' || stats.type === 'outbound-rtp' || stats.type === 'kOutboundRtp')) {
                            currentBytes = new Stats(stats.bytesSent);

                            switch (stats.mediaType) {
                            case 'video':
                                that._logger.debug('[%s] Outbound [%s] [%s] with bitrate [%s], droppedFrames [%s] and frame rate [%s]',
                                    name, stats.mediaType, stats.ssrc, stats.bitrateMean, stats.droppedFrames, stats.framerateMean);
                                hasFrameRate = true;
                                frameRate = stats.framerateMean || 0;
                                hasVideoBitRate = true;
                                videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId], that._videoBitRateFailureThreshold * 2);
                                lastVideoBytes[trackId] = currentBytes;

                                if (phenixRTC.browser === 'Edge') {
                                    hasFrameRate = false;
                                }

                                break;
                            case 'audio':
                                that._logger.debug('[%s] Outbound [%s] [%s]',
                                    name, stats.mediaType, stats.ssrc);
                                hasAudioBitRate = true;
                                audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId], that._audioBitRateFailureThreshold * 2);
                                lastAudioBytes[trackId] = currentBytes;

                                break;
                            default:
                                break;
                            }
                        }

                        if (options.direction === 'inbound' && (stats.type === 'inboundrtp' || stats.type === 'inbound-rtp' || stats.type === 'kInboundRtp')) {
                            currentBytes = new Stats(stats.bytesReceived);

                            switch (stats.mediaType) {
                            case 'video':
                                that._logger.debug('[%s] Inbound [%s] [%s] with framerate [%s] and jitter [%s]',
                                    name, stats.mediaType, stats.ssrc, stats.framerateMean, stats.jitter);

                                // Inbound frame rate is not calculated correctly
                                // hasFrameRate = true;
                                // frameRate = stats.framerateMean || 0;
                                hasVideoBitRate = true;
                                videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId], that._videoBitRateFailureThreshold * 2);
                                lastVideoBytes[trackId] = currentBytes;

                                break;
                            case 'audio':
                                that._logger.debug('[%s] Inbound [%s] [%s] with jitter [%s]',
                                    name, stats.mediaType, stats.ssrc, stats.jitter);
                                hasAudioBitRate = true;
                                audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId], that._audioBitRateFailureThreshold * 2);
                                lastAudioBytes[trackId] = currentBytes;

                                break;
                            default:
                                break;
                            }
                        }

                        break;
                    case 'Chrome':
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

                        if (options.direction === 'outbound') {
                            currentBytes = new Stats(stats.bytesSent);

                            switch (stats.mediaType) {
                            case 'video':
                                that._logger.debug('[%s] Outbound [%s] [%s] with average encoding time [%s] ms (CPU limited=[%s]) and RTT [%s]',
                                    name, stats.mediaType, stats.ssrc, stats.googAvgEncodeMs, stats.googCpuLimitedResolution, stats.googRtt);
                                hasFrameRate = true;
                                frameRate = stats.googFrameRateSent || 0;
                                hasVideoBitRate = true;
                                videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId], that._videoBitRateFailureThreshold * 2);
                                lastVideoBytes[trackId] = currentBytes;

                                break;
                            case 'audio':
                                that._logger.debug('[%s] Outbound [%s] [%s] with audio input level [%s] and RTT [%s] and jitter [%s]',
                                    name, stats.mediaType, stats.ssrc, stats.audioInputLevel, stats.googRtt, stats.googJitterReceived);
                                hasAudioBitRate = true;
                                audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId], that._audioBitRateFailureThreshold * 2);
                                lastAudioBytes[trackId] = currentBytes;

                                break;
                            default:
                                break;
                            }
                        } else if (options.direction === 'inbound') {
                            currentBytes = new Stats(stats.bytesReceived);

                            switch (stats.mediaType) {
                            case 'video':
                                that._logger.debug('[%s] Inbound [%s] [%s] with current delay [%s] ms and target delay [%s] ms',
                                    name, stats.mediaType, stats.ssrc, stats.googCurrentDelayMs, stats.googTargetDelayMs);
                                hasFrameRate = true;
                                frameRate = stats.googFrameRateReceived || 0;
                                hasVideoBitRate = true;
                                videoBitRate = calculateBitRate(currentBytes, lastVideoBytes[trackId], that._videoBitRateFailureThreshold * 2);
                                lastVideoBytes[trackId] = currentBytes;

                                break;
                            case 'audio':
                                that._logger.debug('[%s] Inbound [%s] [%s] with output level [%s] and jitter [%s] and jitter buffer [%s] ms',
                                    name, stats.mediaType, stats.ssrc, stats.audioOutputLevel, stats.googJitterReceived, stats.googJitterBufferMs);
                                hasAudioBitRate = true;
                                audioBitRate = calculateBitRate(currentBytes, lastAudioBytes[trackId], that._audioBitRateFailureThreshold * 2);
                                lastAudioBytes[trackId] = currentBytes;

                                break;
                            default:
                                break;
                            }
                        }

                        break;
                    }
                }

                if (!report) {
                    throw new Error('Report must be a valid PeerConnection.getStats Report');
                }

                if (report.forEach) {
                    report.forEach(eachStats);
                } else {
                    _.forOwn(report, function(stats, reportId) {
                        eachStats(stats, reportId);
                    });
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

                if (that._monitorState
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
                } else if (that._monitorFrameRate && hasFrameRate && frameRate <= that._frameRateFailureThreshold && !areAllTracksOfTypePaused.call(that, 'video')) {
                    conditionCount++;
                } else if (that._monitorBitRate && hasAudioBitRate && audioBitRate <= that._audioBitRateFailureThreshold && !areAllTracksOfTypePaused.call(that, 'audio')) {
                    conditionCount++;
                } else if (that._monitorBitRate && hasVideoBitRate && videoBitRate <= that._videoBitRateFailureThreshold && !areAllTracksOfTypePaused.call(that, 'video')) {
                    conditionCount++;
                } else if (!readable || !writable) {
                    conditionCount++;
                } else {
                    conditionCount = 0;
                }

                var isNoData = (videoBitRate === 0 || !hasVideoBitRate) && (audioBitRate === 0 || !hasAudioBitRate) && !areAllTracksPaused.call(that);

                if (isNoData && !checkForNoDataTimeout) {
                    checkForNoDataTimeout = setTimeout(_.bind(nextCheck, this, true), defaultTimeoutForNoData);
                } else if (!isNoData) {
                    clearTimeout(checkForNoDataTimeout);

                    checkForNoDataTimeout = null;
                }

                var isStreamDead = checkForNoData && isNoData && checkForNoDataTimeout;
                var acknowledgeFailure = function acknowledgeFailure() {
                    that._logger.info('[%s] Failure has been acknowledged', name);

                    conditionCount = Number.MIN_VALUE;

                    setTimeout(nextCheck, that._monitoringInterval);
                };

                if (conditionCount >= that._conditionCountForNotificationThreshold || isStreamDead) {
                    var defaultFailureMessage = '[' + name + '] Failure detected with frame rate [' + frameRate + '] FPS, audio bit rate [' + audioBitRate + '] bps, and video bit rate [' + videoBitRate + '] bps';
                    var streamDeadFailureMessage = '[' + name + '] Failure detected with 0 bps audio and video for [' + (defaultTimeoutForNoData / 1000) + '] seconds';
                    var failureMessage = isStreamDead ? streamDeadFailureMessage : defaultFailureMessage;
                    var monitorEvent = {
                        type: 'condition',
                        message: failureMessage,
                        report: report,
                        frameRate: frameRate,
                        videoBitRate: videoBitRate,
                        audioBitRate: audioBitRate,
                        acknowledgeFailure: acknowledgeFailure
                    };

                    if (!monitorCallback(null, monitorEvent)) {
                        that._logger.error(failureMessage + ': [%s]', report);
                    } else {
                        acknowledgeFailure();
                    }
                } else {
                    setTimeout(nextCheck, conditionCount > 0 ? that._conditionMonitoringInterval : that._monitoringInterval);
                }
            }, function errorCallback(error) {
                monitorCallback(error, {
                    type: 'error',
                    message: 'Unable to get Connection statistics. Connection may have failed.'
                });
            });
        }

        setTimeout(nextCheck, that._monitoringInterval);
    }

    function Stats(value) {
        this.time = _.now();
        this.value = value || 0;
    }

    function normalizeStatsReport(response) {
        var normalizedReport = {};

        switch (phenixRTC.browser) {
        case 'Firefox':
            return response;
        case 'IE':
            _.forOwn(response, function(value, key) {
                if (!_.startsWith(key, 'ssrc')) {
                    return;
                }

                normalizedReport[value.id] = value;
            });

            return normalizedReport;
        case 'Safari':
        case 'Edge':
            response.forEach(function(report) {
                normalizedReport[report.id] = report;
            });

            return normalizedReport;
        case 'ReactNative':
            var stats = _.isString(response) ? JSON.parse(response) : response;

            stats.forEach(function(report) {
                var normalizedStatistics = {
                    id: report.id,
                    type: report.type
                };

                report.values.forEach(function(value) {
                    _.keys(value).forEach(function(key) {
                        normalizedStatistics[key] = value[key];
                    });
                });

                normalizedReport[normalizedStatistics.id] = normalizedStatistics;
            });

            return normalizedReport;
        case 'Chrome':
        default:
            response.result().forEach(function(report) {
                var normalizedStatistics = {
                    id: report.id,
                    type: report.type
                };

                report.names().forEach(function(name) {
                    normalizedStatistics[name] = report.stat(name);
                });

                normalizedReport[normalizedStatistics.id] = normalizedStatistics;
            });

            return normalizedReport;
        }
    }

    function getStats(peerConnection, selector, activeCallback, successCallback, errorCallback) {
        if (!activeCallback()) {
            return this._logger.info('[%s] Finished monitoring of peer connection', this._name);
        }

        phenixRTC.getStats(peerConnection, null, function(response) {
            var report = normalizeStatsReport(response);

            successCallback(report);
        }, function(error) {
            errorCallback(error);
        });
    }

    function getAllTracks(peerConnection) {
        var localStreams = peerConnection.getLocalStreams ? peerConnection.getLocalStreams() : [];
        var remoteStreams = peerConnection.getRemoteStreams ? peerConnection.getRemoteStreams() : [];
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
            return _.startsWith(section, 'video') || _.startsWith(section, 'audio');
        });

        return _.isNumber(indexOfSection);
    }

    function hasActiveAudioInSdp(peerConnection) {
        var indexOfActiveVideo = findInSdpSections(peerConnection, function(section, index, remoteSections) {
            if (_.startsWith(section, 'audio')) {
                return !_.includes(section, 'a=inactive') && !_.includes(remoteSections[index], 'a=inactive');
            }

            return false;
        });

        return _.isNumber(indexOfActiveVideo);
    }

    function hasActiveVideoInSdp(peerConnection) {
        var indexOfActiveVideo = findInSdpSections(peerConnection, function(section, index, remoteSections) {
            if (_.startsWith(section, 'video')) {
                return !_.includes(section, 'a=inactive') && !_.includes(remoteSections[index], 'a=inactive');
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

    function calculateFrameRate(currentFramesEncoded, lastFramesEncoded, defaultFrameRate) {
        if (!lastFramesEncoded) {
            return defaultFrameRate;
        }

        return (currentFramesEncoded.value - lastFramesEncoded.value)
            / ((currentFramesEncoded.time - lastFramesEncoded.time) / 1000.0);
    }

    function calculateBitRate(currentBytes, lastBytes, defaultBitRate) {
        if (!lastBytes) {
            return defaultBitRate;
        }

        return (8 * (currentBytes.value - lastBytes.value))
            / ((currentBytes.time - lastBytes.time) / 1000.0);
    }

    function areAllTracksPaused() {
        var that = this;

        return _.reduce(getAllTracks(this._peerConnection), function(areAllPaused, track) {
            if (!areAllPaused) {
                return areAllPaused;
            }

            var isTrackPaused = !!_.find(that._pausedTracks, function(pcTrack) {
                return pcTrack.id === track.id;
            });

            return !track.enabled || isTrackPaused;
        }, true);
    }

    function areAllTracksOfTypePaused(kind) {
        var peerConnectionTracks = getAllTracks(this._peerConnection);
        var pcTracksOfType = _.filter(peerConnectionTracks, function(track) {
            return track.kind === kind;
        });
        var pausedTracksOfType = _.filter(this._pausedTracks, function(track) {
            return track.kind === kind;
        });

        return _.reduce(pcTracksOfType, function(areAllPaused, track) {
            if (!areAllPaused) {
                return areAllPaused;
            }

            var isTrackPaused = !!_.find(pausedTracksOfType, function(pcTrack) {
                return pcTrack.id === track.id;
            });

            return !track.enabled || isTrackPaused;
        }, true);
    }

    return PeerConnectionMonitor;
});