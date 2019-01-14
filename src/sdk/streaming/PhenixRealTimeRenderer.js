/**
 * Copyright 2019 PhenixP2P Inc. All Rights Reserved.
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
    'phenix-web-detect-browser',
    'phenix-web-global',
    '../DimensionsChangedMonitor',
    './stream.json',
    './FeatureDetector'
], function(_, assert, event, http, disposable, rtc, applicationActivityDetector, DetectBrowser, global, DimensionsChangedMonitor, streamEnums, FeatureDetector) {
    'use strict';

    var backgroundPauseChangeInterval = 1000;

    function PhenixRealTimeRenderer(streamId, streamSrc, streamTelemetry, options, logger) {
        this._logger = logger;
        this._streamId = streamId;
        this._streamSrc = streamSrc;
        this._streamTelemetry = streamTelemetry;
        this._options = options;
        this._renderer = null;
        this._element = null;
        this._dimensionsChangedMonitor = new DimensionsChangedMonitor(logger);
        this._namedEvents = new event.NamedEvents();
        this._disposables = new disposable.DisposableList();
        this._browser = (new DetectBrowser(_.get(global, ['navigator', 'userAgent'], ''))).detect();
        this._wasPlaying = false;
        this._backgroudEventTimestamp = 0;
        this._pausedEventTimstamp = 0;

        this._disposables.add(applicationActivityDetector.onBackground(_.bind(recordWasPlaying, this)));
        this._disposables.add(applicationActivityDetector.onForeground(_.bind(resumeIfPossible, this)));

        this._onStalled = _.bind(stalled, this);
        this._onEnded = _.bind(ended, this);
    }

    PhenixRealTimeRenderer.prototype.on = function(name, callback) {
        return this._namedEvents.listen(name, callback);
    };

    PhenixRealTimeRenderer.prototype.start = function(elementToAttachTo) {
        var that = this;
        var hasAudioTrack = !!_.find(this._streamSrc.getTracks(), function(track) {
            return track.kind === 'audio';
        });

        if (!this._options.canPlaybackAudio) {
            if (this._options.disableAudioIfNoOutputFound && this._options.forcedAudioDisabled) {
                this._logger.warn('[%s] Missing audio playback device. Audio has been disabled on stream. Try setting up an audio device and re-subscribe in order to receive audio.', this._streamId);
            } else if (!this._options.disableAudioIfNoOutputFound && hasAudioTrack) {
                this._logger.warn('[%s] Missing audio playback device. May experience audio and/or video failure. Try setting up an audio device OR pass the [disableAudioIfNoOutputFound] option when subscribing to disable audio playback when no devices are attached.', this._streamId);
            }
        }

        this._element = rtc.attachMediaStream(elementToAttachTo, this._streamSrc, function(e) {
            if (!e) {
                that._logger.debug('[%s] Successfully started playing stream.', that._streamId);

                return;
            }

            if (elementToAttachTo.muted || !hasAudioTrack) {
                that._logger.warn('[%s] Failed to play muted stream.', that._streamId, e);

                return that._namedEvents.fire(streamEnums.rendererEvents.ended.name, ['failed-to-play']);
            }

            that._logger.debug('[%s] Failed to start playing stream. Auto muting the playback and trying again.', that._streamId);
            elementToAttachTo.muted = true;

            that._element = rtc.attachMediaStream(elementToAttachTo, that._streamSrc, function(e) {
                if (e) {
                    that._logger.warn('[%s] Failed to play even after auto muting.', that._streamId, e);

                    // Restore muted state
                    elementToAttachTo.muted = false;

                    return that._namedEvents.fire(streamEnums.rendererEvents.ended.name, ['failed-to-play']);
                }

                that._logger.info('[%s] Successfully started playing stream after auto muting. User may manually unmute with user triggered action.', that._streamId);

                that._namedEvents.fire(streamEnums.rendererEvents.autoMuted.name, ['retry-play-muted']);
            });
        });

        this._disposables.add(this._streamTelemetry.recordTimeToFirstFrame(elementToAttachTo));
        this._disposables.add(this._streamTelemetry.recordRebuffering(elementToAttachTo));
        this._disposables.add(this._streamTelemetry.recordVideoResolutionChanges(this, elementToAttachTo));
        this._disposables.add(this._streamTelemetry.recordVideoPlayingAndPausing(elementToAttachTo));

        if (this._options.receiveAudio === false) {
            elementToAttachTo.muted = true;
        }

        _.addEventListener(elementToAttachTo, 'stalled', this._onStalled, false);
        _.addEventListener(elementToAttachTo, 'pause', this._onStalled, false);
        _.addEventListener(elementToAttachTo, 'suspend', this._onStalled, false);
        _.addEventListener(elementToAttachTo, 'ended', this._onEnded, false);

        this._dimensionsChangedMonitor.start(this, elementToAttachTo);

        return elementToAttachTo;
    };

    PhenixRealTimeRenderer.prototype.stop = function(reason) {
        this._dimensionsChangedMonitor.stop();

        this._disposables.dispose();

        if (this._element) {
            _.removeEventListener(this._element, 'stalled', this._onStalled, false);
            _.removeEventListener(this._element, 'pause', this._onStalled, false);
            _.removeEventListener(this._element, 'suspend', this._onStalled, false);
            _.removeEventListener(this._element, 'ended', this._onEnded, false);

            if (_.isFunction(this._element.pause)) {
                this._element.pause();
            }

            if (this._browser.browser === 'Edge') {
                this._element.src = '';
            }

            if (this._element.src && (this._browser.browser === 'IE')) {
                this._element.src = null;
            } else if (this._element.src) {
                this._element.src = '';
            }

            if (this._element.srcObject) {
                this._element.srcObject = null;
            }

            this._element = null;
        }

        this._logger.info('[%s] Phenix real-time renderer has been destroyed', this._streamId);

        this._namedEvents.fire(streamEnums.rendererEvents.ended.name, [reason]);
    };

    PhenixRealTimeRenderer.prototype.getStats = function() {
        if (!this._element) {
            return {
                width: 0,
                height: 0,
                currentTime: 0.0,
                lag: 0.0,
                networkState: streamEnums.networkStates.networkNoSource.id
            };
        }

        var trueCurrentTime = (_.now() - this._options.originStartTime) / 1000;
        var lag = this._options.networkLag / 1000; // Check RTC stats instead

        return {
            width: this._element.videoWidth || this._element.width,
            height: this._element.videoHeight || this._element.height,
            currentTime: trueCurrentTime,
            lag: lag,
            networkState: this._element.networkState
        };
    };

    PhenixRealTimeRenderer.prototype.setDataQualityChangedCallback = function(callback) {
        assert.isFunction(callback, 'callback');

        this.dataQualityChangedCallback = callback;
    };

    PhenixRealTimeRenderer.prototype.addVideoDisplayDimensionsChangedCallback = function(callback, options) {
        return this._dimensionsChangedMonitor.addVideoDisplayDimensionsChangedCallback(callback, options);
    };

    function stalled(event) {
        var isLastBackgroundEventRecent = _.now() - this._backgroudEventTimestamp < backgroundPauseChangeInterval;

        if (event.type === 'pause' && isLastBackgroundEventRecent) {
            this._wasPlaying = true;
        }

        this._pausedEventTimstamp = _.now();

        this._logger.info('[%s] Loading Phenix Real-Time stream player stalled caused by [%s] event.', this._streamId, event.type);
    }

    function ended() {
        this._logger.info('[%s] Phenix Real-Time stream ended.', this._streamId);
    }

    function recordWasPlaying() {
        if (!this._element) {
            return;
        }

        var playing = false;
        var isLastPauseEventRecent = _.now() - this._pausedEventTimstamp < backgroundPauseChangeInterval;

        if (_.isBoolean(this._element.playing)) {
            playing = this._element.playing;
        } else if (_.isBoolean(this._element.paused)) {
            playing = !this._element.paused;
        }

        if (!playing && isLastPauseEventRecent) {
            playing = true;
        }

        this._wasPlaying = playing;
        this._backgroudEventTimestamp = _.now();
    }

    function resumeIfPossible() {
        if (!this._element) {
            return;
        }

        var that = this;

        this._backgroudEventTimestamp = 0;
        this._pausedEventTimstamp = 0;
        this._logger.info('foreground [%s] [%s]', this._wasPlaying, this._browser.browser);

        if (this._browser.browser === 'Safari' && FeatureDetector.isIOS() && this._wasPlaying && this._element && this._element.play) {
            var resume = function resume() {
                that._logger.info('Attempting to play video element after application was backgrounded and forcefully paused');
                that._element.play();
            };

            this._logger.info('Attempting to play video element after application was backgrounded');

            _.addEventListener(that._element, 'pause', resume);

            var timeoutId = setTimeout(function() {
                _.removeEventListener(that._element, 'pause', resume);
            }, backgroundPauseChangeInterval);

            this._disposables.add(new disposable.Disposable(function() {
                clearTimeout(timeoutId);
            }));

            this._element.play().catch(function(e) {
                that._logger.warn('Unable to resume playback after pause', e);
                that._namedEvents.fire(streamEnums.rendererEvents.userActionRequired.name, ['app-paused-by-background']);
                that._startFromBackground = _.now();
            });
        }
    }

    return PhenixRealTimeRenderer;
});