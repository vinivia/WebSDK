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
    './assert',
    'phenix-rtc'
], function (_, assert, phenixRTC) {
    'use strict';

    function StreamAnalytix(logger) {
        this._logger = logger;
        this._start = _.now();
        this._disposables = [];

        recordMetric.call(this, 'Stream initializing');
    }

    StreamAnalytix.prototype.setStreamId = function(streamId) {
        if (this._streamId) {
            throw new Error('Unable to override streamId. Please instantiate a new StreamAnalytix.');
        }

        this._streamId = streamId;
    };

    StreamAnalytix.prototype.stop = function() {
        _.forEach(this._disposables, function(dispose) {
            dispose();
        });

        recordMetric.call(this, 'Stream has stopped');
    };

    StreamAnalytix.prototype.recordTimeToFirstFrame = function(video) {
        var that = this;
        var recordedTimeToFirstFrame = null;

        var listenForFirstFrame = function() {
            if (recordedTimeToFirstFrame) {
                return;
            }

            recordedTimeToFirstFrame = _.now() - that._start;

            recordMetric.call(that, 'First Frame');

            phenixRTC.removeEventListener(video, 'loadeddata', listenForFirstFrame);
        };

        phenixRTC.addEventListener(video, 'loadeddata', listenForFirstFrame);
    };

    // ToDo(dy) Add logging for bit rate changes using PC.getStats

    StreamAnalytix.prototype.recordVideoResolutionChanges = function(video) {
        var that = this;
        var lastResolution = {
            width: video.videoWidth,
            height: video.videoHeight
        };

        var listenForResolutionChangeOnProgress = function() {
            if (lastResolution.width === video.videoWidth && lastResolution.height === video.videoHeight) {
                return;
            }

            lastResolution = {
                width: video.videoWidth,
                height: video.videoHeight
            };

            recordMetric.call(that, 'Resolution has changed to: width [%s] height [%s]', video.videoWidth, video.videoHeight);
        };

        // Events loadedmetadata and loadeddata do not fire as expected. So Progress is used.
        phenixRTC.addEventListener(video, 'progress', listenForResolutionChangeOnProgress);

        this._disposables.push(function() {
            phenixRTC.removeEventListener(video, 'progress', listenForResolutionChangeOnProgress);
        });
    };

    StreamAnalytix.prototype.recordRebuffering = function(video) {
        var that = this;
        var videoStalled;
        var lastProgress;

        var listenForStall = function() {
            if (videoStalled) {
                return;
            }

            videoStalled = _.now();

            recordMetric.call(that, '[buffering] Stream has stalled');
        };

        var listenForContinuation = function(event) {
            if (!videoStalled || !video.buffered.length || (event.type === 'progress' && video.buffered.end(0) === lastProgress)) {
                return;
            }

            if (event.type === 'progress') {
                lastProgress = video.buffered.end(0);
            }

            var timeSinceStop = _.now() - videoStalled;

            recordMetric.call(that, '[buffering] Stream has recovered from stall after [%s] milliseconds', timeSinceStop);

            videoStalled = null;
        };

        phenixRTC.addEventListener(video, 'stalled', listenForStall);
        phenixRTC.addEventListener(video, 'paused', listenForStall);
        phenixRTC.addEventListener(video, 'suspend', listenForStall);
        phenixRTC.addEventListener(video, 'play', listenForContinuation);
        phenixRTC.addEventListener(video, 'playing', listenForContinuation);
        phenixRTC.addEventListener(video, 'progress', listenForContinuation);

        this._disposables.push(function() {
            phenixRTC.removeEventListener(video, 'stalled', listenForStall);
            phenixRTC.removeEventListener(video, 'paused', listenForStall);
            phenixRTC.removeEventListener(video, 'suspend', listenForStall);
            phenixRTC.removeEventListener(video, 'play', listenForContinuation);
            phenixRTC.removeEventListener(video, 'playing', listenForContinuation);
            phenixRTC.removeEventListener(video, 'progress', listenForContinuation);
        });
    };

    function recordMetric() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length === 0) {
            throw new Error('Invalid logging arguments.');
        }

        var streamAnalytixPrepend = '[%s] [StreamAnalytix] [%s] ';
        var message = streamAnalytixPrepend + args[0];
        var loggingArguments = args.slice(1);
        var analytixArguments = [message, this._streamId, _.now() - this._start].concat(loggingArguments);

        this._logger.info.apply(this._logger, analytixArguments);
    }

    return StreamAnalytix;
});