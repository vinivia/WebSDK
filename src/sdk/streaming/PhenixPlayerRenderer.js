/**
 * Copyright 2018 Phenix Inc. All Rights Reserved.
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
    'phenix-web-logging',
    'phenix-web-event',
    'phenix-web-http',
    'phenix-web-player',
    'phenix-rtc',
    '../DimensionsChangedMonitor',
    './stream.json'
], function(_, assert, logging, event, http, phenixWebPlayer, rtc, DimensionsChangedMonitor, streamEnums) {
    'use strict';

    var bandwidthAt720 = 3000000;

    function PhenixPlayerRenderer(streamId, uri, streamTelemetry, options, logger) {
        this._logger = logger;
        this._streamId = streamId;
        this._manifestUri = encodeURI(uri).replace(/[#]/g, '%23');
        this._streamTelemetry = streamTelemetry;
        this._options = options;
        this._renderer = null;
        this._element = null;
        this._dimensionsChangedMonitor = new DimensionsChangedMonitor(logger);
        this._lastProgress = {
            time: 0,
            buffered: null,
            averageLength: 0,
            count: 0
        };
        this._namedEvents = new event.NamedEvents();

        this._onStalled = _.bind(stalled, this);
        this._onProgress = _.bind(onProgress, this);
        this._onEnded = _.bind(ended, this);
    }

    PhenixPlayerRenderer.isSupported = function() {
        return phenixWebPlayer.isSupported;
    };

    PhenixPlayerRenderer.prototype.on = function(name, callback) {
        return this._namedEvents.listen(name, callback);
    };

    PhenixPlayerRenderer.prototype.start = function(elementToAttachTo) {
        var that = this;
        var loggerAtWarningThreshold = createWarningThresholdLogger(this._logger);
        var playlist = new phenixWebPlayer.Playlist(loggerAtWarningThreshold, this._manifestUri);

        playlist.fetch(function(err) {
            if (err) {
                throw new Error(err);
            }

            var statsProvider = new phenixWebPlayer.StatsProvider(loggerAtWarningThreshold, {ewmaPeriods: 30});
            var playerOptions = {bandwidthToStartAt: that._options.bandwidthToStartAt || bandwidthAt720};
            var chunksFeeder;

            if (playlist.getDeliveryType() === 'Dash') {
                chunksFeeder = new phenixWebPlayer.MpdPlaylistChunkFeeder(loggerAtWarningThreshold, playlist, statsProvider, {});

                if (that._options.isDrmProtectedContent) {
                    playerOptions.drm = {
                        'com.widevine.alpha': {
                            serverCertificateUrl: that._options.widevineServiceCertificateUrl,
                            mediaKeySystemConfiguration: {persistentState: 'required'}
                        }
                    };
                }
            } else if (playlist.getDeliveryType() === 'Hls') {
                chunksFeeder = new phenixWebPlayer.M3u8PlaylistChunkFeeder(loggerAtWarningThreshold, playlist, statsProvider, {});
            }

            var webPlayer = new phenixWebPlayer.WebPlayer(loggerAtWarningThreshold, playlist, elementToAttachTo, chunksFeeder, playerOptions);
            var adaptiveStreamingManagerIgnored = new phenixWebPlayer.AdaptiveStreamingManager(loggerAtWarningThreshold, playlist, webPlayer, statsProvider);

            webPlayer.start();

            that._player = webPlayer;
            that._statsProvider = statsProvider;

            _.addEventListener(that._player, 'error', function(e) {
                that._namedEvents.fire(streamEnums.rendererEvents.error.name, ['phenix', e]);
            });
        });

        if (that._options.receiveAudio === false) {
            elementToAttachTo.muted = true;
        }

        _.addEventListener(elementToAttachTo, 'stalled', that._onStalled, false);
        _.addEventListener(elementToAttachTo, 'pause', that._onStalled, false);
        _.addEventListener(elementToAttachTo, 'suspend', that._onStalled, false);
        _.addEventListener(elementToAttachTo, 'progress', that._onProgress, false);
        _.addEventListener(elementToAttachTo, 'ended', that._onEnded, false);

        that._dimensionsChangedMonitor.start(this, elementToAttachTo);
        that._element = elementToAttachTo;

        return elementToAttachTo;
    };

    PhenixPlayerRenderer.prototype.stop = function(reason, waitForLastChunk) {
        var that = this;

        if (that._waitingForFinalization) {
            return;
        }

        if (waitForLastChunk) {
            return that._waitForLastChunk = true;
        }

        this._dimensionsChangedMonitor.stop();

        this._streamTelemetry.stop();

        if (this._player) {
            var finalizeStreamEnded = function finalizeStreamEnded() {
                var reason = '';

                if (that._element) {
                    _.removeEventListener(that._element, 'stalled', that._onStalled, false);
                    _.removeEventListener(that._element, 'pause', that._onStalled, false);
                    _.removeEventListener(that._element, 'suspend', that._onStalled, false);
                    _.removeEventListener(that._element, 'progress', that._onProgress, false);
                    _.removeEventListener(that._element, 'ended', that._onEnded, false);

                    if (rtc.browser === 'Edge') {
                        that._element.src = '';
                    }
                }

                that._namedEvents.fire(streamEnums.rendererEvents.ended.name, [reason]);

                that._player = null;
                that._element = null;
            };

            that._waitingForFinalization = true;

            try {
                that._player.dispose();

                that._logger.info('[%s] Phenix live stream has been destroyed', that._streamId);

                finalizeStreamEnded();
            } catch (e) {
                that._logger.error('[%s] Error while destroying Phenix live stream player [%s]', that._streamId, e.code, e);

                finalizeStreamEnded();

                that._namedEvents.fire(streamEnums.rendererEvents.error.name, ['phenix', e]);
            }
        }
    };

    PhenixPlayerRenderer.prototype.getStats = function() {
        if (!this._statsProvider || !this._player) {
            return {
                width: 0,
                height: 0,
                currentTime: 0.0,
                lag: 0.0,
                networkState: streamEnums.networkStates.networkNoSource.id
            };
        }

        var stat = _.assign(this._statsProvider.getRateAverages(), {
            currentTime: 0,
            lag: 0
        });
        var currentTime = _.get(this._element, ['currentTime'], 0);
        var trueCurrentTime = (_.now() - this._options.originStartTime) / 1000;
        var lag = Math.max(0.0, trueCurrentTime - currentTime);

        if (this._element) {
            stat.currentTime = currentTime;
            stat.lag = lag;
        }

        if (stat.estimatedBandwidth > 0) {
            stat.networkState = streamEnums.networkStates.networkLoading.id;
        } else if (stat.playTime > 0) {
            stat.networkState = streamEnums.networkStates.networkIdle.id;
        } else if (stat.video) {
            stat.networkState = streamEnums.networkStates.networkEmpty.id;
        } else {
            stat.networkState = streamEnums.networkStates.networkNoSource.id;
        }

        return stat;
    };

    PhenixPlayerRenderer.prototype.setDataQualityChangedCallback = function(callback) {
        assert.isFunction(callback, 'callback');

        this.dataQualityChangedCallback = callback;
    };

    PhenixPlayerRenderer.prototype.getPlayer = function() {
        return this._player;
    };

    PhenixPlayerRenderer.prototype.addVideoDisplayDimensionsChangedCallback = function(callback, options) {
        this._dimensionsChangedMonitor.addVideoDisplayDimensionsChangedCallback(callback, options);
    };

    function onProgress() {
        this._lastProgress.time = _.now();

        if (this._element.buffered.length === 0) {
            return this._logger.debug('[%s] Phenix live stream player progress event fired without any buffered content', this._streamId);
        }

        var bufferedEnd = this._element.buffered.end(this._element.buffered.length - 1);

        if (this._lastProgress.buffered === bufferedEnd) {
            return;
        }

        // Start and end times are unreliable for overall length of stream.
        if (this._lastProgress.buffered !== null) {
            var oldTimeElapsed = this._lastProgress.averageLength * this._lastProgress.count;
            var newTimeElapsed = oldTimeElapsed + (bufferedEnd - this._lastProgress.buffered);

            this._lastProgress.count += 1;
            this._lastProgress.averageLength = newTimeElapsed / this._lastProgress.count;
        }

        this._lastProgress.buffered = bufferedEnd;
    }

    function stalled(event) {
        var that = this;

        that._logger.info('[%s] Loading Phenix Live stream player stalled caused by [%s] event.', that._streamId, event.type);

        if (that._lastProgress.time === 0) {
            return;
        }

        setTimeout(function() {
            if (_.now() - that._lastProgress.time > getTimeoutOrMinimum.call(that) && that._waitForLastChunk) {
                that.stop('ended');
            }
        }, getTimeoutOrMinimum.call(that));
    }

    function getTimeoutOrMinimum() {
        return this._lastProgress.averageLength * 1.5 < 2000 ? 2000 : this._lastProgress.averageLength * 1.5;
    }

    function ended() {
        this._logger.info('[%s] Phenix live stream player ended.', this._streamId);
    }

    // Temporary measure. The phenix-web-player logs a lot of debug, info, and trace data
    function createWarningThresholdLogger(logger) {
        var appenders = logger.getAppenders();
        var throttledLogger = new logging.Logger();

        _.forEach(appenders, function(appender) {
            if (appender instanceof logging.ConsoleAppender) {
                appender = new logging.ConsoleAppender();

                appender.setThreshold(logging.level.INFO);
            }

            throttledLogger.addAppender(appender);
        });

        throttledLogger.setUserId(logger.getUserId());
        throttledLogger.setEnvironment(logger.getEnvironment());
        throttledLogger.setApplicationVersion(logger.getApplicationVersion());
        throttledLogger.setObservableSessionId(logger.getObservableSessionId());

        return throttledLogger;
    }

    return PhenixPlayerRenderer;
});