'use strict';

/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
const _ = require('phenix-web-lodash-light');
const assert = require('phenix-web-assert');
const pcastLoggerFactory = require('../logging/pcastLoggerFactory');
const PCastEndPoint = require('../PCastEndPoint');
const AudioContext = require('./AudioContext');
const AudioVolumeMeterFactory = require('./AudioVolumeMeterFactory');
const AudioSpeakerDetectionAlgorithm = require('./AudioSpeakerDetectionAlgorithm');

function AudioSpeakerDetector(userMediaStreams, options) {
    assert.isArray(userMediaStreams, 'userMediaStreams');

    options = options || {};

    this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
    this._logger = options.logger || pcastLoggerFactory.createPCastLogger(this._baseUri);
    this._audioContext = options.audioContext || new AudioContext();
    this._nativeAudioContext = this._audioContext.getNativeAudioContext();
    this._onSpeakingChanged = null;
    this._userMediaStreams = userMediaStreams;
    this._disposeOfAudioContext = !_.isObject(options.audioContext);
    this._audioVolumeMeterFactory = new AudioVolumeMeterFactory(this._logger);

    _.forEach(this._userMediaStreams, _.bind(setupAudioVolumeMeter, this, options));
}

AudioSpeakerDetector.prototype.start = function start(options, callback) {
    assert.isFunction(callback, 'callback');

    this._onSpeakingChanged = callback;

    options = options || {};

    _.forEach(this._userMediaStreams, _.bind(setupSpeakingDetection, this, options));
};

AudioSpeakerDetector.prototype.stop = function stop() {
    _.forEach(this.getAudioVolumeMeters(), function(meter) {
        meter.onValue(function() {});
    });

    this._onSpeakingChanged = null;
};

AudioSpeakerDetector.prototype.getAudioVolumeMeter = function getAudioVolumeMeter(stream) {
    assert.isObject(stream, 'stream');

    return this._audioVolumeMeterFactory.getAudioVolumeMeter(stream);
};

AudioSpeakerDetector.prototype.getAudioVolumeMeters = function getAudioVolumeMeters() {
    return this._audioVolumeMeterFactory.getAudioVolumeMeters();
};

AudioSpeakerDetector.prototype.dispose = function dispose() {
    if (this._disposeOfAudioContext) {
        this._nativeAudioContext.close();
    }

    this._audioVolumeMeterFactory.stopAllMeters();

    this._userMediaStreams = null;
};

AudioSpeakerDetector.prototype.toString = function toString() {
    return 'AudioSpeakerDetector';
};

function setupAudioVolumeMeter(options, stream) {
    assert.isObject(stream, 'stream');
    assert.isObject(options, 'options');

    var audioVolumeMeter = this._audioVolumeMeterFactory.getAudioVolumeMeter(stream);

    audioVolumeMeter.init(this._nativeAudioContext, options.alpha);
    audioVolumeMeter.connect(stream);
}

function setupSpeakingDetection(options, stream) {
    assert.isObject(stream, 'stream');
    assert.isObject(options, 'options');

    var audioVolumeMeter = this._audioVolumeMeterFactory.getAudioVolumeMeter(stream);
    var audioSpeakerDetectionAlgorithm = new AudioSpeakerDetectionAlgorithm(this._logger);

    if (options.alpha) {
        audioVolumeMeter.setAlpha(options.alpha);
    }

    audioSpeakerDetectionAlgorithm.onValue(this._onSpeakingChanged);
    audioSpeakerDetectionAlgorithm.startDetection(audioVolumeMeter, options);
}

module.exports = AudioSpeakerDetector;