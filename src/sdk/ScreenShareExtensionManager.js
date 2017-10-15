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
/* global chrome */
define([
    'phenix-web-lodash-light',
    'phenix-web-assert',
    'phenix-web-observable',
    'phenix-rtc'
], function (_, assert, observable, phenixRTC) {
    'use strict';

    var defaultChromePCastScreenSharingExtensionId = 'icngjadgidcmifnehjcielbmiapkhjpn';
    var defaultFirefoxPCastScreenSharingAddOn = _.freeze({
        url: 'https://addons.mozilla.org/firefox/downloads/file/474686/pcast_screen_sharing-1.0.3-an+fx.xpi',
        iconUrl: 'https://phenixp2p.com/public/images/phenix-logo-unicolor-64x64.png',
        hash: 'sha256:4972e9718ea7f7c896abc12d1a9e664d5f3efe498539b082ab7694f9d7af4f3b'
    });
    var firefoxInstallationCheckInterval = 100;
    var firefoxMaxInstallationChecks = 450;
    var minimumSupportFirefoxVersionForUnWhiteListedScreenShare = 52;

    function ScreenShareExtensionManager(options, logger) {
        options = options || {};

        assert.isObject(options, 'options');
        assert.isObject(logger, 'logger');

        this._logger = logger;
        this._screenSharingExtensionId = options.screenSharingExtensionId || getDefaultExtensionId();
        this._screenSharingAddOn = options.screenSharingAddOn || defaultFirefoxPCastScreenSharingAddOn;
        this._screenSharingEnabled = false;
        this._isInitializedObservable = new observable.Observable(false);

        if (phenixRTC.browser === 'Chrome' && this._screenSharingExtensionId) {
            addLinkHeaderElement.call(this);
        }

        checkForScreenSharingCapability.call(this, _.bind(handleCheckForScreenSharing, this));
    }

    ScreenShareExtensionManager.prototype.isScreenSharingEnabled = function (callback) {
        var that = this;

        return waitForInitialized.call(this, function() {
            return callback(that._screenSharingEnabled);
        });
    };

    ScreenShareExtensionManager.prototype.installExtension = function (callback) {
        return waitForInitialized.call(this, _.bind(installScreenShareExtension, this, callback));
    };

    ScreenShareExtensionManager.prototype.getScreenSharingConstraints = function (options, callback) {
        return waitForInitialized.call(this, _.bind(getScreenSharingConstraints, this, options, callback));
    };

    ScreenShareExtensionManager.prototype.toString = function () {
        return 'ScreenShareExtensionManager[' + phenixRTC.browser + ']';
    };

    function handleCheckForScreenSharing(isEnabled) {
        this._isInitializedObservable.setValue(true);

        this._screenSharingEnabled = isEnabled;
    }

    function checkForScreenSharingCapability(callback) {
        var that = this;

        if (phenixRTC.browser === 'Chrome' && that._screenSharingExtensionId) {
            var runtimeEnvironment = getRuntime.call(this);

            if (!runtimeEnvironment) {
                return callback(false);
            }

            try {
                runtimeEnvironment.sendMessage(that._screenSharingExtensionId, {type: 'version'}, function (response) {
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
        } else if (phenixRTC.browser === 'Firefox' && phenixRTC.browserVersion >= minimumSupportFirefoxVersionForUnWhiteListedScreenShare) {
            callback(true);
        } else if (phenixRTC.browser === 'Firefox' && typeof window.PCastScreenSharing === 'object') {
            callback(true);
        } else {
            callback(false);
        }
    }

    function waitForInitialized(callback) {
        if (this._isInitializedObservable.getValue()) {
            return callback();
        }

        var initializedSubscription = this._isInitializedObservable.subscribe(function() {
            initializedSubscription.dispose();

            return callback();
        });
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

    function getScreenSharingConstraints(options, callback) {
        switch (phenixRTC.browser) {
        case 'Chrome':
            return requestMediaSourceIdWithRuntime.call(this, function(error, response) {
                if (error || (response && response.status !== 'ok')) {
                    return callback(error, response);
                }

                callback(null, {
                    status: 'ok',
                    constraints: mapChromeConstraints(options, response.streamId)
                });
            });
        case 'Firefox':
            callback(null, {
                status: 'ok',
                constraints: mapFirefoxConstraints(options)
            });

            break;
        default:
            callback(new Error('not-supported'), {status: 'not-supported'});

            break;
        }
    }

    function requestMediaSourceIdWithRuntime(callback) {
        var that = this;
        var runtimeEnvironment = getRuntime.call(this);

        if (!runtimeEnvironment) {
            return callback(new Error('not-available'));
        }

        try {
            runtimeEnvironment.sendMessage(that._screenSharingExtensionId, {type: 'get-desktop-media'}, function (response) {
                if (response.status !== 'ok') {
                    return callback(new Error(response.status), response);
                }

                callback(null, response);
            });
        } catch (e) {
            if (e.message) {
                that._logger.warn(e.message);
            }

            callback(e, {status: 'failed'});
        }
    }

    function mapChromeConstraints(options, id) {
        var constraints = {video: {}};

        if (typeof options === 'object' && typeof options.screen === 'object') {
            constraints.video = options.screen;
        }

        if (typeof constraints.video.mandatory !== 'object') {
            constraints.video.mandatory = {};
        }

        constraints.video.mandatory.chromeMediaSource = 'desktop';
        constraints.video.mandatory.chromeMediaSourceId = id;

        return constraints;
    }

    function mapFirefoxConstraints(options, id) {
        var constraints = {video: {}};

        if (typeof options === 'object' && typeof options.screen === 'object') {
            constraints.video = options.screen;
        }

        if (id) {
            constraints.video.mediaSourceId = id;
        }

        constraints.video.mediaSource = 'window';

        return constraints;
    }

    function installScreenShareExtension(callback) {
        var that = this;

        if (that._screenSharingEnabled) {
            return;
        }

        var installCallback = function installCallback(error, status) {
            if (status === 'cancelled') {
                return callback(null, 'cancelled');
            }

            if (status !== 'ok') {
                return callback(new Error('screen-sharing-installation-failed'), status);
            }

            checkForScreenSharingCapability.call(that, function (screenSharingEnabled) {
                that._screenSharingEnabled = screenSharingEnabled;

                if (!that._screenSharingEnabled) {
                    return callback(new Error('screen-sharing-installation-failed'), status);
                }

                callback(null, 'ok');
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
            callback(new Error('not-supported'), 'not-supported');

            break;
        }
    }

    function tryInstallChromeScreenSharingExtension(callback) {
        var that = this;
        var chromeWebStoreUrl = getChromeWebStoreLink.call(this);

        try {
            chrome.webstore.install(chromeWebStoreUrl, function successCallback() {
                return callback(null, 'ok');
            }, function failureCallback(reason) {
                if (reason) {
                    if (reason.match(/cancelled/ig)) {
                        that._logger.info('User cancelled screen sharing');

                        return callback(new Error(reason), 'cancelled');
                    }

                    that._logger.warn(reason);
                }

                return callback(new Error(reason || 'failed'), 'failed');
            });
        } catch (e) {
            if (e.message) {
                that._logger.warn(e.message);
            }

            callback(e, 'failed');
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

                callback(null, 'ok');
            };

            var failure = function failure() {
                if (intervalId) {
                    clearInterval(intervalId);
                }

                callback(new Error('failed'), 'failed');
            };

            intervalId = setInterval(function () {
                if (typeof window.PCastScreenSharing === 'object') {
                    return success();
                }

                if (attemptsLeft-- < 0) {
                    return failure();
                }
            }, firefoxInstallationCheckInterval);

            InstallTrigger.install(params, function xpiInstallCallback(url, status) { // eslint-disable-line no-undef
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

    function getRuntime() {
        var that = this;

        switch (phenixRTC.browser) {
        case 'Chrome':
            if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
                that._logger.info('Screen sharing NOT available');

                return null;
            }

            return chrome.runtime;
        case 'Firefox':
        default:
            return null;
        }
    }

    function getDefaultExtensionId() {
        switch (phenixRTC.browser) {
        case 'Chrome':
            return defaultChromePCastScreenSharingExtensionId;
        case 'Firefox':
        default:
            return '';
        }
    }

    return ScreenShareExtensionManager;
});