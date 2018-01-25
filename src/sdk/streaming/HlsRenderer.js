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
    'phenix-web-event',
    'phenix-web-http',
    'phenix-web-disposable',
    'phenix-rtc',
    'phenix-web-application-activity-detector',
    '../DimensionsChangedMonitor',
    './stream.json'
], function(_, assert, event, http, disposable, rtc, applicationActivityDetector, DimensionsChangedMonitor, streamEnums) {
    'use strict';

    var streamEndedBeforeSetupTimeout = 5000;
    var numberOfTimesToRetryHlsStalledHlsStream = 5;
    var originStreamReadyDuration = 6000;
    var defaultUnreadableContentErrorTimeout = 250;
    var timeoutForStallWithoutProgressToRestart = 6000;
    var minTimeBeforeNextReload = 15000;
    var defaultTimeoutForBackgroundTabBeforeDispose = 3000;

    function HlsRenderer(streamId, uri, streamTelemetry, options, logger) {
        this._logger = logger;
        this._streamId = streamId;
        this._playlistUri = encodeURI(uri).replace(/[#]/g, '%23');
        this._bufferSizeHistory = [];
        this._streamTelemetry = streamTelemetry;
        this._options = options;
        this._element = null;
        this._dimensionsChangedMonitor = new DimensionsChangedMonitor(logger);
        this._lastProgress = {
            time: 0,
            buffered: null,
            averageLength: 0,
            count: 0,
            setupRetry: 0,
            lastCurrentTime: 0,
            lastCurrentTimeOccurenceTimestamp: 0
        };
        this._namedEvents = new event.NamedEvents();

        this._onStalled = _.bind(stalled, this);
        this._onProgress = _.bind(onProgress, this);
        this._onEnded = _.bind(ended, this);
        this._onError = _.bind(onError, this);
        this._onWaiting = _.bind(waiting, this);
    }

    HlsRenderer.prototype.on = function(name, callback) {
        return this._namedEvents.listen(name, callback);
    };

    HlsRenderer.prototype.start = function(elementToAttachTo) {
        try {
            var timeSinceOriginStreamStart = _.now() - this._options.originStartTime;

            this._disposables = new disposable.DisposableList();

            this._disposables.add(applicationActivityDetector.onBackground(_.bind(handleForegroundChange, this, false)));
            this._disposables.add(applicationActivityDetector.onForeground(_.bind(handleForegroundChange, this, true)));

            this._streamTelemetry.recordTimeToFirstFrame(elementToAttachTo);
            this._streamTelemetry.recordRebuffering(elementToAttachTo);
            this._streamTelemetry.recordVideoResolutionChanges(this, elementToAttachTo);

            if (timeSinceOriginStreamStart < originStreamReadyDuration && this._options.isDrmProtectedContent) {
                setTimeout(_.bind(setupPlayer, this, elementToAttachTo), originStreamReadyDuration);
            } else {
                setupPlayer.call(this, elementToAttachTo);
            }
        } catch (e) {
            this._logger.error('[%s] Error while loading HLS live stream [%s]', this._streamId, e.code, e);

            this._namedEvents.fire(streamEnums.rendererEvents.error.name, ['hls', e]);
        }

        return elementToAttachTo;
    };

    HlsRenderer.prototype.stop = function(reason, waitForLastChunk) {
        var that = this;

        if (that._waitingForFinalization) {
            return;
        }

        if (waitForLastChunk) {
            return that._waitForLastChunk = true;
        }

        this._dimensionsChangedMonitor.stop();

        this._streamTelemetry.stop();

        this._disposables.dispose();

        if (this._element) {
            var finalizeStreamEnded = function finalizeStreamEnded() {
                if (that._element) {
                    _.removeEventListener(that._element, 'error', that._onError, true);
                    _.removeEventListener(that._element, 'stalled', that._onStalled, false);
                    _.removeEventListener(that._element, 'pause', that._onStalled, false);
                    _.removeEventListener(that._element, 'suspend', that._onStalled, false);
                    _.removeEventListener(that._element, 'progress', that._onProgress, false);
                    _.removeEventListener(that._element, 'ended', that._onEnded, false);
                    _.removeEventListener(that._element, 'waiting', that._onWaiting, false);

                    if (rtc.browser === 'Safari' && rtc.browserVersion >= 11) {
                        that._element.setAttribute('src', '');
                    } else {
                        that._element.src = '';
                    }

                    that._element = null;
                }

                var reason = '';

                that._namedEvents.fire(streamEnums.rendererEvents.ended.name, [reason]);
            };

            try {
                that._element.pause();

                that._logger.info('[%s] HLS live stream has been destroyed', that._streamId);

                finalizeStreamEnded();
            } catch (e) {
                that._logger.error('[%s] Error while destroying HLS live stream [%s]', that._streamId, e.code, e);

                finalizeStreamEnded();

                that._namedEvents.fire(streamEnums.rendererEvents.error.name, ['hls', e]);
            }

            that._waitingForFinalization = true;
        }
    };

    HlsRenderer.prototype.getStats = function() {
        if (!this._element) {
            return {
                width: 0,
                height: 0,
                currentTime: 0.0,
                lag: 0.0,
                networkState: streamEnums.networkStates.networkNoSource.id
            };
        }

        var currentTime = this._element ? this._element.currentTime || 0.0 : 0.0;
        var buffered = (this._element && this._element.buffered && this._element.buffered.length > 0) ? this._element.buffered.end(this._element.buffered.length - 1) : 0;
        var currentBufferSize = Math.max(0, buffered - currentTime);

        this._bufferSizeHistory.push(currentBufferSize);

        if (this._bufferSizeHistory.length > 15) {
            this._bufferSizeHistory.shift();
        }

        var estimatedBufferSize = 0;

        for (var i = 0, len = this._bufferSizeHistory.length; i < len; i++) {
            estimatedBufferSize = Math.max(estimatedBufferSize, this._bufferSizeHistory[i]);
        }

        var chunkDuration = 2.0; // TODO (sbi) Parse chunk duration from manifest
        var trueCurrentTime = (_.now() - this._options.originStartTime) / 1000;
        var lag = 2.0 * chunkDuration + estimatedBufferSize;
        var estimatedCurrentTime = trueCurrentTime - lag;

        return {
            width: this._element.videoWidth || this._element.width,
            height: this._element.videoHeight || this._element.height,
            currentTime: estimatedCurrentTime,
            originTime: trueCurrentTime,
            lag: lag,
            networkState: this._element.networkState
        };
    };

    HlsRenderer.prototype.setDataQualityChangedCallback = function(callback) {
        assert.isFunction(callback, 'callback');

        this.dataQualityChangedCallback = callback;
    };

    HlsRenderer.prototype.getPlayer = function() {
        return null;
    };

    HlsRenderer.prototype.addVideoDisplayDimensionsChangedCallback = function(callback, options) {
        this._dimensionsChangedMonitor.addVideoDisplayDimensionsChangedCallback(callback, options);
    };

    function setupPlayer(elementToAttachTo) {
        rtc.attachUriStream(elementToAttachTo, this._playlistUri);

        if (this._options.receiveAudio === false) {
            elementToAttachTo.muted = true;
        }

        _.addEventListener(elementToAttachTo, 'error', this._onError, true);
        _.addEventListener(elementToAttachTo, 'stalled', this._onStalled, false);
        _.addEventListener(elementToAttachTo, 'pause', this._onStalled, false);
        _.addEventListener(elementToAttachTo, 'suspend', this._onStalled, false);
        _.addEventListener(elementToAttachTo, 'progress', this._onProgress, false);
        _.addEventListener(elementToAttachTo, 'ended', this._onEnded, false);
        _.addEventListener(elementToAttachTo, 'waiting', this._onWaiting, false);

        this._element = elementToAttachTo;

        this._dimensionsChangedMonitor.start(this, this._element);
    }

    function onError(e) {
        var that = this;
        var timeout = defaultUnreadableContentErrorTimeout * that._lastProgress.setupRetry * that._lastProgress.setupRetry;
        var hasNotStartedYet = that._lastProgress.count === 0;
        var hasNotExceededMaxRetries = that._lastProgress.setupRetry <= numberOfTimesToRetryHlsStalledHlsStream;

        if (_.get(this._element, ['error', 'code']) === 4 && hasNotStartedYet && hasNotExceededMaxRetries) {
            return setTimeout(function() {
                that._lastProgress.setupRetry++;
                reload.call(that);
            }, Math.max(timeout, defaultUnreadableContentErrorTimeout));
        }

        this._namedEvents.fire(streamEnums.rendererEvents.error.name, ['player', e]);
    }

    function onProgress() {
        this._lastProgress.time = _.now();

        if (this._element.buffered.length === 0) {
            return this._logger.debug('[%s] Hls stream progress event fired without any buffered content', this._streamId);
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

            if (this._lastProgress.lastCurrentTime !== this._element.currentTime) {
                this._lastProgress.lastCurrentTimeOccurenceTimestamp = _.now();
            }

            var hasExceededStallTimeout = this._lastProgress.lastCurrentTimeOccurenceTimestamp && _.now() - this._lastProgress.lastCurrentTimeOccurenceTimestamp > timeoutForStallWithoutProgressToRestart;

            if (hasExceededStallTimeout && this._element && !this._element.paused && canReload.call(this)) {
                this._logger.warn('Reloading stream after current time has not changed for [%s] seconds due to unregistered stall.', timeoutForStallWithoutProgressToRestart / 1000);

                reloadIfAble.call(this);
            }
        }

        this._lastProgress.buffered = bufferedEnd;
        this._lastProgress.setupRetry = 0;
        this._lastProgress.lastCurrentTime = this._element.currentTime;
    }

    function stalled() {
        this._logger.info('[%s] Loading Hls stream stalled.', this._streamId);

        if (this._lastProgress.setupRetry > numberOfTimesToRetryHlsStalledHlsStream) {
            return this._logger.warn('[%s] Unable to recover from stalled Hls Stream.', this._streamId);
        }

        var that = this;
        var currentVideoTime = this._element.currentTime;

        if (this._lastProgress.count === 0) {
            this._lastProgress.setupRetry++;
            reload.call(that);
        } else {
            setTimeout(function() {
                if (that._lastProgress.count === 0) {
                    that._lastProgress.setupRetry++;
                    reload.call(that);
                }
            }, getTimeoutOrMinimum.call(that));

            setTimeout(function() {
                if (that._element && that._element.currentTime === currentVideoTime && !that._element.paused && canReload.call(that)) {
                    that._logger.warn('Reloading stream after being stalled for [%s] seconds', timeoutForStallWithoutProgressToRestart / 1000);

                    reloadIfAble.call(that);
                }
            }, timeoutForStallWithoutProgressToRestart);

            setTimeout(_.bind(endIfReady, that), streamEndedBeforeSetupTimeout);
        }
    }

    function ended() {
        this._logger.info('[%s] Hls stream ended', this._streamId);
        this.stop('ended');
    }

    function waiting() {
        this._logger.info('Time elapsed since last progress [%s]', _.now() - this._lastProgress.time);

        setTimeout(_.bind(endIfReady, this), getTimeoutOrMinimum.call(this));
    }

    function canReload() {
        var hasElapsedMinTimeSinceLastReload = !this._lastReloadTime || _.now() - this._lastReloadTime > minTimeBeforeNextReload;

        return this._element && !this._waitForLastChunk && this._element.buffered.length !== 0 && hasElapsedMinTimeSinceLastReload;
    }

    function reloadIfAble() {
        if (!canReload.call(this)) {
            return;
        }

        this._logger.warn('Reloading unhealthy stream that was active for at least [%s] seconds', minTimeBeforeNextReload / 1000);

        this._lastReloadTime = _.now();

        reload.call(this);
    }

    function reload() {
        this._logger.info('[%s] Attempting to reload Hls stream.', this._streamId);

        try {
            this._element.setAttribute('src', '');

            this._element.setAttribute('src', this._playlistUri);
        } catch (e) {
            this._logger.warn('Error while reloading Hls stream [%s]', e);
        }
    }

    function getTimeoutOrMinimum() {
        return this._lastProgress.averageLength * 1.5 < 2000 ? 2000 : this._lastProgress.averageLength * 1.5;
    }

    function endIfReady() {
        if (_.now() - this._lastProgress.time > getTimeoutOrMinimum.call(this) && this._waitForLastChunk) {
            this.stop('ended');
        }
    }

    function handleForegroundChange(isForeground) {
        if (isForeground) {
            clearTimeout(this._backgroundTimeout);

            this._backgroundTimeout = null;

            if (!this._backgroundThrottled) {
                return;
            }

            this._backgroundThrottled = false;

            this.start(this._element);

            return;
        }

        var that = this;

        this._backgroundTimeout = setTimeout(function() {
            if (applicationActivityDetector.isForeground()) {
                return;
            }

            if (!webkitVideoHasAudio(that._element)) {
                that._logger.info('Detecting application [background] with muted video. Pausing playback until application focused again.');

                that._element.pause();

                that._backgroundThrottled = true;
            }
        }, defaultTimeoutForBackgroundTabBeforeDispose);
    }

    function webkitVideoHasAudio(video) {
        if (video.muted) {
            return false;
        }

        return _.get(video, ['webkitAudioDecodedByteCount'], 0) > 0 || _.get(video, ['audioTracks', 'length'], 0) > 0 || video.webkitHasAudio;
    }

    return HlsRenderer;
});