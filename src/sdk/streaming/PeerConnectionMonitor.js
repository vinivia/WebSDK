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
    'phenix-web-event',
    'phenix-rtc',
    '../sdpUtil',
    './PeerConnection'
], function(_, assert, event, phenixRTC, sdpUtil, PeerConnection) {
    'use strict';

    var defaultMonitoringInterval = 4000;
    var defaultConditionMonitoringInterval = 1500;
    var defaultFrameRateThreshold = 2;
    var defaultAudioBitRateThreshold = 5000;
    var defaultVideoBitRateThreshold = 1000;
    var defaultConditionCountForNotificationThreshold = 3;
    var defaultTimeoutForNoData = 5000;
    var minMonitoringInterval = 500;
    var minEdgeMonitoringInterval = 6000;
    var minEdgeConditionCountForNotification = 2;

    function PeerConnectionMonitor(name, peerConnection, logger) {
        assert.isString(name, 'name');
        assert.isObject(peerConnection, 'peerConnection');
        assert.isObject(logger, 'logger');

        this._name = name;
        this._peerConnection = peerConnection;
        this._logger = logger;
        this._lastStats = {};
    }

    PeerConnectionMonitor.prototype.start = function(options, activeCallback, monitorCallback) {
        assert.isObject(options, 'options');
        assert.isFunction(activeCallback, 'activeCallback');
        assert.isFunction(monitorCallback, 'monitorCallback');

        if (options.direction !== 'inbound' && options.direction !== 'outbound') {
            throw new Error('Invalid monitoring direction');
        }

        var monitoringEnabled = options.hasOwnProperty('monitoringInterval') ? options.monitoringInterval > 0 : true;

        if (!monitoringEnabled) {
            this._logger.info('[%s] Monitoring is disabled', name);

            return;
        }

        this._frameRateFailureThreshold = options.frameRateThreshold || defaultFrameRateThreshold;
        this._videoBitRateFailureThreshold = options.videoBitRateThreshold || defaultVideoBitRateThreshold;
        this._audioBitRateFailureThreshold = options.audioBitRateThreshold || defaultAudioBitRateThreshold;
        this._conditionCountForNotificationThreshold = options.conditionCountForNotificationThreshold || defaultConditionCountForNotificationThreshold;
        this._monitoringInterval = Math.max(minMonitoringInterval, options.monitoringInterval || defaultMonitoringInterval);
        this._conditionMonitoringInterval = Math.max(minMonitoringInterval, options.conditionMonitoringInterval || defaultConditionMonitoringInterval);
        this._monitorFrameRate = options.hasOwnProperty('monitorFrameRate') ? options.monitorFrameRate : true;
        this._monitorBitRate = options.hasOwnProperty('monitorBitRate') ? options.monitorBitRate : true;
        this._monitorState = options.hasOwnProperty('monitorState') ? options.monitorState : true;
        this._pausedTracks = [];
        this._calculatedMetricsEvent = new event.Event();

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

        var peerConnectionTracks = getAllTracks.call(this, this._peerConnection);
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

    PeerConnectionMonitor.prototype.on = function(eventName, listener) {
        assert.isStringNotEmpty(eventName, 'eventName');
        assert.isFunction(listener, 'listener');

        switch (eventName) {
        case 'calculatedmetrics':
            return this._calculatedMetricsEvent.listen(listener);
        default:
            throw new Error('Unsupported event ' + eventName);
        }
    };

    PeerConnectionMonitor.prototype.toString = function() {
        return 'PeerConnectionMonitor[' + this._name + ']';
    };

    function monitorPeerConnection(name, peerConnection, options, activeCallback, monitorCallback) {
        var that = this;
        var conditionCount = 0;
        var reasons = [];
        var frameRate = undefined;
        var videoBitRate = undefined;
        var audioBitRate = undefined;
        var checkForNoDataTimeout = null;

        function nextCheck(checkForNoData) {
            var selector = null;

            getStats.call(that, peerConnection, options, selector, activeCallback, function successCallback(report) {
                var hasFrameRate = false;
                var hasVideoBitRate = false;
                var hasAudioBitRate = false;

                if (!activeCallback()) {
                    return that._logger.info('[%s] Finished monitoring of peer connection', name);
                }

                function eachStats(stats) {
                    var additionalMessage = '';

                    if (options.direction === 'outbound' && stats.direction === 'upload') {
                        switch (stats.mediaType) {
                        case 'video':
                            if (stats.avgEncode) {
                                additionalMessage += ' with average encoding time [' + stats.avgEncode + '] ms';
                            }

                            if (stats.cpuLimitedResolution) {
                                additionalMessage += ' (CPU limited=[' + stats.cpuLimitedResolution + '])';
                            }

                            that._logger.debug('[%s] [%s] [%s] [%s] with bitrate [%s], droppedFrames [%s] and frame rate [%s] and RTT [%s]' + additionalMessage,
                                name, options.direction, stats.mediaType, stats.ssrc, stats.bitrateMean, stats.droppedFrames, stats.framerateMean, stats.rtt);

                            frameRate = stats.framerateMean;
                            videoBitRate = stats.uploadRate ? stats.uploadRate * 1000 : stats.uploadRate;
                            hasFrameRate = true;
                            hasVideoBitRate = true;

                            if (phenixRTC.browser === 'Edge') {
                                hasFrameRate = false;
                            }

                            break;
                        case 'audio':
                            that._logger.debug('[%s] [%s] [%s] [%s] and RTT [%s] and jitter [%s] and audio input level [%s]',
                                name, options.direction, stats.mediaType, stats.ssrc, stats.rtt, stats.jitter, stats.audioInputLevel);
                            hasAudioBitRate = true;
                            audioBitRate = stats.uploadRate ? stats.uploadRate * 1000 : stats.uploadRate;

                            break;
                        default:
                            break;
                        }
                    }

                    if (options.direction === 'inbound' && stats.direction === 'download') {
                        switch (stats.mediaType) {
                        case 'video':
                            if (stats.currentDelay) {
                                additionalMessage += ' with current delay [' + stats.currentDelay + '] ms';
                            }

                            if (stats.targetDelay) {
                                additionalMessage += ' and target delay [' + stats.targetDelay + '] ms';
                            }

                            that._logger.debug('[%s] [%s] [%s] [%s] with framerate [%s]' + additionalMessage,
                                name, options.direction, stats.mediaType, stats.ssrc, stats.framerateMean);

                            // Inbound frame rate is not calculated correctly
                            hasFrameRate = true;
                            frameRate = stats.framerateMean || 0;
                            hasVideoBitRate = true;
                            videoBitRate = stats.downloadRate ? stats.downloadRate * 1000 : stats.downloadRate;

                            if (phenixRTC.browser === 'Edge') {
                                hasFrameRate = false;
                            }

                            break;
                        case 'audio':
                            if (stats.jitterBuffer) {
                                additionalMessage += ' with jitter buffer [' + stats.jitterBuffer + '] ms';
                            }

                            that._logger.debug('[%s] [%s] [%s] [%s] with jitter [%s]  with output level [%s]' + additionalMessage,
                                name, options.direction, stats.mediaType, stats.ssrc, stats.jitter, stats.audioOutputLevel);
                            hasAudioBitRate = true;
                            audioBitRate = stats.downloadRate ? stats.downloadRate * 1000 : stats.downloadRate;

                            break;
                        default:
                            break;
                        }
                    }
                }

                if (!report) {
                    throw new Error('Report must be a valid PeerConnection.getStats Report');
                }

                _.forEach(report, eachStats);

                if (_.isUndefined(audioBitRate) && _.isUndefined(videoBitRate)) {
                    return setTimeout(nextCheck, that._monitoringInterval); // First measurement
                }

                var hasActiveAudio = sdpUtil.hasActiveAudio(peerConnection);
                var hasActiveVideo = sdpUtil.hasActiveVideo(peerConnection);

                if (hasVideoBitRate && videoBitRate === 0 || hasAudioBitRate && audioBitRate === 0 || hasFrameRate && frameRate === 0) {
                    hasVideoBitRate = hasVideoBitRate && hasActiveVideo;
                    hasAudioBitRate = hasAudioBitRate && hasActiveAudio;
                    hasFrameRate = hasFrameRate && hasActiveVideo;
                }

                if (hasAudioBitRate || hasVideoBitRate || hasFrameRate) {
                    that._logger.debug('[%s] [%s] Current bit rate is [%s] bps for audio and [%s] bps for video with [%s] FPS',
                        name, options.direction, Math.ceil(audioBitRate || 0), Math.ceil(videoBitRate || 0), frameRate || '?');

                    if (_.values(that._lastStats).length > 0) {
                        that._calculatedMetricsEvent.fire([{
                            videoBitRate: videoBitRate,
                            audioBitRate: audioBitRate,
                            frameRate: frameRate
                        }]);
                    }
                }

                if (that._monitorState
                    && (peerConnection.connectionState === 'closed'
                    || peerConnection.connectionState === 'failed'
                    || peerConnection.iceConnectionState === 'failed')) {
                    var active = hasActiveAudio && hasActiveVideo;
                    var tracks = getAllTracks.call(that, peerConnection);

                    if (!active && sdpUtil.hasMediaSectionsInLocalSdp(peerConnection)) {
                        that._logger.info('[%s] [%s] Finished monitoring of peer connection with [%s] inactive tracks', name, options.direction, tracks.length);

                        return;
                    }

                    conditionCount++;
                    reasons.push('connection');
                } else if (that._monitorFrameRate && hasFrameRate && frameRate <= that._frameRateFailureThreshold && !areAllTracksOfTypePaused.call(that, 'video')) {
                    conditionCount++;
                    reasons.push('frameRate');
                } else if (that._monitorBitRate && hasAudioBitRate && audioBitRate <= that._audioBitRateFailureThreshold && !areAllTracksOfTypePaused.call(that, 'audio')) {
                    conditionCount++;
                    reasons.push('audioBitRate');
                } else if (that._monitorBitRate && hasVideoBitRate && videoBitRate <= that._videoBitRateFailureThreshold && !areAllTracksOfTypePaused.call(that, 'video')) {
                    conditionCount++;
                    reasons.push('videoBitRate');
                } else {
                    conditionCount = 0;
                    reasons = [];
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
                    that._logger.info('[%s] [%s] Failure has been acknowledged', name, options.direction);

                    conditionCount = Number.MIN_VALUE;
                    reasons = [];

                    setTimeout(nextCheck, that._monitoringInterval);
                };

                if (conditionCount >= that._conditionCountForNotificationThreshold || isStreamDead) {
                    var defaultFailureMessage = '[' + name + '] [' + options.direction + '] Failure detected with frame rate [' + frameRate + '] FPS,'
                        + ' audio bit rate [' + audioBitRate + '] bps'
                        + ', video bit rate [' + videoBitRate + '] bps'
                        + ', connection state [' + peerConnection.connectionState + '],'
                        + ' and ice connection state [' + peerConnection.iceConnectionState + ']'
                    + ' after [' + conditionCount + '] checks';
                    var streamDeadFailureMessage = '[' + name + '] [' + options.direction + '] Failure detected with 0 bps audio and video for [' + (defaultTimeoutForNoData / 1000) + '] seconds';
                    var failureMessage = isStreamDead ? streamDeadFailureMessage : defaultFailureMessage;
                    var monitorEvent = {
                        type: 'condition',
                        reasons: reasons,
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

    function getStats(peerConnection, options, selector, activeCallback, successCallback, errorCallback) {
        if (!activeCallback()) {
            return this._logger.info('[%s] Finished monitoring of peer connection', this._name);
        }

        var that = this;

        phenixRTC.getStats(peerConnection, null, function(response) {
            var report = PeerConnection.convertPeerConnectionStats(response, that._lastStats);

            report = _.filter(report, function(stats) {
                return options.direction === 'inbound' && stats.direction === 'download' || options.direction === 'outbound' && stats.direction === 'upload';
            });

            successCallback(report);
        }, function(error) {
            errorCallback(error);
        });
    }

    function getAllTracks(peerConnection) {
        var localTracks = getLocalTracks(peerConnection);
        var remoteTracks = getRemoteTracks(peerConnection);

        if (localTracks.length !== 0 && remoteTracks.length !== 0) {
            this._logger.error('Invalid State. PeerConnection contains [%s] local and [%s] remote tracks.', localTracks.length, remoteTracks.length);

            throw new Error('Invalid State. PeerConnection contains both local and remote streams.');
        } else if (localTracks.length !== 0) {
            return localTracks;
        } else if (remoteTracks.length !== 0) {
            return remoteTracks;
        }

        return [];
    }

    function getLocalTracks(peerConnection) {
        var tracks = peerConnection.getSenders ? _.map(peerConnection.getSenders(), function(receiver) {
            return receiver.track;
        }) : [];

        tracks = _.filter(tracks, function(track) {
            return !_.isNullOrUndefined(track);
        });

        if (tracks.length === 0) {
            var streams = peerConnection.getLocalStreams ? peerConnection.getLocalStreams() : [];

            return _.reduce(streams, function(tracks, stream) {
                return tracks.concat(stream.getTracks());
            }, []);
        }

        return tracks;
    }

    function getRemoteTracks(peerConnection) {
        var tracks = peerConnection.getReceivers ? _.map(peerConnection.getReceivers(), function(sender) {
            return sender.track;
        }) : [];

        tracks = _.filter(tracks, function(track) {
            return !_.isNullOrUndefined(track);
        });

        if (tracks.length === 0) {
            var streams = peerConnection.getRemoteStreams ? peerConnection.getRemoteStreams() : [];

            return _.reduce(streams, function(tracks, stream) {
                return tracks.concat(stream.getTracks());
            }, []);
        }

        return tracks;
    }

    function areAllTracksPaused() {
        var that = this;

        return _.reduce(getAllTracks.call(this, this._peerConnection), function(areAllPaused, track) {
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
        var peerConnectionTracks = getAllTracks.call(this, this._peerConnection);
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