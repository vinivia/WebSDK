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
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("protobuf"), require("ByteBuffer"), require("phenix-rtc"));
	else if(typeof define === 'function' && define.amd)
		define(["protobuf", "ByteBuffer", "phenix-rtc"], factory);
	else {
		var a = typeof exports === 'object' ? factory(require("protobuf"), require("ByteBuffer"), require("phenix-rtc")) : factory(root["protobuf"], root["ByteBuffer"], root["phenix-rtc"]);
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function(__WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__, __WEBPACK_EXTERNAL_MODULE_7__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	'use strict';

	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(1),
	    __webpack_require__(4)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (PhenixPCast, Logger) {
	    window.PhenixPCast = PhenixPCast;

	    return {
	        PCast: PhenixPCast,
	        Logger: Logger
	    };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(2),
	        __webpack_require__(8),
	        __webpack_require__(10),
	        __webpack_require__(9),
	        __webpack_require__(4),
	        __webpack_require__(7)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (PCastProtocol, PCastEndPoint, PeerConnectionMonitor, Time, Logger, phenixRTC) {
	    'use strict';

	    var freeze = function freeze(obj) {
	        if ('freeze' in Object) {
	            return Object.freeze(obj);
	        }

	        return obj;
	    };
	    var NetworkStates = freeze({
	        'NETWORK_EMPTY': 0,
	        'NETWORK_IDLE': 1,
	        'NETWORK_LOADING': 2,
	        'NETWORK_NO_SOURCE': 3
	    });
	    var peerConnectionConfig = freeze({
	        'iceServers': [
	            {
	                urls: 'stun:stun.l.google.com:19302'
	            }, {
	                urls: 'stun:stun1.l.google.com:19302'
	            }, {
	                urls: 'stun:stun2.l.google.com:19302'
	            }, {
	                urls: 'stun:stun3.l.google.com:19302'
	            }, {
	                urls: 'stun:stun4.l.google.com:19302'
	            }
	        ]
	    });
	    var sdkVersion = '2016-12-26T16:50:26Z';
	    var defaultChromePCastScreenSharingExtensionId = 'icngjadgidcmifnehjcielbmiapkhjpn';
	    var defaultFirefoxPCastScreenSharingAddOn = freeze({
	        url: 'https://addons.mozilla.org/firefox/downloads/file/474686/pcast_screen_sharing-1.0.3-an+fx.xpi',
	        iconUrl: 'https://phenixp2p.com/public/images/phenix-logo-unicolor-64x64.png',
	        hash: 'sha256:4972e9718ea7f7c896abc12d1a9e664d5f3efe498539b082ab7694f9d7af4f3b'
	    });
	    var firefoxInstallationCheckInterval = 100;
	    var firefoxMaxInstallationChecks = 450;

	    function PhenixPCast(options) {
	        options = options || {};
	        this._logger = options.logger || new Logger();
	        this._baseUri = options.uri || PCastEndPoint.DefaultPCastUri;
	        this._deviceId = options.deviceId || '';
	        this._version = sdkVersion;
	        this._endPoint = new PCastEndPoint(this._version, this._baseUri, this._logger);
	        this._screenSharingExtensionId = options.screenSharingExtensionId || defaultChromePCastScreenSharingExtensionId;
	        this._screenSharingAddOn = options.screenSharingAddOn || defaultFirefoxPCastScreenSharingAddOn;
	        this._screenSharingEnabled = false;
	        this._shaka = options.shaka || window.shaka;
	        this._videojs = options.videojs || window.videojs;
	        this._status = 'offline';

	        if (phenixRTC.browser === 'Chrome' && this._screenSharingExtensionId) {
	            addLinkHeaderElement.call(this);
	        }

	        phenixRTC.addEventListener(window, 'unload', function (pcast) {
	            return function () {
	                pcast.stop();
	            }
	        }(this));
	    }

	    PhenixPCast.prototype.getBaseUri = function () {
	        return this._endPoint.getBaseUri();
	    };

	    PhenixPCast.prototype.getStatus = function () {
	        return this._status;
	    };

	    PhenixPCast.prototype.start = function (authToken, authenticationCallback, onlineCallback, offlineCallback) {
	        if (typeof authToken !== 'string') {
	            throw new Error('"authToken" must be a string');
	        }
	        if (typeof authenticationCallback !== 'function') {
	            throw new Error('"authenticationCallback" must be a function');
	        }
	        if (typeof onlineCallback !== 'function') {
	            throw new Error('"onlineCallback" must be a function');
	        }
	        if (typeof offlineCallback !== 'function') {
	            throw new Error('"offlineCallback" must be a function');
	        }

	        if (this._started) {
	            throw new Error('"Already started"');
	        }

	        this._stopped = false;
	        this._started = true;
	        this._authToken = authToken;
	        this._authenticationCallback = authenticationCallback;
	        this._onlineCallback = onlineCallback;
	        this._offlineCallback = offlineCallback;
	        this._status = 'connecting';

	        this._peerConnections = {};
	        this._mediaStreams = {};
	        this._renderer = {};
	        this._publishers = {};
	        this._gumStreams = [];

	        var that = this;

	        checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
	            that._screenSharingEnabled = screenSharingEnabled;

	            that._endPoint.resolveUri(function (err, uri) {
	                if (err) {
	                    that._logger.error('Failed to connect to [%s]', that._baseUri, err);

	                    transitionToStatus.call(that, 'offline');

	                    switch (err.code) {
	                        case 0:
	                            that._authenticationCallback.call(that, that, 'network-unavailable', '');
	                            break;
	                        case 503:
	                            that._authenticationCallback.call(that, that, 'capacity', '');
	                            break;
	                        default:
	                            that._authenticationCallback.call(that, that, 'failed', '');
	                            break;
	                    }

	                    that._stopped = true;
	                    that._started = false;

	                    return;
	                }

	                that._logger.info('Discovered end point [%s]', uri);

	                that._protocol = new PCastProtocol(uri, that._deviceId, that._version, that._logger);

	                that._protocol.on('connected', connected.bind(that));
	                that._protocol.on('disconnected', disconnected.bind(that));
	                that._protocol.on('streamEnded', streamEnded.bind(that));
	                that._protocol.on('dataQuality', dataQuality.bind(that));
	            });
	        });
	    };

	    PhenixPCast.prototype.stop = function () {
	        if (!this._started) {
	            return;
	        }

	        this._stopped = true;
	        this._started = false;

	        delete this._authenticationCallback;

	        try {
	            var reason = '';

	            for (var streamId in this._mediaStreams) {
	                if (this._mediaStreams.hasOwnProperty(streamId)) {
	                    var mediaStream = this._mediaStreams[streamId];

	                    endStream.call(this, streamId, reason);

	                    mediaStream.stop(reason);
	                }
	            }

	            for (var streamId in this._renderer) {
	                if (this._renderer.hasOwnProperty(streamId)) {
	                    var renderer = this._renderer[streamId];

	                    renderer.stop(reason);
	                }
	            }

	            for (var streamId in this._publishers) {
	                if (this._publishers.hasOwnProperty(streamId)) {
	                    var publisher = this._publishers[streamId];

	                    endStream.call(this, streamId, reason);

	                    publisher.stop(reason);
	                }
	            }

	            for (var streamId in this._peerConnections) {
	                if (this._peerConnections.hasOwnProperty(streamId)) {
	                    endStream.call(this, streamId, reason);
	                }
	            }

	            for (var i = 0; i < this._gumStreams.length; i++) {
	                var tracks = this._gumStreams[i].getTracks();

	                for (var j = 0; j < tracks.length; j++) {
	                    tracks[j].stop();
	                }
	            }
	        } finally {
	            if (this._protocol) {
	                this._protocol.disconnect();
	            }
	        }
	    };

	    PhenixPCast.prototype.getUserMedia = function (options, callback) {
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        return getUserMedia.call(this, options, callback);
	    };

	    PhenixPCast.prototype.publish = function (streamToken, mediaStreamToPublish, callback, tags, options) {
	        if (typeof streamToken !== 'string') {
	            throw new Error('"streamToken" must be a string');
	        }
	        if (typeof mediaStreamToPublish !== 'object') {
	            throw new Error('"mediaStreamToPublish" must be an object');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }
	        tags = tags || [];
	        if (!Array.isArray(tags)) {
	            throw new Error('"tags" must be an array');
	        }
	        options = options || {};
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }

	        var that = this;

	        this._protocol.setupStream('upload', streamToken, function (response, error) {
	            if (error) {
	                that._logger.warn('Failed to create uploader', error);

	                switch (error.status) {
	                    case 'capacity':
	                        return callback.call(that, that, error.status);
	                    default:
	                        return callback.call(that, that, 'failed');
	                }
	            } else {
	                var streamId = response.createStreamResponse.streamId;
	                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;

	                createPublisherPeerConnection.call(that, mediaStreamToPublish, streamId, offerSdp, function (phenixPublisher, error) {
	                    if (error) {
	                        callback.call(that, that, 'failed', null);
	                    } else {
	                        callback.call(that, that, 'ok', phenixPublisher);
	                    }
	                }, options);
	            }
	        });
	    };

	    PhenixPCast.prototype.subscribe = function (streamToken, callback, options) {
	        if (typeof streamToken !== 'string') {
	            throw new Error('"streamToken" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }
	        options = options || {};
	        if (typeof options !== 'object') {
	            throw new Error('"options" must be an object');
	        }

	        var that = this;

	        this._protocol.setupStream('download', streamToken, function (response, error) {
	            if (error) {
	                that._logger.warn('Failed to create downloader', error);

	                switch (error.status) {
	                    case 'capacity':
	                    case 'stream-ended':
	                    case 'origin-stream-ended':
	                    case 'streaming-not-available':
	                        return callback.call(that, that, error.status);
	                    default:
	                        return callback.call(that, that, 'failed');
	                }
	            } else {
	                var streamId = response.createStreamResponse.streamId;
	                var offerSdp = response.createStreamResponse.createOfferDescriptionResponse.sessionDescription.sdp;
	                var create = createViewerPeerConnection;

	                if (offerSdp.match(/a=x-playlist:/)) {
	                    create = createLiveViewer;
	                }

	                return create.call(that, streamId, offerSdp, function (phenixMediaStream, error) {
	                    if (error) {
	                        callback.call(that, that, 'failed', null);
	                    } else {
	                        callback.call(that, that, 'ok', phenixMediaStream);
	                    }
	                }, options);
	            }
	        });
	    };

	    PhenixPCast.prototype.toString = function () {
	        return 'PhenixPCast[' + this._sessionId + ',' + (this._protocol ? this._protocol.toString() : 'uninitialized') + ']';
	    };

	    function checkForScreenSharingCapability(callback) {
	        var that = this;

	        if (phenixRTC.browser === 'Chrome' && that._screenSharingExtensionId) {
	            try {
	                chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'version'}, function (response) {
	                    if (response && response.status === 'ok') {
	                        that._logger.info('Screen sharing enabled using version [%s]', response.version);
	                        callback(true);
	                    } else {
	                        that._logger.info('Screen sharing NOT available');
	                        callback(false);
	                    }
	                });
	            } catch (e) {
	                if (e.message) {
	                    that._logger.warn(e.message, e);
	                }

	                callback(false);
	            }
	        } else if (phenixRTC.browser === 'Firefox' && typeof window.PCastScreenSharing === 'object') {
	            callback(true);
	        } else {
	            callback(false);
	        }
	    }

	    function getChromeWebStoreLink() {
	        return 'https://chrome.google.com/webstore/detail/' + this._screenSharingExtensionId;
	    }

	    function addLinkHeaderElement() {
	        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

	        var links = document.getElementsByTagName('link');

	        for (var i = 0; i < links.length; i++) {
	            if (links[i].href === chromeWebStoreUrl) {
	                // Link already present
	                return;
	            }
	        }

	        this._logger.debug('Adding Chrome Web Store link [%s]', chromeWebStoreUrl);

	        var link = document.createElement('link');

	        link.rel = 'chrome-webstore-item';
	        link.href = chromeWebStoreUrl;

	        document.getElementsByTagName('head')[0].appendChild(link);
	    }

	    function tryInstallChromeScreenSharingExtension(callback) {
	        var that = this;
	        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

	        try {
	            chrome.webstore.install(chromeWebStoreUrl, function successCallback() {
	                return callback('ok');
	            }, function failureCallback(reason) {
	                if (reason) {
	                    if (reason.match(/cancelled/ig)) {
	                        that._logger.info('User cancelled screen sharing');

	                        return callback('cancelled', new Error(reason));
	                    }

	                    that._logger.warn(reason);
	                }

	                return callback('failed', new Error(reason || 'failed'));
	            });
	        } catch (e) {
	            if (e.message) {
	                that._logger.warn(e.message);
	            }

	            callback('failed', e);
	        }
	    }

	    function tryInstallFirefoxScreenSharingExtension(callback) {
	        try {
	            var params = {
	                "PCast Screen Sharing": {
	                    URL: this._screenSharingAddOn.url,
	                    IconURL: this._screenSharingAddOn.iconUrl,
	                    Hash: this._screenSharingAddOn.hash,
	                    toString: function () {
	                        return this.URL;
	                    }
	                }
	            };
	            var attemptsLeft = firefoxMaxInstallationChecks;
	            var intervalId;
	            var success = function success() {
	                if (intervalId) {
	                    clearInterval(intervalId);
	                }
	                callback('ok');
	            };
	            var failure = function failure() {
	                if (intervalId) {
	                    clearInterval(intervalId);
	                }
	                callback('failed', new Error('failed'));
	            };

	            intervalId = setInterval(function () {
	                if (typeof window.PCastScreenSharing === 'object') {
	                    return success();
	                }
	                if (attemptsLeft-- < 0) {
	                    return failure();
	                }
	            }, firefoxInstallationCheckInterval);

	            InstallTrigger.install(params, function xpiInstallCallback(url, status) {
	                // Callback only works for verified sites
	                if (status === 0) {
	                    success();
	                } else {
	                    failure();
	                }
	            });
	        } catch (e) {
	            if (e.message) {
	                this._logger.warn(e.message);
	            }

	            callback('failed', e);
	        }
	    }

	    function getScreenSharingConstraints(options, callback) {
	        var that = this;

	        switch (phenixRTC.browser) {
	            case 'Chrome':
	                try {
	                    chrome.runtime.sendMessage(that._screenSharingExtensionId, {type: 'get-desktop-media'}, function (response) {
	                        if (response.status !== 'ok') {
	                            return callback(response.status, undefined, new Error(response.status));
	                        }

	                        var constraints = {
	                            video: {}
	                        };

	                        if (typeof options === 'object' && typeof options.screen === 'object') {
	                            constraints.video = options.screen;
	                        }

	                        if (typeof constraints.video.mandatory !== 'object') {
	                            constraints.video.mandatory = {};
	                        }

	                        constraints.video.mandatory.chromeMediaSource = 'desktop';
	                        constraints.video.mandatory.chromeMediaSourceId = response.streamId;

	                        callback('ok', constraints, undefined);
	                    });
	                } catch (e) {
	                    if (e.message) {
	                        that._logger.warn(e.message);
	                    }

	                    callback('failed', undefined, e);
	                }
	                break;
	            case 'Firefox':
	                var constraints = {
	                    video: {}
	                };

	                if (typeof options === 'object' && typeof options.screen === 'object') {
	                    constraints.video = options.screen;
	                }

	                constraints.video.mediaSource = 'window';

	                callback('ok', constraints, undefined);
	                break;
	            default:
	                callback('not-supported', undefined, new Error('not-supported'));
	                break;
	        }
	    }

	    function getUserMediaConstraints(options, callback) {
	        var that = this;

	        if (options.screen) {
	            if (!that._screenSharingEnabled) {
	                var installCallback = function installCallback(status) {
	                    if (status === 'cancelled') {
	                        return callback(status, 'cancelled');
	                    }
	                    if (status !== 'ok') {
	                        return callback(status, undefined, new Error('screen-sharing-installation-failed'));
	                    }

	                    checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
	                        that._screenSharingEnabled = screenSharingEnabled;

	                        if (!that._screenSharingEnabled) {
	                            return callback(status, undefined, new Error('screen-sharing-installation-failed'));
	                        }

	                        getScreenSharingConstraints.call(that, options, callback);
	                    });
	                };

	                switch (phenixRTC.browser) {
	                    case 'Chrome':
	                        tryInstallChromeScreenSharingExtension.call(that, installCallback);
	                        break;
	                    case 'Firefox':
	                        tryInstallFirefoxScreenSharingExtension.call(that, installCallback);
	                        break;
	                    default:
	                        callback('not-supported', undefined, new Error('not-supported'));
	                        break;
	                }
	            } else {
	                getScreenSharingConstraints.call(that, options, callback);
	            }
	        } else {
	            var constraints = {
	                audio: options.audio || false,
	                video: options.video || false
	            };

	            callback('ok', constraints, undefined);
	        }
	    }

	    function getUserMedia(options, callback) {
	        var that = this;

	        var onUserMediaSuccess = function onUserMediaSuccess(stream) {
	            that._gumStreams.push(stream);
	            callback(that, 'ok', stream);
	        };

	        var onUserMediaCancelled = function onUserMediaCancelled() {
	            callback(that, 'cancelled', null);
	        };

	        var onUserMediaFailure = function onUserMediaFailure(e) {
	            if (e.code === 'unavailable') {
	                callback(that, 'conflict', undefined, e);
	            } else if (e.message === 'permission-denied') {
	                callback(that, 'permission-denied', undefined, e);
	            } else if (e.name === 'PermissionDeniedError') { // Chrome
	                callback(that, 'permission-denied', undefined, e);
	            } else if (e.name === 'InternalError' && e.message === 'Starting video failed') { // FF (old getUserMedia API)
	                callback(that, 'conflict', undefined, e);
	            } else if (e.name === 'SourceUnavailableError') { // FF
	                callback(that, 'conflict', undefined, e);
	            } else if (e.name === 'SecurityError' && e.message === 'The operation is insecure.') { // FF
	                callback(that, 'permission-denied', undefined, e);
	            } else {
	                callback(that, 'failed', undefined, e);
	            }
	        };

	        getUserMediaConstraints.call(that, options, function (status, constraints, error) {
	            if (status === 'cancelled') {
	                return onUserMediaCancelled();
	            }

	            if (status !== 'ok') {
	                return onUserMediaFailure(error);
	            }

	            try {
	                phenixRTC.getUserMedia(constraints, onUserMediaSuccess, onUserMediaFailure);
	            } catch (e) {
	                onUserMediaFailure(e);
	            }
	        });
	    }

	    function connected() {
	        var that = this;

	        this._connected = true;

	        if (!that._stopped) {
	            that._protocol.authenticate(that._authToken, function (result, error) {
	                if (that._authenticationCallback) {
	                    if (error) {
	                        that._logger.warn('Failed to authenticate', error);
	                        transitionToStatus.call(that, 'offline');
	                        that._authenticationCallback.call(that, that, 'unauthorized', '');
	                        that.stop('unauthorized');
	                    } else {
	                        transitionToStatus.call(that, 'online');
	                        that._authenticationCallback.call(that, that, result.status, result.sessionId);
	                    }
	                }
	            });
	        }
	    }

	    function disconnected() {
	        this._connected = false;
	        transitionToStatus.call(this, 'offline');
	    }

	    function getStreamEndedReason(value) {
	        switch (value) {
	            case '':
	            case 'none':
	            case 'ended':
	                return 'ended';
	            case 'server-error':
	            case 'not-ready':
	            case 'error':
	                return 'failed';
	            case 'censored':
	                return 'censored';
	            case 'maintenance':
	                return 'maintenance';
	            case 'capacity':
	                return 'capacity';
	            case 'app-background':
	                return 'app-background';
	            default:
	                return 'custom';
	        }
	    }

	    function streamEnded(event) {
	        var streamId = event.streamId;
	        var reason = event.reason;

	        return endStream.call(this, streamId, reason);
	    }

	    function dataQuality(event) {
	        var streamId = event.streamId;
	        var status = event.status;
	        var reason = event.reason;

	        var renderer = this._renderer[streamId];

	        if (renderer && typeof renderer.dataQualityChangedCallback === 'function') {
	            renderer.dataQualityChangedCallback(renderer, status, reason);
	        }

	        var publisher = this._publishers[streamId];

	        if (publisher && typeof publisher.dataQualityChangedCallback === 'function') {
	            publisher.dataQualityChangedCallback(publisher, status, reason);
	        }
	    }

	    function endStream(streamId, reason) {
	        this._logger.info('[%s] Stream ended with reason [%s]', streamId, reason);

	        var mediaStream = this._mediaStreams[streamId];

	        if (mediaStream && typeof mediaStream.streamEndedCallback === 'function') {
	            mediaStream.streamEndedCallback(mediaStream, getStreamEndedReason(reason), reason);
	        }

	        delete this._mediaStreams[streamId];

	        var renderer = this._renderer[streamId];

	        if (renderer) {
	            this._logger.info('[%s] stop media stream', streamId);
	            mediaStream.stop();
	        }

	        delete this._renderer[streamId];

	        var publisher = this._publishers[streamId];

	        if (publisher && typeof publisher.publisherEndedCallback === 'function') {
	            publisher.publisherEndedCallback(publisher, getStreamEndedReason(reason), reason);
	        }

	        delete this._publishers[streamId];

	        var peerConnection = this._peerConnections[streamId];

	        closePeerConnection.call(this, streamId, peerConnection, 'ended');

	        delete this._peerConnections[streamId];
	    }

	    function setupStreamAddedListener(streamId, state, peerConnection, callback, options) {
	        var that = this;
	        var onAddStream = function onAddStream(event) {
	            if (state.failed) {
	                return;
	            }

	            var stream = event.stream;

	            if (!stream) {
	                state.failed = true;
	                that._logger.warn('[%s] No remote stream', streamId);

	                return callback.call(that, undefined, 'failed');
	            }

	            that._logger.info('[%s] Got remote stream', streamId);

	            var mediaStream = {
	                createRenderer: function createRenderer() {
	                    var element = null;

	                    return {
	                        start: function start(elementToAttachTo) {
	                            element = phenixRTC.attachMediaStream(elementToAttachTo, stream);

	                            if (options.receiveAudio === false) {
	                                elementToAttachTo.muted = true;
	                            }

	                            that._renderer[streamId] = this;

	                            return element;
	                        },
	                        stop: function stop() {
	                            if (element) {
	                                element.pause();
	                            }

	                            delete that._renderer[streamId];

	                            element = null;
	                        },
	                        getStats: function getStats() {
	                            if (!element) {
	                                return {
	                                    width: 0,
	                                    height: 0,
	                                    currentTime: 0.0,
	                                    networkState: NetworkStates.NETWORK_NO_SOURCE
	                                }
	                            }

	                            return {
	                                width: element.videoWidth || element.width,
	                                height: element.videoHeight || element.height,
	                                currentTime: element.currentTime,
	                                networkState: element.networkState
	                            }
	                        },
	                        setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                            if (typeof callback !== 'function') {
	                                throw new Error('"callback" must be a function');
	                            }

	                            this.dataQualityChangedCallback = callback;
	                        }
	                    };
	                },

	                setStreamEndedCallback: function setStreamEndedCallback(callback) {
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    this.streamEndedCallback = callback;
	                },

	                setStreamErrorCallback: function setStreamErrorCallback(callback) {
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    this.streamErrorCallback = callback;
	                },

	                stop: function stop(reason) {
	                    var stream = event.stream;

	                    stopWebRTCStream(stream);

	                    if (state.stopped) {
	                        return;
	                    }

	                    closePeerConnection.call(that, streamId, peerConnection, 'stop');

	                    that._protocol.destroyStream(streamId, reason || '', function (value, error) {
	                        if (error) {
	                            that._logger.error('[%s] failed to destroy stream', streamId);
	                            return;
	                        }

	                        that._logger.info('[%s] destroyed stream', streamId);
	                    });

	                    state.stopped = true;
	                },

	                monitor: function monitor(options, callback) {
	                    if (typeof options !== 'object') {
	                        throw new Error('"options" must be an object');
	                    }
	                    if (typeof callback !== 'function') {
	                        throw new Error('"callback" must be a function');
	                    }

	                    var monitor = new PeerConnectionMonitor(streamId, peerConnection, that._logger);

	                    options.direction = 'inbound';

	                    monitor.start(options, function activeCallback() {
	                        return that._mediaStreams[streamId] === mediaStream && !state.stopped;
	                    }, function monitorCallback(reason) {
	                        that._logger.warn('[%s] Media stream triggered monitor condition for [%s]', streamId, reason);

	                        return callback(mediaStream, 'client-side-failure', reason);
	                    });
	                },

	                getStream: function getStream() {
	                    return stream;
	                },

	                isActive: function isActive() {
	                    return !state.stopped;
	                },

	                getStreamId: function getStreamId() {
	                    return streamId;
	                }
	            };

	            that._mediaStreams[streamId] = mediaStream;

	            callback.call(that, mediaStream);
	        };

	        phenixRTC.addEventListener(peerConnection, 'addstream', onAddStream);
	    }

	    function setupIceCandidateListener(streamId, peerConnection, callback) {
	        var that = this;
	        var onIceCandidate = function onIceCandidate(event) {
	            var candidate = event.candidate;

	            if (candidate) {
	                that._logger.debug('[%s] ICE candidate: [%s] [%s] [%s]', streamId, candidate.sdpMid, candidate.sdpMLineIndex, candidate.candidate);
	            } else {
	                that._logger.info('[%s] ICE candidate discovery complete', streamId);
	            }

	            if (callback) {
	                callback(candidate);
	            }
	        };

	        phenixRTC.addEventListener(peerConnection, 'icecandidate', onIceCandidate);
	    }

	    function setupStateListener(streamId, peerConnection) {
	        var that = this;
	        var onNegotiationNeeded = function onNegotiationNeeded(event) {
	            that._logger.info('[%s] Negotiation needed');
	        };
	        var onIceConnectionStateChanged = function onIceConnectionStateChanged(event) {
	            that._logger.info('[%s] ICE connection state changed [%s]', streamId, peerConnection.iceConnectionState);
	        };
	        var onIceGatheringStateChanged = function onIceGatheringStateChanged(event) {
	            that._logger.info('[%s] ICE gathering state changed [%s]', streamId, peerConnection.iceGatheringState);
	        };
	        var onSignalingStateChanged = function onSignalingStateChanged(event) {
	            that._logger.info('[%s] Signaling state changed [%s]', streamId, peerConnection.signalingState);
	        };
	        var onConnectionStateChanged = function onConnectionStateChanged(event) {
	            that._logger.info('[%s] Connection state changed [%s]', streamId, peerConnection.connectionState);
	        };

	        phenixRTC.addEventListener(peerConnection, 'negotiationneeded', onNegotiationNeeded);
	        phenixRTC.addEventListener(peerConnection, 'iceconnectionstatechange', onIceConnectionStateChanged);
	        phenixRTC.addEventListener(peerConnection, 'icegatheringstatechange ', onIceGatheringStateChanged);
	        phenixRTC.addEventListener(peerConnection, 'signalingstatechange', onSignalingStateChanged);
	        phenixRTC.addEventListener(peerConnection, 'connectionstatechange', onConnectionStateChanged);
	    }

	    function createPublisherPeerConnection(mediaStream, streamId, offerSdp, callback, options) {
	        var that = this;
	        var state = {
	            failed: false,
	            stopped: false
	        };
	        var hasCrypto = offerSdp.match(/a=crypto:/i);
	        var hasDataChannel = offerSdp.match(/m=application /i);
	        var peerConnection = new phenixRTC.RTCPeerConnection(peerConnectionConfig, {
	            'optional': [
	                {
	                    DtlsSrtpKeyAgreement: !hasCrypto
	                }, {
	                    RtpDataChannels: hasDataChannel
	                }
	            ]
	        });
	        var remoteMediaStream = null;
	        var onIceCandidateCallback = null;

	        that._peerConnections[streamId] = peerConnection;

	        peerConnection.addStream(mediaStream);

	        var onFailure = function onFailure() {
	            if (state.failed) {
	                return;
	            }

	            state.failed = true;
	            state.stopped = true;

	            delete that._peerConnections[streamId];

	            closePeerConnection.call(that, streamId, peerConnection, 'failure');

	            callback.call(that, undefined, 'failed');
	        };

	        function onSetRemoteDescriptionSuccess() {
	            that._logger.info('Set remote description (offer)');

	            function onCreateAnswerSuccess(answerSdp) {
	                that._logger.info('Created answer [%s]', answerSdp.sdp);

	                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
	                    if (error) {
	                        that._logger.warn('Failed to set answer description', error);
	                        return onFailure();
	                    }

	                    function onSetLocalDescriptionSuccess() {
	                        var bandwidthAttribute = /(b=AS:([0-9]*)[\n\r]*)/gi;
	                        var video = /(mid:video)([\n\r]*)/gi;

	                        that._logger.info('Set local description (answer)');

	                        var limit = 0;
	                        var bandwithAttribute = bandwidthAttribute.exec(offerSdp);

	                        if (bandwithAttribute && bandwithAttribute.length >= 3) {
	                            limit = bandwithAttribute[2] * 1000;
	                        }

	                        var publisher = {
	                            getStreamId: function getStreamId() {
	                                return streamId;
	                            },

	                            isActive: function isActive() {
	                                return !state.stopped;
	                            },

	                            hasEnded: function hasEnded() {
	                                switch (peerConnection.iceConnectionState) {
	                                    case 'new':
	                                    case 'checking':
	                                    case 'connected':
	                                    case 'completed':
	                                        return false;
	                                    case 'disconnected':
	                                    case 'failed':
	                                    case 'closed':
	                                        return true;
	                                    default:
	                                        return true;
	                                }
	                            },

	                            stop: function stop(reason) {
	                                if (state.stopped) {
	                                    return;
	                                }

	                                closePeerConnection.call(that, streamId, peerConnection, 'closed');

	                                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
	                                    if (error) {
	                                        that._logger.error('[%s] failed to destroy stream', streamId);
	                                        return;
	                                    }

	                                    that._logger.info('[%s] destroyed stream', streamId);
	                                });

	                                state.stopped = true;
	                            },

	                            setPublisherEndedCallback: function setPublisherEndedCallback(callback) {
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                this.publisherEndedCallback = callback;
	                            },

	                            setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                this.dataQualityChangedCallback = callback;
	                            },

	                            limitBandwidth: function limitBandwidth(bandwidthLimit) {
	                                if (typeof bandwidthLimit !== 'number') {
	                                    throw new Error('"bandwidthLimit" must be a number');
	                                }

	                                var newLimit = limit ? Math.min(bandwidthLimit, limit) : bandwidthLimit;
	                                var remoteDescription = peerConnection.remoteDescription;

	                                that._logger.info('Changing bandwidth limit to [%s]', newLimit);

	                                var updatedSdp = remoteDescription.sdp.replace(bandwidthAttribute, '');

	                                // Add new limit in kbps
	                                updatedSdp = updatedSdp.replace(video, function (match, videoLine, lineEnding, offset, sdp) {
	                                    return [videoLine, lineEnding, 'b=AS:', Math.ceil(newLimit / 1000), lineEnding].join('');
	                                });

	                                var updatedRemoteDescription = new phenixRTC.RTCSessionDescription({
	                                    type: remoteDescription.type,
	                                    sdp: updatedSdp
	                                });

	                                peerConnection.setRemoteDescription(updatedRemoteDescription);

	                                return {
	                                    dispose: function () {
	                                        peerConnection.setRemoteDescription(remoteDescription);
	                                    }
	                                }
	                            },

	                            monitor: function monitor(options, callback) {
	                                if (typeof options !== 'object') {
	                                    throw new Error('"options" must be an object');
	                                }
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                var monitor = new PeerConnectionMonitor(streamId, peerConnection, that._logger);

	                                options.direction = 'outbound';

	                                monitor.start(options, function activeCallback() {
	                                    return that._publishers[streamId] === publisher && !state.stopped;
	                                }, function monitorCallback(reason) {
	                                    that._logger.warn('[%s] Publisher triggered monitor condition for [%s]', streamId, reason);

	                                    return callback(publisher, 'client-side-failure', reason);
	                                });
	                            },

	                            setRemoteMediaStreamCallback: function setRemoteMediaStreamCallback(callback) {
	                                if (typeof callback !== 'function') {
	                                    throw new Error('"callback" must be a function');
	                                }

	                                this.remoteMediaStreamCallback = callback;

	                                if (remoteMediaStream) {
	                                    callback(publisher, remoteMediaStream);
	                                }
	                            }
	                        };

	                        that._publishers[streamId] = publisher;

	                        callback.call(that, publisher);
	                    }

	                    if (includes(response.options, 'ice-candidates')) {
	                        onIceCandidateCallback = function (candidate) {
	                            var candidates = [];
	                            var options = [];

	                            if (candidate) {
	                                candidates.push(candidate);
	                            } else {
	                                options.push('completed');
	                            }

	                            that._protocol.addIceCandidates(streamId, candidates, options, function (response, error) {
	                                if (error) {
	                                    that._logger.warn('Failed to add ICE candidate', error);
	                                    return;
	                                }

	                                if (includes(response.options, 'cancel')) {
	                                    onIceCandidateCallback = null;
	                                }
	                            });
	                        };
	                    }

	                    var sessionDescription = new phenixRTC.RTCSessionDescription({
	                        type: 'answer',
	                        sdp: response.sessionDescription.sdp
	                    });

	                    peerConnection.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
	                });
	            }

	            var mediaConstraints = {mandatory: {}};

	            if (phenixRTC.browser === 'Chrome') {
	                mediaConstraints.mandatory.OfferToReceiveVideo = options.receiveVideo === true;
	                mediaConstraints.mandatory.OfferToReceiveAudio = options.receiveAudio === true;
	            } else {
	                mediaConstraints.mandatory.offerToReceiveVideo = options.receiveVideo === true;
	                mediaConstraints.mandatory.offerToReceiveAudio = options.receiveAudio === true;
	            }

	            peerConnection.createAnswer(onCreateAnswerSuccess, onFailure, mediaConstraints);
	        }

	        setupStreamAddedListener.call(that, streamId, state, peerConnection, function (mediaStream) {
	            var publisher = that._publishers[streamId];

	            remoteMediaStream = mediaStream;

	            if (publisher && publisher.remoteMediaStreamCallback) {
	                publisher.remoteMediaStreamCallback(publisher, mediaStream);
	            }
	        }, options);
	        setupIceCandidateListener.call(that, streamId, peerConnection, function onIceCandidate(candidate) {
	            if (onIceCandidateCallback) {
	                onIceCandidateCallback(candidate);
	            }
	        });
	        setupStateListener.call(that, streamId, peerConnection);

	        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

	        peerConnection.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
	    }

	    function createViewerPeerConnection(streamId, offerSdp, callback, options) {
	        var that = this;
	        var state = {
	            failed: false,
	            stopped: false
	        };
	        var hasCrypto = offerSdp.match(/a=crypto:/i);
	        var hasDataChannel = offerSdp.match(/m=application /i);
	        var peerConnection = new phenixRTC.RTCPeerConnection(peerConnectionConfig, {
	            'optional': [
	                {
	                    DtlsSrtpKeyAgreement: !hasCrypto
	                }, {
	                    RtpDataChannels: hasDataChannel
	                }
	            ]
	        });
	        var onIceCandidateCallback = null;

	        that._peerConnections[streamId] = peerConnection;

	        var onFailure = function onFailure() {
	            if (state.failed) {
	                return;
	            }

	            state.failed = true;
	            state.stopped = true;

	            delete that._peerConnections[streamId];

	            closePeerConnection.call(that, streamId, peerConnection, 'failure');

	            callback.call(that, undefined, 'failed');
	        };

	        function onSetRemoteDescriptionSuccess() {
	            that._logger.debug('Set remote description (offer)');

	            function onCreateAnswerSuccess(answerSdp) {
	                that._logger.info('Created answer [%s]', answerSdp.sdp);

	                that._protocol.setAnswerDescription(streamId, answerSdp.sdp, function (response, error) {
	                    if (error) {
	                        that._logger.warn('Failed to set answer description', error);

	                        return onFailure();
	                    }

	                    function onSetLocalDescriptionSuccess() {
	                        that._logger.debug('Set local description (answer)');
	                    }

	                    if (includes(response.options, 'ice-candidates')) {
	                        onIceCandidateCallback = function (candidate) {
	                            var candidates = [];
	                            var options = [];

	                            if (candidate) {
	                                candidates.push(candidate);
	                            } else {
	                                options.push('completed');
	                            }

	                            that._protocol.addIceCandidates(streamId, candidate, options, function (response, error) {
	                                if (error) {
	                                    that._logger.warn('Failed to add ICE candidate', error);
	                                    return;
	                                }

	                                if (includes(response.options, 'cancel')) {
	                                    onIceCandidateCallback = null;
	                                }
	                            });
	                        };
	                    }

	                    var sessionDescription = new phenixRTC.RTCSessionDescription({
	                        type: 'answer',
	                        sdp: response.sessionDescription.sdp
	                    });

	                    peerConnection.setLocalDescription(sessionDescription, onSetLocalDescriptionSuccess, onFailure);
	                });
	            }

	            var mediaConstraints = {mandatory: {}};

	            if (phenixRTC.browser === 'Chrome') {
	                mediaConstraints.mandatory.OfferToReceiveVideo = options.receiveVideo !== false;
	                mediaConstraints.mandatory.OfferToReceiveAudio = options.receiveAudio !== false;
	            } else {
	                mediaConstraints.mandatory.offerToReceiveVideo = options.receiveVideo !== false;
	                mediaConstraints.mandatory.offerToReceiveAudio = options.receiveAudio !== false;
	            }

	            peerConnection.createAnswer(onCreateAnswerSuccess, onFailure, mediaConstraints);
	        }

	        setupStreamAddedListener.call(that, streamId, state, peerConnection, callback, options);
	        setupIceCandidateListener.call(that, streamId, peerConnection, function onIceCandidate(candidate) {
	            if (onIceCandidateCallback) {
	                onIceCandidateCallback(candidate);
	            }
	        });
	        setupStateListener.call(that, streamId, peerConnection);

	        var offerSessionDescription = new phenixRTC.RTCSessionDescription({type: 'offer', sdp: offerSdp});

	        peerConnection.setRemoteDescription(offerSessionDescription, onSetRemoteDescriptionSuccess, onFailure);
	    }

	    function createLiveViewer(streamId, offerSdp, callback, options) {
	        var that = this;

	        var dashMatch = offerSdp.match('a=x-playlist:([^\n]*[.]mpd)');
	        var hlsMatch = offerSdp.match('a=x-playlist:([^\n]*[.]m3u8)');

	        if (dashMatch && dashMatch.length === 2 && that._shaka && that._shaka.Player.isBrowserSupported()) {
	            return createShakaLiveViewer.call(that, streamId, dashMatch[1], callback, options);
	        } else if (hlsMatch && hlsMatch.length === 2 && document.createElement('video').canPlayType('application/vnd.apple.mpegURL') === 'maybe') {
	            return createHlsLiveViewer.call(that, streamId, hlsMatch[1], callback, options);
	        } else {
	            that._logger.warn('[%s] Offer does not contain a supported manifest', streamId, offerSdp);

	            return callback.call(that, undefined, 'failed');
	        }
	    }

	    function createShakaLiveViewer(streamId, uri, callback, options){
	        var that = this;

	        if (!that._shaka) {
	            that._logger.warn('[%s] Shaka player not available', streamId);

	            return callback.call(that, undefined, 'live-player-missing');
	        }

	        if (!that._shaka.Player.isBrowserSupported()) {
	            that._logger.warn('[%s] Shaka does not support this browser', streamId);

	            return callback.call(that, undefined, 'browser-unsupported');
	        }

	        var shaka = that._shaka;
	        var manifestUri = encodeURI(uri).replace(/[#]/g, '%23');
	        var stopped = false;

	        var onPlayerError = function onPlayerError(event) {
	            if (!mediaStream.streamErrorCallback) {
	                that._logger.error('[%s] DASH live stream error event [%s]', streamId, event.detail);
	            } else {
	                that._logger.debug('[%s] DASH live stream error event [%s]', streamId, event.detail);

	                mediaStream.streamErrorCallback(mediaStream, 'shaka', event.detail);
	            }
	        };

	        var mediaStream = {
	            createRenderer: function createRenderer() {
	                var player = null;

	                return {
	                    start: function start(elementToAttachTo) {
	                        player = new shaka.Player(elementToAttachTo);

	                        if (options.receiveAudio === false) {
	                            elementToAttachTo.muted = true;
	                        }

	                        that._renderer[streamId] = this;

	                        player.addEventListener('error', onPlayerError);

	                        var load = player.load(manifestUri).then(function () {
	                            that._logger.info('[%s] DASH live stream has been loaded', streamId);
	                        }).catch(function (e) {
	                            that._logger.error('[%s] Error while loading DASH live stream [%s]', streamId, e.code, e);

	                            if (mediaStream.streamErrorCallback) {
	                                mediaStream.streamErrorCallback(mediaStream, 'shaka', e);
	                            }
	                        });

	                        return elementToAttachTo;
	                    },

	                    stop: function stop() {
	                        if (player) {
	                            var streamEndedTriggered = false;
	                            var finalizeStreamEnded = function finalizeStreamEnded() {
	                                if (!streamEndedTriggered && mediaStream.streamEndedCallback) {
	                                    streamEndedTriggered = true;

	                                    var reason = '';

	                                    mediaStream.streamEndedCallback(mediaStream, getStreamEndedReason(reason), reason);
	                                }

	                                player = null;
	                            };

	                            var destroy = player.destroy()
	                                .then(function () {
	                                    that._logger.info('[%s] DASH live stream has been destroyed', streamId);
	                                }).then(function () {
	                                    finalizeStreamEnded();
	                                }).catch(function (e) {
	                                    that._logger.error('[%s] Error while destroying DASH live stream [%s]', streamId, e.code, e);

	                                    finalizeStreamEnded();

	                                    if (mediaStream.streamErrorCallback) {
	                                        mediaStream.streamErrorCallback(mediaStream, 'shaka', e);
	                                    }
	                                });
	                        }

	                        delete that._renderer[streamId];
	                    },

	                    getStats: function getStats() {
	                        if (!player) {
	                            return {
	                                width: 0,
	                                height: 0,
	                                currentTime: 0.0,
	                                networkState: NetworkStates.NETWORK_NO_SOURCE
	                            };
	                        }

	                        var stat = player.getStats();

	                        stat.currentTime = stat.playTime + stat.bufferingTime;

	                        if (stat.estimatedBandwidth > 0) {
	                            stat.networkState = NetworkStates.NETWORK_LOADING;
	                        } else if (stat.playTime > 0) {
	                            stat.networkState = NetworkStates.NETWORK_IDLE;
	                        } else if (stat.video) {
	                            stat.networkState = NetworkStates.NETWORK_EMPTY;
	                        } else {
	                            stat.networkState = NetworkStates.NETWORK_NO_SOURCE;
	                        }

	                        return stat;
	                    },

	                    setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                        if (typeof callback !== 'function') {
	                            throw new Error('"callback" must be a function');
	                        }

	                        this.dataQualityChangedCallback = callback;
	                    },

	                    getPlayer: function getPlayer() {
	                        return player;
	                    },

	                    isActive: function isActive() {
	                        return !stopped;
	                    },

	                    getStreamId: function getStreamId() {
	                        return streamId;
	                    }
	                };
	            },

	            setStreamEndedCallback: function setStreamEndedCallback(callback) {
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }

	                this.streamEndedCallback = callback;
	            },

	            setStreamErrorCallback: function setStreamErrorCallback(callback) {
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }

	                this.streamErrorCallback = callback;
	            },

	            stop: function stop(reason) {
	                if (stopped) {
	                    return;
	                }

	                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
	                    if (error) {
	                        that._logger.error('[%s] failed to destroy stream', streamId);
	                        return;
	                    }

	                    that._logger.info('[%s] destroyed stream', streamId);
	                });

	                stopped = true;
	            },

	            monitor: function monitor(options, callback) {
	                if (typeof options !== 'object') {
	                    throw new Error('"options" must be an object');
	                }
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }
	            }
	        };

	        callback.call(that, mediaStream);
	    }

	    function createHlsLiveViewer(streamId, uri, callback, options){
	        var that = this;

	        var manifestUri = encodeURI(uri).replace(/[#]/g, '%23');
	        var stopped = false;

	        var onPlayerError = function onPlayerError(event) {
	            if (!mediaStream.streamErrorCallback) {
	                that._logger.error('[%s] HLS live stream error event [%s]', streamId, event.detail);
	            } else {
	                that._logger.debug('[%s] HLS live stream error event [%s]', streamId, event.detail);
	                mediaStream.streamErrorCallback(mediaStream, 'hls', event.detail);
	            }
	        };

	        var mediaStream = {
	            createRenderer: function createRenderer() {
	                var element = null;

	                return {
	                    start: function start(elementToAttachTo) {
	                        try {
	                            elementToAttachTo.src = manifestUri;

	                            if (options.receiveAudio === false) {
	                                elementToAttachTo.muted = true;
	                            }

	                            that._renderer[streamId] = this;

	                            elementToAttachTo.addEventListener('error', onPlayerError);

	                            elementToAttachTo.play();
	                            element = elementToAttachTo;

	                            return elementToAttachTo;
	                        } catch (e) {
	                            that._logger.error('[%s] Error while loading HLS live stream [%s]', streamId, e.code, e);

	                            if (mediaStream.streamErrorCallback) {
	                                mediaStream.streamErrorCallback(mediaStream, 'hls', e);
	                            }
	                        }
	                    },

	                    stop: function stop() {
	                        if (element) {
	                            var streamEndedTriggered = false;
	                            var finalizeStreamEnded = function finalizeStreamEnded() {
	                                if (!streamEndedTriggered && mediaStream.streamEndedCallback) {
	                                    streamEndedTriggered = true;

	                                    var reason = '';

	                                    mediaStream.streamEndedCallback(mediaStream, getStreamEndedReason(reason), reason);
	                                }

	                                element = null;
	                            };

	                            try {
	                                element.pause();

	                                that._logger.info('[%s] HLS live stream has been destroyed', streamId);

	                                finalizeStreamEnded();
	                            } catch (e) {
	                                that._logger.error('[%s] Error while destroying HLS live stream [%s]', streamId, e.code, e);

	                                finalizeStreamEnded();

	                                if (mediaStream.streamErrorCallback) {
	                                    mediaStream.streamErrorCallback(mediaStream, 'hls', e);
	                                }
	                            }
	                        }

	                        delete that._renderer[streamId];
	                    },

	                    getStats: function getStats() {
	                        if (!element) {
	                            return {
	                                width: 0,
	                                height: 0,
	                                currentTime: 0.0,
	                                networkState: NetworkStates.NETWORK_NO_SOURCE
	                            };
	                        }

	                        return {
	                            width: element.videoWidth || element.width,
	                            height: element.videoHeight || element.height,
	                            currentTime: element.currentTime,
	                            networkState: element.networkState
	                        }
	                    },

	                    setDataQualityChangedCallback: function setDataQualityChangedCallback(callback) {
	                        if (typeof callback !== 'function') {
	                            throw new Error('"callback" must be a function');
	                        }

	                        this.dataQualityChangedCallback = callback;
	                    }
	                };
	            },

	            setStreamEndedCallback: function setStreamEndedCallback(callback) {
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }

	                this.streamEndedCallback = callback;
	            },

	            setStreamErrorCallback: function setStreamErrorCallback(callback) {
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }

	                this.streamErrorCallback = callback;
	            },

	            stop: function stop(reason) {
	                if (stopped) {
	                    return;
	                }

	                that._protocol.destroyStream(streamId, reason || '', function (value, error) {
	                    if (error) {
	                        that._logger.error('[%s] failed to destroy stream', streamId);
	                        return;
	                    }

	                    that._logger.info('[%s] destroyed stream', streamId);
	                });

	                stopped = true;
	            },

	            monitor: function monitor(options, callback) {
	                if (typeof options !== 'object') {
	                    throw new Error('"options" must be an object');
	                }
	                if (typeof callback !== 'function') {
	                    throw new Error('"callback" must be a function');
	                }
	            },

	            isActive: function isActive() {
	                return !stopped;
	            },

	            getStreamId: function getStreamId() {
	                return streamId;
	            }
	        };

	        callback.call(that, mediaStream);
	    }

	    function transitionToStatus(newStatus) {
	        if (this._status !== newStatus) {
	            this._status = newStatus;

	            switch (newStatus) {
	                case 'connecting':
	                    break;
	                case 'offline':
	                    this._offlineCallback.call(this);
	                    break;
	                case 'online':
	                    this._onlineCallback.call(this);
	                    break;
	            }
	        }
	    }

	    function stopWebRTCStream(stream) {
	        if (stream && typeof stream.getTracks === 'function') {
	            var tracks = stream.getTracks();

	            for (var i = 0; i < tracks.length; i++) {
	                var track = tracks[i];

	                track.stop();
	            }
	        }
	    }

	    function includes(array, value) {
	        if (!array) {
	            return false;
	        }

	        if (typeof array.indexOf === 'function') {
	            return array.indexOf(value) !== -1;
	        } else {
	            for (var i = 0; i < array.length; i++) {
	                if (array[i] === value) {
	                    return true;
	                }
	            }

	            return false;
	        }
	    }

	    function closePeerConnection(streamId, peerConnection, reason) {
	        if (peerConnection.signalingState !== 'closed' && !peerConnection.__closing) {
	            this._logger.debug('[%s] close peer connection [%s]', streamId, reason);
	            peerConnection.close();
	            peerConnection.__closing = true;
	        }
	    }

	    return PhenixPCast;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(3),
	        __webpack_require__(6),
	        __webpack_require__(7)
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function (MQProtocol, ByteBuffer, phenixRTC) {
	    'use strict';

	    function PCastProtocol(uri, deviceId, version, logger) {
	        if (typeof uri !== 'string') {
	            throw new Error('Must pass a valid "uri"');
	        }
	        if (typeof deviceId !== 'string') {
	            throw new Error('Must pass a valid "deviceId"');
	        }
	        if (typeof version !== 'string') {
	            throw new Error('Must pass a valid "version"');
	        }
	        if (typeof logger !== 'object') {
	            throw new Error('Must pass a valid "logger"');
	        }
	        this._uri = uri;
	        this._deviceId = deviceId;
	        this._version = version;
	        this._logger = logger;
	        this._mqProtocol = new MQProtocol(this._logger);

	        this._logger.info('Connecting to [%s]', uri);
	        this._webSocket = new WebSocket(uri);
	        this._webSocket.onopen = onOpen.bind(this);
	        this._webSocket.onclose = onClose.bind(this);
	        this._webSocket.onmessage = onMessage.bind(this);
	        this._webSocket.onerror = onError.bind(this);

	        this._nextRequestId = 0;
	        this._events = {};
	        this._requests = {};
	    }

	    PCastProtocol.prototype.on = function (eventName, handler) {
	        if (typeof eventName !== 'string') {
	            throw new Error('"eventName" must be a string');
	        }
	        if (typeof handler !== 'function') {
	            throw new Error('"handler" must be a function');
	        }

	        var handlers = getEventHandlers.call(this, eventName);

	        handlers.push(handler);
	    };

	    PCastProtocol.prototype.authenticate = function (authToken, callback) {
	        if (typeof authToken !== 'string') {
	            throw new Error('"authToken" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var authenticate = {
	            apiVersion: this._mqProtocol.getApiVersion(),
	            clientVersion: this._version,
	            deviceId: this._deviceId,
	            platform: phenixRTC.browser,
	            platformVersion: phenixRTC.browserVersion.toString(),
	            authenticationToken: authToken
	        };

	        if (this._sessionId) {
	            auth.sessionId = this._sessionId;
	        }

	        return sendRequest.call(this, 'pcast.Authenticate', authenticate, callback);
	    };

	    PCastProtocol.prototype.disconnect = function () {
	        delete this._sessionId;

	        return this._webSocket.close(1000, 'byebye');
	    };

	    PCastProtocol.prototype.bye = function (reason, callback) {
	        if (typeof reason !== 'string') {
	            throw new Error('"reason" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var bye = {
	            sessionId: this._sessionId,
	            reason: reason
	        };

	        return sendRequest.call(this, 'pcast.Bye', bye, callback);
	    };

	    PCastProtocol.prototype.setupStream = function (streamType, streamToken, callback) {
	        if (typeof streamType !== 'string') {
	            throw new Error('"streamType" must be a string');
	        }
	        if (typeof streamToken !== 'string') {
	            throw new Error('"streamToken" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var browser = phenixRTC.browser || 'UnknownBrowser';
	        var browserWithVersion = browser + '-' + (phenixRTC.browserVersion || 0);
	        var setupStream = {
	            streamToken: streamToken,
	            createStream: {
	                sessionId: this._sessionId,
	                options: ['data-quality-notifications'],
	                createOfferDescription: {
	                    streamId: '',
	                    options: [streamType, 'SRTP', browser, browserWithVersion],
	                    apiVersion: this._mqProtocol.getApiVersion()
	                }
	            }
	        };

	        return sendRequest.call(this, 'pcast.SetupStream', setupStream, callback);
	    };

	    PCastProtocol.prototype.setAnswerDescription = function (streamId, sdp, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (typeof sdp !== 'string') {
	            throw new Error('"sdp" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var setRemoteDescription = {
	            streamId: streamId,
	            sessionDescription: {
	                type: 'Answer',
	                sdp: sdp
	            },
	            apiVersion: this._mqProtocol.getApiVersion()
	        };

	        return sendRequest.call(this, 'pcast.SetRemoteDescription', setRemoteDescription, callback);
	    };

	    PCastProtocol.prototype.addIceCandidates = function (streamId, candidates, options, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (!(candidates instanceof Array)) {
	            throw new Error('"candidates" must be an array');
	        }
	        if (!(options instanceof Array)) {
	            throw new Error('"options" must be an array');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var sanitizedCandidates = [];
	        for (var i = 0; i < candidates.length; i++) {
	            var candidate = candidates[i];

	            if (typeof candidate.candidate !== 'string') {
	                throw new Error('"candidates[' + i + '].candidate" must be a string');
	            }
	            if (typeof candidate.sdpMLineIndex !== 'number') {
	                throw new Error('"candidates[' + i + '].sdpMLineIndex" must be a number');
	            }
	            if (typeof candidate.sdpMid !== 'string') {
	                throw new Error('"candidates[' + i + '].sdpMid" must be a string');
	            }

	            sanitizedCandidates.push({
	                candidate: candidate.candidate,
	                sdpMLineIndex: candidate.sdpMLineIndex,
	                sdpMid: candidate.sdpMid
	            });
	        }

	        var addIceCandidates = {
	            streamId: streamId,
	            candidates: sanitizedCandidates,
	            options: options,
	            apiVersion: this._mqProtocol.getApiVersion()
	        };

	        return sendRequest.call(this, 'pcast.AddIceCandidates', addIceCandidates, callback);
	    };

	    PCastProtocol.prototype.updateStreamState = function (streamId, signalingState, iceGatheringState, iceConnectionState, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (typeof signalingState !== 'string') {
	            throw new Error('"signalingState" must be a string');
	        }
	        if (typeof iceGatheringState !== 'string') {
	            throw new Error('"iceGatheringState" must be a string');
	        }
	        if (typeof iceConnectionState !== 'string') {
	            throw new Error('"iceConnectionState" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var updateStreamState = {
	            streamId: streamId,
	            signalingState: signalingState,
	            iceGatheringState: iceGatheringState,
	            iceConnectionState: iceConnectionState,
	            apiVersion: this._mqProtocol.getApiVersion()
	        };

	        return sendRequest.call(this, 'pcast.UpdateStreamState', updateStreamState, callback);
	    };

	    PCastProtocol.prototype.destroyStream = function (streamId, reason, callback) {
	        if (typeof streamId !== 'string') {
	            throw new Error('"streamId" must be a string');
	        }
	        if (typeof reason !== 'string') {
	            throw new Error('"reason" must be a string');
	        }
	        if (typeof callback !== 'function') {
	            throw new Error('"callback" must be a function');
	        }

	        var destroyStream = {
	            streamId: streamId,
	            reason: reason
	        };

	        return sendRequest.call(this, 'pcast.DestroyStream', destroyStream, callback);
	    };

	    PCastProtocol.prototype.toString = function () {
	        return 'PCastProtocol[' + this._uri + ',' + this._webSocket.readyState + ']';
	    };

	    function sendRequest(type, message, callback) {
	        var requestId = (this._nextRequestId++).toString();
	        var request = {
	            requestId: requestId,
	            type: type,
	            payload: this._mqProtocol.encode(type, message)
	        };

	        this._requests[requestId] = callback;

	        return this._webSocket.send(this._mqProtocol.encode('mq.Request', request).toString('base64'));
	    }

	    function getEventHandlers(eventName) {
	        var handlers = this._events[eventName];

	        if (!handlers) {
	            this._events[eventName] = handlers = [];
	        }

	        return handlers;
	    }

	    function triggerEvent(eventName, args) {
	        var handlers = this._events[eventName];

	        if (handlers) {
	            for (var i = 0; i < handlers.length; i++) {
	                handlers[i].apply(this, args);
	            }
	        }
	    }

	    function onOpen(evt) {
	        this._logger.info('Connected');
	        triggerEvent.call(this, 'connected');
	    }

	    function onClose(evt) {
	        this._logger.info('Disconnected [%s]: [%s]', evt.code, evt.reason);
	        triggerEvent.call(this, 'disconnected', [evt.code, evt.reason]);
	    }

	    function onMessage(evt) {
	        this._logger.debug('>> [%s]', evt.data);

	        var response = this._mqProtocol.decode('mq.Response', ByteBuffer.wrap(evt.data, 'base64'));
	        this._logger.info('>> [%s]', response.type);

	        var message = this._mqProtocol.decode(response.type, response.payload);

	        if (response.type === 'pcast.AuthenticateResponse') {
	            this._sessionId = message.sessionId;
	        } else if (response.type === 'pcast.StreamEnded') {
	            triggerEvent.call(this, 'streamEnded', [message]);
	        } else if (response.type === 'pcast.StreamDataQuality') {
	            triggerEvent.call(this, 'dataQuality', [message]);
	        }

	        var callback = this._requests[response.requestId];

	        if (callback) {
	            delete this._requests[response.requestId];

	            if (response.type === 'mq.Error' || message.status !== 'ok') {
	                callback(undefined, message);
	            } else {
	                callback(message);
	            }
	        }
	    }

	    function onError(evt) {
	        this._logger.error('An error occurred', evt.data);
	    }

	    return PCastProtocol;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(4),
	        __webpack_require__(5)
	    ], __WEBPACK_AMD_DEFINE_RESULT__ = function (Logger, ProtoBuf) {
	    'use strict';

	    var mqProto = '{"package":"mq","messages":[{"name":"Request","fields":[{"rule":"optional","type":"string","name":"sessionId","id":1},{"rule":"optional","type":"string","name":"requestId","id":2},{"rule":"required","type":"string","name":"type","id":3},{"rule":"optional","type":"string","name":"encoding","id":4},{"rule":"required","type":"bytes","name":"payload","id":5}]},{"name":"Response","fields":[{"rule":"optional","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"requestId","id":2},{"rule":"required","type":"string","name":"type","id":3},{"rule":"optional","type":"string","name":"encoding","id":4},{"rule":"required","type":"bytes","name":"payload","id":5},{"rule":"repeated","type":"double","name":"wallTime","id":6}]},{"name":"Error","fields":[{"rule":"required","type":"string","name":"reason","id":1}]},{"name":"PingPong","fields":[{"rule":"required","type":"uint64","name":"originTimestamp","id":1},{"rule":"optional","type":"uint64","name":"count","id":2}]}]}';
	    var pcastProto = '{"package":"pcast","messages":[{"name":"Authenticate","fields":[{"rule":"optional","type":"uint32","name":"apiVersion","id":9,"options":{"default":0}},{"rule":"required","type":"string","name":"clientVersion","id":1},{"rule":"optional","type":"string","name":"device","id":12},{"rule":"required","type":"string","name":"deviceId","id":2},{"rule":"optional","type":"string","name":"manufacturer","id":13},{"rule":"required","type":"string","name":"platform","id":3},{"rule":"required","type":"string","name":"platformVersion","id":4},{"rule":"required","type":"string","name":"authenticationToken","id":5},{"rule":"optional","type":"string","name":"connectionId","id":6},{"rule":"optional","type":"string","name":"connectionRouteKey","id":10},{"rule":"optional","type":"string","name":"remoteAddress","id":11},{"rule":"optional","type":"string","name":"sessionId","id":7},{"rule":"optional","type":"string","name":"applicationId","id":8}]},{"name":"AuthenticateResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"sessionId","id":2},{"rule":"optional","type":"string","name":"redirect","id":3}]},{"name":"Bye","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"reason","id":2}]},{"name":"ByeResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"SessionDescription","fields":[{"rule":"required","type":"Type","name":"type","id":1,"options":{"default":"Offer"}},{"rule":"required","type":"string","name":"sdp","id":2}],"enums":[{"name":"Type","values":[{"name":"Offer","id":0},{"name":"Answer","id":1}]}]},{"name":"CreateStream","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"optional","type":"string","name":"originStreamId","id":2},{"rule":"repeated","type":"string","name":"options","id":3},{"rule":"repeated","type":"string","name":"tags","id":4},{"rule":"optional","type":"SetRemoteDescription","name":"setRemoteDescription","id":5},{"rule":"optional","type":"CreateOfferDescription","name":"createOfferDescription","id":6},{"rule":"optional","type":"CreateAnswerDescription","name":"createAnswerDescription","id":7}]},{"name":"CreateStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"streamId","id":2},{"rule":"optional","type":"string","name":"instanceRouteKey","id":5},{"rule":"optional","type":"SetRemoteDescriptionResponse","name":"setRemoteDescriptionResponse","id":3},{"rule":"optional","type":"CreateOfferDescriptionResponse","name":"createOfferDescriptionResponse","id":4},{"rule":"optional","type":"CreateAnswerDescriptionResponse","name":"createAnswerDescriptionResponse","id":6},{"rule":"repeated","type":"string","name":"options","id":7}]},{"name":"SetLocalDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"required","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"SetLocalDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"repeated","type":"string","name":"options","id":2}]},{"name":"SetRemoteDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"required","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"SetRemoteDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"repeated","type":"string","name":"options","id":3}]},{"name":"CreateOfferDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"repeated","type":"string","name":"options","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"CreateOfferDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"repeated","type":"string","name":"options","id":3}]},{"name":"CreateAnswerDescription","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"repeated","type":"string","name":"options","id":2},{"rule":"optional","type":"uint32","name":"apiVersion","id":3,"options":{"default":0}}]},{"name":"CreateAnswerDescriptionResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"SessionDescription","name":"sessionDescription","id":2},{"rule":"repeated","type":"string","name":"options","id":3}]},{"name":"IceCandidate","fields":[{"rule":"required","type":"string","name":"candidate","id":1},{"rule":"required","type":"uint32","name":"sdpMLineIndex","id":2},{"rule":"required","type":"string","name":"sdpMid","id":3}]},{"name":"AddIceCandidates","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"repeated","type":"IceCandidate","name":"candidates","id":2},{"rule":"repeated","type":"string","name":"options","id":3},{"rule":"optional","type":"uint32","name":"apiVersion","id":4,"options":{"default":0}}]},{"name":"AddIceCandidatesResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"repeated","type":"string","name":"options","id":2}]},{"name":"UpdateStreamState","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"required","type":"string","name":"signalingState","id":2},{"rule":"required","type":"string","name":"iceGatheringState","id":3},{"rule":"required","type":"string","name":"iceConnectionState","id":4},{"rule":"optional","type":"uint32","name":"apiVersion","id":5,"options":{"default":0}}]},{"name":"UpdateStreamStateResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"repeated","type":"string","name":"options","id":2}]},{"name":"DestroyStream","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"optional","type":"string","name":"reason","id":2}]},{"name":"DestroyStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"StreamStarted","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"repeated","type":"string","name":"tags","id":3}]},{"name":"SourceStreamStarted","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"repeated","type":"string","name":"tags","id":3}]},{"name":"StreamEnded","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"required","type":"string","name":"reason","id":3}]},{"name":"StreamEndedResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"StreamArchived","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"required","type":"string","name":"uri","id":3}]},{"name":"SessionEnded","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"reason","id":2},{"rule":"required","type":"float","name":"duration","id":3}]},{"name":"IssueAuthenticationToken","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"repeated","type":"string","name":"capabilities","id":3}]},{"name":"IssueAuthenticationTokenResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"authenticationToken","id":2}]},{"name":"IssueStreamToken","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"required","type":"string","name":"sessionId","id":3},{"rule":"optional","type":"string","name":"originStreamId","id":4},{"rule":"repeated","type":"string","name":"capabilities","id":5}]},{"name":"IssueStreamTokenResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"streamToken","id":2}]},{"name":"Stream","fields":[{"rule":"required","type":"string","name":"streamId","id":1}]},{"name":"ListStreams","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"optional","type":"string","name":"start","id":3},{"rule":"required","type":"uint32","name":"length","id":4}]},{"name":"ListStreamsResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"start","id":2},{"rule":"optional","type":"uint32","name":"length","id":3},{"rule":"repeated","type":"Stream","name":"streams","id":4}]},{"name":"TerminateStream","fields":[{"rule":"required","type":"string","name":"applicationId","id":1},{"rule":"required","type":"string","name":"secret","id":2},{"rule":"required","type":"string","name":"streamId","id":3},{"rule":"optional","type":"string","name":"reason","id":4}]},{"name":"TerminateStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"SetupStream","fields":[{"rule":"required","type":"string","name":"streamToken","id":1},{"rule":"required","type":"CreateStream","name":"createStream","id":2}]},{"name":"SetupStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"CreateStreamResponse","name":"createStreamResponse","id":2}]},{"name":"EndStream","fields":[{"rule":"required","type":"string","name":"streamId","id":1},{"rule":"optional","type":"string","name":"reason","id":2,"options":{"default":"ended"}}]},{"name":"EndStreamResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"StreamDataQuality","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"streamId","id":2},{"rule":"required","type":"uint64","name":"timestamp","id":3},{"rule":"required","type":"DataQualityStatus","name":"status","id":4},{"rule":"required","type":"DataQualityReason","name":"reason","id":5}],"enums":[{"name":"DataQualityStatus","values":[{"name":"NoData","id":0},{"name":"AudioOnly","id":1},{"name":"All","id":2}]},{"name":"DataQualityReason","values":[{"name":"None","id":0},{"name":"UploadLimited","id":1},{"name":"DownloadLimited","id":2},{"name":"PublisherLimited","id":3},{"name":"NetworkLimited","id":4}]}]},{"name":"StreamDataQualityResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]}]}';
	    var chatProto = '{"package":"chat","messages":[{"name":"Room","fields":[{"rule":"optional","type":"string","name":"roomId","id":1},{"rule":"required","type":"string","name":"name","id":2},{"rule":"required","type":"string","name":"description","id":3},{"rule":"required","type":"RoomType","name":"type","id":4},{"rule":"repeated","type":"string","name":"options","id":5}]},{"name":"Stream","fields":[{"rule":"required","type":"StreamType","name":"type","id":1},{"rule":"required","type":"string","name":"uri","id":2},{"rule":"required","type":"TrackState","name":"audioState","id":3},{"rule":"required","type":"TrackState","name":"videoState","id":4}]},{"name":"Member","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"screenName","id":2},{"rule":"required","type":"MemberRole","name":"role","id":3},{"rule":"repeated","type":"Stream","name":"streams","id":4},{"rule":"required","type":"uint64","name":"lastUpdate","id":7}]},{"name":"CreateRoom","fields":[{"rule":"required","type":"Room","name":"room","id":1}]},{"name":"CreateRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"string","name":"roomId","id":2}]},{"name":"JoinRoom","fields":[{"rule":"required","type":"string","name":"roomId","id":1},{"rule":"required","type":"string","name":"sessionId","id":2},{"rule":"required","type":"Member","name":"member","id":3},{"rule":"repeated","type":"string","name":"options","id":4},{"rule":"required","type":"uint64","name":"timestamp","id":5}]},{"name":"JoinRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1},{"rule":"optional","type":"Room","name":"room","id":2},{"rule":"repeated","type":"Member","name":"members","id":3},{"rule":"repeated","type":"string","name":"options","id":4}]},{"name":"UpdateRoom","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"Room","name":"room","id":2},{"rule":"required","type":"uint64","name":"timestamp","id":3}]},{"name":"UpdateRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"UpdateMember","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"Member","name":"member","id":2},{"rule":"repeated","type":"string","name":"options","id":3},{"rule":"required","type":"uint64","name":"timestamp","id":4}]},{"name":"UpdateMemberResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"LeaveRoom","fields":[{"rule":"required","type":"string","name":"roomId","id":1},{"rule":"required","type":"string","name":"sessionId","id":2},{"rule":"required","type":"uint64","name":"timestamp","id":3}]},{"name":"LeaveRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"DestroyRoom","fields":[{"rule":"required","type":"string","name":"roomId","id":1}]},{"name":"DestroyRoomResponse","fields":[{"rule":"required","type":"string","name":"status","id":1}]},{"name":"RoomEvent","fields":[{"rule":"required","type":"string","name":"sessionId","id":1},{"rule":"required","type":"string","name":"roomId","id":2},{"rule":"required","type":"RoomEventType","name":"eventType","id":3},{"rule":"repeated","type":"Member","name":"members","id":4},{"rule":"optional","type":"Room","name":"room","id":5},{"rule":"repeated","type":"string","name":"options","id":6},{"rule":"required","type":"uint64","name":"timestamp","id":7}]}],"enums":[{"name":"RoomType","values":[{"name":"DirectChat","id":0},{"name":"MultiPartyChat","id":1},{"name":"ModeratedChat","id":2},{"name":"TownHall","id":3}]},{"name":"MemberRole","values":[{"name":"Participant","id":0},{"name":"Moderator","id":1},{"name":"Presenter","id":2},{"name":"Audience","id":3}]},{"name":"RoomEventType","values":[{"name":"MemberJoined","id":0},{"name":"MemberLeft","id":1},{"name":"MemberUpdated","id":2},{"name":"Updated","id":3},{"name":"Ended","id":4}]},{"name":"TrackState","values":[{"name":"Enabled","id":0},{"name":"Disabled","id":1},{"name":"Ended","id":2}]},{"name":"StreamType","values":[{"name":"User","id":0},{"name":"Presentation","id":1}]}]}';

	    function MQProtocol(logger) {
	        this._logger = logger || new Logger();
	        var builder = ProtoBuf.loadJson(mqProto);

	        builder = ProtoBuf.loadJson(pcastProto, builder);
	        builder = ProtoBuf.loadJson(chatProto, builder);

	        this._builders = builder.build();
	        this._apiVersion = 3;
	    }

	    MQProtocol.prototype.getApiVersion = function () {
	        return this._apiVersion;
	    };

	    MQProtocol.prototype.encode = function (type, data) {
	        if (typeof type !== 'string') {
	            throw new Error("'type' must be a string");
	        }
	        if (typeof data !== 'object') {
	            throw new Error("'data' must be an object");
	        }

	        var builder = getBuilder.call(this, type);

	        return builder.encode(data);
	    };

	    MQProtocol.prototype.decode = function (type, value) {
	        if (typeof type !== 'string') {
	            throw new Error("'type' must be a string");
	        }

	        var builder = getBuilder.call(this, type);

	        return stringifyEnums(builder.decode(value));
	    };

	    function getBuilder(type) {
	        var fragments = type.split('.');
	        var builder = this._builders;

	        for (var i = 0; i < fragments.length - 1; i++) {
	            builder = builder[fragments[i]];

	            if (!builder) {
	                throw new Error('Unsupported type "' + type + '"');
	            }
	        }

	        builder = builder[fragments[fragments.length - 1]];

	        if (typeof builder !== 'function') {
	            throw new Error('Unsupported type "' + type + '"');
	        }

	        return builder;
	    }

	    function stringifyEnums(message) {
	        if (message && message.$type && message.$type.children) {
	            for (var key in message.$type.children) {
	                var child = message.$type.children[key];
	                var value = message[child.name];
	                var type = child && child.element ? child.element.resolvedType : null;

	                if (type && type.className === 'Message' && type.children) {
	                    message[child.name] = stringifyEnums(value);
	                } else if (type && type.className === 'Enum' && type.children) {
	                    var metaValue = null;

	                    for (var i = 0; i < type.children.length; i++) {
	                        if (type.children[i].id === value) {
	                            metaValue = type.children[i];
	                            break;
	                        }
	                    }

	                    if (metaValue && metaValue.name) {
	                        message[child.name] = metaValue.name;
	                    }
	                }
	            }
	        }

	        return message;
	    }

	    return MQProtocol;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ ], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    var log = function () {
	            console.log.apply(console, arguments);
	        } || function () {
	        };
	    var logError = function () {
	            console.error.apply(console, arguments);
	        } || log;

	    function Logger() {
	    }

	    Logger.prototype.trace = function (/*formatStr, [parameter], ...*/) {
	        return log(arguments);
	    };

	    Logger.prototype.debug = function (/*formatStr, [parameter], ...*/) {
	        return log(arguments);
	    };

	    Logger.prototype.info = function (/*formatStr, [parameter], ...*/) {
	        return log(arguments);
	    };

	    Logger.prototype.warn = function (/*formatStr, [parameter], ...*/) {
	        return logError(arguments);
	    };

	    Logger.prototype.error = function (/*formatStr, [parameter], ...*/) {
	        return logError(arguments);
	    };

	    Logger.prototype.fatal = function (/*formatStr, [parameter], ...*/) {
	        return logError(arguments);
	    };

	    return Logger;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(9)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Time) {
	    'use strict';

	    function PCastEndPoint(version, baseUri, logger) {
	        if (typeof version !== 'string') {
	            throw new Error('Must pass a valid "version"');
	        }
	        if (typeof baseUri !== 'string') {
	            throw new Error('Must pass a valid "baseUri"');
	        }
	        if (typeof logger !== 'object') {
	            throw new Error('Must pass a valid "logger"');
	        }

	        this._version = version;
	        this._baseUri = baseUri;
	        this._logger = logger;
	    }

	    PCastEndPoint.DefaultPCastUri = 'https://pcast.phenixp2p.com';

	    PCastEndPoint.prototype.getBaseUri = function () {
	        return this._baseUri;
	    };

	    PCastEndPoint.prototype.resolveUri = function (callback /* (error, uri) */) {
	        return resolveUri.call(this, this._baseUri, callback);
	    };

	    PCastEndPoint.prototype.toString = function () {
	        return 'PCastEndPoint[' + this._baseUri + ']';
	    };

	    function resolveUri(baseUri, callback /* (error, uri) */) {
	        var that = this;

	        if (baseUri.lastIndexOf('wss:', 0) === 0) {
	            // WSS - Specific web socket end point
	            callback.call(that, undefined, baseUri + '/ws');
	        } else if (baseUri.lastIndexOf('https:', 0) === 0) {
	            // HTTP - Resolve closest end point
	            httpGetWithRetry.call(that, baseUri + '/pcast/endPoints', function (err, responseText) {
	                if (err) {
	                    callback(new Error('Failed to resolve an end point', err));
	                    return callback(err);
	                }

	                var endPoints = responseText.split(',');

	                if (endPoints.length < 1) {
	                    callback(new Error('Failed to discover end points'));
	                }

	                var done = false;
	                var minTime = Number.MAX_VALUE;
	                var minResponseText = '';

	                for (var i = 0; i < endPoints.length; i++) {
	                    resolveEndPoint.call(that,
	                        endPoints[i],
	                        measurementsPerEndPoint,
	                        function measurementCallback(endPoint, time, responseText) {
	                            if (time < minTime) {
	                                that._logger.info('Current closest end point is [%s] with latency of [%s] ms', responseText, time);
	                                minTime = time;
	                                minResponseText = responseText;
	                            }

	                            return done;
	                        },
	                        function completeCallback(endPoint) {
	                            if (minResponseText && minTime < Number.MAX_VALUE) {
	                                done = true;
	                                return callback.call(that, undefined, minResponseText);
	                            }
	                        });
	                }
	            }, maxAttempts);
	        } else {
	            // Not supported
	            callback.call(that, new Error('Uri not supported'));
	        }
	    }

	    var measurementsPerEndPoint = 4;
	    var maxAttempts = 3;

	    function resolveEndPoint(endPoint, measurements, measurementCallback, completeCallback) {
	        var that = this;
	        var measurement = 1;

	        var nextMeasurement = function nextMeasurement(endPoint) {
	            var maxAttempts = 1;
	            var start = Time.now();

	            that._logger.info('[%s] Checking end point [%s]', measurement, endPoint);

	            httpGetWithRetry.call(that, endPoint, function (err, responseText) {
	                var end = Time.now();
	                var time = end - start;

	                that._logger.info('[%s] End point [%s] latency is [%s] ms', measurement, endPoint, time);

	                measurement++;

	                if (!err) {
	                    if (measurementCallback(endPoint, time, responseText)) {
	                        // done
	                        return;
	                    }
	                }

	                if (measurement <= measurements) {
	                    if (err) {
	                        that._logger.info('Retrying after failure to resolve end point [%s]', endPoint, err);
	                    }

	                    return nextMeasurement(endPoint);
	                } else {
	                    return completeCallback(endPoint);
	                }
	            }, maxAttempts);
	        };

	        nextMeasurement(endPoint);
	    }

	    function httpGetWithRetry(url, callback, maxAttempts, attempt) {
	        if (attempt === undefined) {
	            attempt = 1;
	        }

	        var that = this;
	        var xhr = new XMLHttpRequest();
	        var requestMethod = 'GET';
	        var requestUrl = url + '?version=' + encodeURIComponent(that._version) + '&_=' + Time.now();

	        if ('withCredentials' in xhr) {
	            // Most browsers.
	            xhr.open(requestMethod, requestUrl, true);
	        } else if (typeof XDomainRequest != 'undefined') {
	            // IE8 & IE9
	            xhr = new XDomainRequest();
	            xhr.open(requestMethod, requestUrl);
	        } else {
	            // CORS not supported.
	            var err = new Error('unsupported');

	            err.code = 'unsupported';

	            callback(err);
	        }

	        xhr.addEventListener('readystatechange', function () {
	            if (xhr.readyState === 4 /* DONE */) {
	                if (xhr.status === 200) {
	                    callback(undefined, xhr.responseText);
	                } else if (xhr.status >= 500 && xhr.status < 600 && attempt <= maxAttempts) {
	                    httpGetWithRetry.call(that, url, callback, maxAttempts, attempt + 1);
	                } else {
	                    that._logger.info('HTTP GET [%s] failed with [%s] [%s]', url, xhr.status, xhr.statusText);

	                    var err = new Error(xhr.status === 0 ? 'timeout' : xhr.statusText);

	                    err.code = xhr.status;

	                    callback(err);
	                }
	            }
	        });

	        xhr.timeout = 15000;

	        xhr.send();
	    }

	    return PCastEndPoint;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [ ], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	    'use strict';

	    function Time() {
	        this._version = version;
	        this._baseUri = baseUri;
	    }

	    Time.now = function () {
	        if (!Date.now) {
	            return function () {
	                return new Date().getTime();
	            }
	        }

	        return function () {
	            return Date.now();
	        }
	    }();

	    return Time;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
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
	!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	        __webpack_require__(9),
	        __webpack_require__(7)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function (Time, phenixRTC) {
	    'use strict';

	    var defaultMonitoringInterval = 4000;
	    var defaultConditionMonitoringInterval = 1500;
	    var defaultFrameRateThreshold = 2;
	    var defaultAudioBitRateThreshold = 5000;
	    var defaultVideoBitRateThreshold = 10000;
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
	        var lastVideoBytes = {time: Time.now(), value: 0};
	        var lastAudioBytes = {time: Time.now(), value: 0};
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

	                            if (options.direction === 'outbound' && stats.type === 'outboundrtp') {
	                                var currentBytes = {
	                                    time: Time.now(),
	                                    value: stats.bytesSent || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Outbound [%s] [%s] with bitrate [%s], droppedFrames [%s] and frame rate [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.bitrateMean, stats.droppedFrames, stats.framerateMean);
	                                        hasFrameRate = true;
	                                        frameRate = stats.framerateMean || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Outbound [%s] [%s]',
	                                            name, stats.mediaType, stats.ssrc);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
	                                        break;
	                                }
	                            }
	                            if (options.direction === 'inbound' && stats.type === 'inboundrtp') {
	                                var currentBytes = {
	                                    time: Time.now(),
	                                    value: stats.bytesReceived || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with framerate [%s] and jitter [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.framerateMean, stats.jitter);

	                                        // Inbound frame rate is not calculated correctly
	                                        // hasFrameRate = true;
	                                        // frameRate = stats.framerateMean || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with jitter [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.jitter);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
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
	                            if (options.direction === 'outbound') {
	                                var currentBytes = {
	                                    time: Time.now(),
	                                    value: stats.bytesSent || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Outbound [%s] [%s] with average encoding time [%s] ms (CPU limited=[%s]) and RTT [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.googAvgEncodeMs, stats.googCpuLimitedResolution, stats.googRtt);
	                                        hasFrameRate = true;
	                                        frameRate = stats.googFrameRateSent || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Outbound [%s] [%s] with audio input level [%s] and RTT [%s] and jitter [%s]',
	                                            name, stats.mediaType, stats.ssrc, stats.audioInputLevel, stats.googRtt, stats.googJitterReceived);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
	                                        break;
	                                }
	                            } else if (options.direction === 'inbound') {
	                                var currentBytes = {
	                                    time: Time.now(),
	                                    value: stats.bytesReceived || 0
	                                };

	                                switch (stats.mediaType) {
	                                    case 'video':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with current delay [%s] ms and target delay [%s] ms',
	                                            name, stats.mediaType, stats.ssrc, stats.googCurrentDelayMs, stats.googTargetDelayMs);
	                                        hasFrameRate = true;
	                                        frameRate = stats.googFrameRateReceived || 0;
	                                        hasVideoBitRate = true;
	                                        videoBitRate = calculateBitRate(currentBytes, lastVideoBytes);
	                                        lastVideoBytes = currentBytes;
	                                        break;
	                                    case 'audio':
	                                        that._logger.debug('[%s] Inbound [%s] [%s] with output level [%s] and jitter [%s] and jitter buffer [%s] ms',
	                                            name, stats.mediaType, stats.ssrc, stats.audioOutputLevel, stats.googJitterReceived, stats.googJitterBufferMs);
	                                        hasAudioBitRate = true;
	                                        audioBitRate = calculateBitRate(currentBytes, lastAudioBytes);
	                                        lastAudioBytes = currentBytes;
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

	                if (hasVideoBitRate && videoBitRate === 0 || hasAudioBitRate && audioBitRate === 0 || hasFrameRate && frameRate === 0) {
	                    var medias = getMedias.call(that, peerConnection);

	                    hasVideoBitRate = hasVideoBitRate && medias.video && medias.video.enabled !== false;
	                    hasAudioBitRate = hasAudioBitRate && medias.audio && medias.audio.enabled !== false;
	                    hasFrameRate = hasFrameRate && medias.video && medias.video.enabled !== false;

	                    readable = readable || !(medias.video && medias.video.enabled !== false || medias.audio && medias.audio.enabled !== false);
	                    writable = writable || !(medias.video && medias.video.enabled !== false || medias.audio && medias.audio.enabled !== false);
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
	                    var medias = getMedias.call(that, peerConnection);
	                    var active = 0;
	                    var inactive = 0;

	                    for (var id in medias) {
	                        var media = medias[id];

	                        if (media && media.enabled !== false) {
	                            active++;
	                        } else {
	                            inactive++;
	                        }
	                    }

	                    if (active === 0 && inactive > 0) {
	                        that._logger.info('[%s] Finished monitoring of peer connection with [%s] inactive tracks', name, inactive);
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

	    function getMedias(peerConnection) {
	        var medias = {};
	        var localSections = peerConnection.localDescription.sdp.split('m=');
	        var remoteSections = peerConnection.remoteDescription.sdp.split('m=');

	        if (localSections.length !== remoteSections.length) {
	            return {};
	        }

	        for (var i = 1; i < localSections.length; i++) {
	            var section = localSections[i];

	            if (section.startsWith('audio')) {
	                medias.audio = {
	                    enabled: section.indexOf('a=inactive') === -1 && remoteSections[i].indexOf('a=inactive') === -1
	                }
	            } else if (section.startsWith('video')) {
	                medias.video = {
	                    enabled: section.indexOf('a=inactive') === -1 && remoteSections[i].indexOf('a=inactive') === -1
	                }
	            }
	        }

	        return medias;
	    }

	    function calculateBitRate(currentBytes, lastBytes) {
	        return (8 * (currentBytes.value - lastBytes.value))
	            / ((currentBytes.time - lastBytes.time) / 1000.0);
	    }

	    return PeerConnectionMonitor;
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }
/******/ ])
});
;