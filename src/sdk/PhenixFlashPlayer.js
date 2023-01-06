/**
 * Copyright 2023 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
    'phenix-web-detect-browser',
    'phenix-web-disposable',
    'phenix-web-event'
], function(_, DetectBrowser, disposable, event) {
    'use strict';

    // ----------------------------------------
    // rtc/global.js

    var envGlobal = window; // eslint-disable-line no-restricted-globals

    // ----------------------------------------
    // rtc/FlashPlayer.js

    var log = function() {
        console.log.apply(console, arguments);
    } || function() {};

    var logError = function() {
        console.error.apply(console, arguments);
    } || log;

    var defaultPropertyValues = {
        width: 480,
        height: 360,
        videoWidth: 480,
        videoHeight: 360,
        muted: false,
        volume: 1,
        currentTime: 0,
        duration: Infinity,
        readyState: 0,
        ended: false,
        buffered: null,
        autoplay: true
    };

    var mutedElementListenerInterval = 300;
    var browser = new DetectBrowser(navigator.userAgent).detect();
    var isIEAndRequiresFlashObject = browser.browser === 'IE' && /(trident|microsoft)/i.test(_.get(envGlobal.navigator, ['appName'], ''));
    var isEdgeAndRequiresFlashObject = browser.browser === 'Edge' && _.get(envGlobal.navigator, 'msLaunchUri') && !_.get(envGlobal.document, 'documentMode');
    var missingFlashMessage = 'You are using a browser that does not have Flash player enabled or installed. Please turn on your Flash player plugin or download the latest version from https://get.adobe.com/flashplayer/';

    function FlashPlayer(ghost, streamInfo, options) {
        this._disposables = new disposable.DisposableList();
        this._events = new event.NamedEvents();
        this._isVideo = ghost.tagName === 'video';
        this._swfSrc = options.swfSrc;
        this._id = ghost.id || options.streamId;
        this._width = ghost.clientWidth;
        this._height = ghost.clientHeight;
        this._ghost = ghost;
        this._element = null;
        this._eventDisposables = [];
        this._flashVars = [
            'uid=' + this._id,
            'autoplay=' + (_.isUndefined(ghost.autoplay) ? true : ghost.autoplay),
            'muted=' + (_.isUndefined(ghost.muted) ? false : ghost.muted),
            'allowScriptAccess=always',
            'preload=true',
            'src=' + JSON.stringify(streamInfo)
        ];

        var that = this;

        this._disposables.add(new disposable.Disposable(function() {
            triggerFlashEvent.call(that, 'fire_stop');
        }));

        try {
            if (isIEAndRequiresFlashObject || isEdgeAndRequiresFlashObject) {
                this._element = createMicrosoftFlashElement.call(this);
            } else {
                this._element = setupCrossBrowserFlashElement.call(this);
            }

            setupElement.call(this);
        } catch (e) {
            logError('Error while loading Flash Player' + e);
        }
    }

    FlashPlayer.prototype.finishInitializationInDom = function() {
        return finishInitialization.call(this);
    };

    FlashPlayer.prototype.getElement = function() {
        return this._element;
    };

    FlashPlayer.prototype.addEventListener = function(name, listener) {
        var eventDisposableIndex = findEventListenerIndex.call(this, name, listener);

        if (eventDisposableIndex > -1) {
            return;
        }

        var disposable = this._events.listen(name, listener);

        this._disposables.add(disposable);

        this._eventDisposables.push({
            name: name,
            listener: listener,
            disposable: disposable
        });
    };

    FlashPlayer.prototype.removeEventListener = function(name, listener) {
        var eventDisposableIndex = findEventListenerIndex.call(this, name, listener);

        if (eventDisposableIndex > -1) {
            var eventDisposable = this._eventDisposables.splice(eventDisposableIndex, 1)[0];

            eventDisposable.disposable.dispose();
        }
    };

    FlashPlayer.prototype.destroy = function() {
        this._disposables.dispose();
    };

    function findEventListenerIndex(name, listener) {
        return _.findIndex(this._eventDisposables, function(eventDisposable) {
            return eventDisposable.name === name && eventDisposable.listener === listener;
        });
    }

    function createMicrosoftFlashElement() {
        return document.createElement('div');
    }

    function setupCrossBrowserFlashElement() {
        var element = document.createElement('embed');

        element.setAttribute('id', '__' + this._id);
        element.setAttribute('name', '__' + this._id);
        element.setAttribute('play', 'true');
        element.setAttribute('loop', 'false');
        element.setAttribute('quality', 'high');
        element.setAttribute('bgcolor', '#000000');
        element.setAttribute('wmode', 'transparent');
        element.setAttribute('allowScriptAccess', 'always');
        element.setAttribute('allowFullScreen', 'true');
        element.setAttribute('type', 'application/x-shockwave-flash');
        element.setAttribute('pluginspage', '//www.macromedia.com/go/getflashplayer');
        element.setAttribute('src', this._swfSrc);
        element.setAttribute('flashvars', this._flashVars.join('&'));

        if (this._isVideo) {
            element.setAttribute('width', this._width.toString());
            element.setAttribute('height', this._height.toString());
        }

        return element;
    }

    function finishInitialization() {
        if (!isIEAndRequiresFlashObject && !isEdgeAndRequiresFlashObject) {
            return this._element;
        }

        var id = (isEdgeAndRequiresFlashObject ? '__' + this._id : this._id) + _.uniqueId();
        var embedObject = document.createElement('object');
        var missingFlashMessageElement = document.createElement('div');
        var childrenElements = [
            createParameterElement('movie', this._swfSrc + '?x=' + _.now()),
            createParameterElement('flashvars', this._flashVars.join('&')),
            createParameterElement('quality', 2),
            createParameterElement('bgcolor', '#000000'),
            createParameterElement('wmode', 'transparent'),
            createParameterElement('allowScriptAccess', 'always'),
            createParameterElement('allowFullScreen', 'true'),
            missingFlashMessageElement
        ];

        missingFlashMessageElement.innerHTML = missingFlashMessage;

        if (isEdgeAndRequiresFlashObject) {
            embedObject.setAttribute('type', 'application/x-shockwave-flash');
            embedObject.setAttribute('data', this._swfSrc);
            embedObject.setAttribute('id', id);
            embedObject.setAttribute('width', '__' + this._width.toString());
            embedObject.setAttribute('height', '__' + this._height.toString());
        } else {
            embedObject.setAttribute('classid', 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000');
            embedObject.setAttribute('codebase', '//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab');
            embedObject.setAttribute('id', id);
            embedObject.setAttribute('width', this._width.toString());
            embedObject.setAttribute('height', this._height.toString());
        }

        if (embedObject.object) {
            _.forEach(childrenElements, function(element) {
                if (!_.isNullOrUndefined(_.get(embedObject.object, [element.name]))) {
                    embedObject.object[element.name] = element.value;
                }
            });

            embedObject.appendChild(missingFlashMessageElement);
        } else {
            _.forEach(childrenElements, function(element) {
                var existingChildElement = _.find(embedObject.children, function(childElement) {
                    return childElement.name === element.name;
                });

                if (existingChildElement) {
                    return embedObject.replaceChild(element, existingChildElement);
                }

                return embedObject.appendChild(element);
            });
        }

        this._element.outerHTML = embedObject.outerHTML;

        // Issue with IE. When you replace the outerHTML the reference to that element does not correctly reflect the changes.
        // If you want to get the new embed object in the dom you need to query for it.
        if (envGlobal.document.getElementById) {
            this._element = envGlobal.document.getElementById(id);

            setupElement.call(this);
        }

        return this._element;
    }

    function createParameterElement(name, value) {
        var parameter = document.createElement('param');

        parameter.setAttribute('name', name);
        parameter.setAttribute('value', value);

        return parameter;
    }

    function setupElement() {
        _.assign(this._element, defaultPropertyValues, {
            id: this._id,
            width: this._width,
            height: this._height,
            videoWidth: this._width,
            videoHeight: this._height
        });

        setupAccessors.call(this);
        propagateAttributeChanges.call(this);
        setupVolumeAndMutedListeners.call(this);
    }

    function setupAccessors() {
        var that = this;

        envGlobal['__event__' + this._id] = function(eventName, message) {
            var event = createEvent(eventName, that._element);

            if (message) {
                try {
                    event.data = JSON.parse(message);
                    event.details.data = event.data;
                } catch (e) {
                    event.message = message;
                }
            }

            switch (eventName) {
            case 'ended':
                break;
            case 'error':
                that._element.error = event.data;

                if (that._element.dispatchEvent) {
                    that._element.dispatchEvent(new Error(message));
                }

                break;
            case 'loadeddata':
            case 'loadedmetadata':
            case 'loadstart':
                if (that._element.dispatchEvent) {
                    that._element.dispatchEvent(event);
                }

                break;
            case 'pause':
                that._element.paused = true;

                break;
            case 'play':
                that._element.paused = false;

                break;
            case 'playing':
                that._element.paused = false;

                break;
            case 'progress':
            case 'seeked':
            case 'seeking':
            case 'stalled':
            case 'suspend':
                if (that._element.dispatchEvent) {
                    that._element.dispatchEvent(event);
                }

                break;
            case 'timeupdate':
                that._element.currentTime = getValueFromFlash.call(that, 'currentTime');

                if (that._element.dispatchEvent) {
                    that._element.dispatchEvent(event);
                }

                break;
            case 'volumechange':
                break;
            case 'waiting':
                break;
            default:
                break;
            }

            that._events.fireAsync(eventName, [event]);
        };

        var nativeFullScreen = this._element.requestFullscreen || this._element.mozRequestFullScreen || this._element.webkitRequestFullScreen || this._element.msRequestFullscreen;

        this._disposables.add(new disposable.Disposable(function() {
            delete envGlobal['__event__' + that._id];
        }));

        this._element.play = function() {
            triggerFlashEvent.call(that, 'fire_play');
        };
        this._element.load = function() {
            triggerFlashEvent.call(that, 'fire_load');
        };
        this._element.seek = function() {
            triggerFlashEvent.call(that, 'fire_seek');
        };
        this._element.pause = function() {
            triggerFlashEvent.call(that, 'fire_pause');
        };
        this._element.requestFullscreen = function() {
            that._isFullscreen = true;
            addListenerForExitFullScreen.call(that);

            that._previousHeight = that._element.style.height;
            that._previousWidth = that._element.style.width;
            that._previousPosition = that._element.style.position;
            that._element.style.position = 'absolute';
            that._element.style.height = '100%';
            that._element.style.width = '100%';

            if (typeof envGlobal.ActiveXObject !== "undefined") { // Older IE.
                var wscript = new envGlobal("WScript.Shell");

                if (wscript !== null) {
                    wscript.SendKeys("{F11}");
                }
            }

            nativeFullScreen.call(that._element);
        };

        var triggerFlashSetSize = function() {
            triggerFlashEvent.call(that, 'set_size', that._isFullscreen ? screen.width : that._element.clientWidth, that._isFullscreen ? screen.height : that._element.clientHeight);
        };

        _.addEventListener(envGlobal, 'resize', triggerFlashSetSize);

        this._disposables.add(new disposable.Disposable(function() {
            _.removeEventListener(envGlobal, 'resize', triggerFlashSetSize);
        }));
    }

    // Muted is not an attribute and will not be triggered by MutationObserver changes
    function setupVolumeAndMutedListeners() {
        var mutedListener = getMutedListener.call(this);
        var volumeListener = getVolumeListener.call(this);

        var intervalId = setInterval(function() {
            mutedListener();
            volumeListener();
        }, mutedElementListenerInterval);

        this._disposables.add(new disposable.Disposable(function() {
            clearInterval(intervalId);
        }));
    }

    function getMutedListener() {
        var that = this;
        var ghostLastMutedState = that._ghost.muted;
        var elementLastMutedState = that._element.muted;

        return function() {
            var newGhostMutedState = that._element.muted;
            var newElementMutedState = that._element.muted;

            if (newGhostMutedState === ghostLastMutedState && newElementMutedState === elementLastMutedState) {
                return;
            }

            if (newGhostMutedState !== ghostLastMutedState) {
                ghostLastMutedState = newGhostMutedState;
                elementLastMutedState = newGhostMutedState;
                newElementMutedState = newGhostMutedState;
            }

            if (newElementMutedState !== elementLastMutedState) {
                ghostLastMutedState = newGhostMutedState;
                elementLastMutedState = newGhostMutedState;
            }

            that._element.muted = newElementMutedState;
            that._ghost.muted = newElementMutedState;

            setFlashValue.call(that, 'muted', newElementMutedState);
        };
    }

    function getVolumeListener() {
        var that = this;
        var ghostLastVolume = that._ghost.volume;
        var elementLastVolume = that._element.volume;

        return function() {
            var newGhostVolume = that._element.volume;
            var newElementVolume = that._element.volume;

            if (newGhostVolume === ghostLastVolume && newElementVolume === elementLastVolume) {
                return;
            }

            if (newGhostVolume !== ghostLastVolume) {
                ghostLastVolume = newGhostVolume;
                elementLastVolume = newGhostVolume;
                newElementVolume = newGhostVolume;
            }

            if (newElementVolume !== elementLastVolume) {
                ghostLastVolume = newGhostVolume;
                elementLastVolume = newGhostVolume;
            }

            that._element.volume = newElementVolume;
            that._ghost.volume = newElementVolume;

            setFlashValue.call(that, 'volume', newElementVolume);
        };
    }

    function setFlashValue(name, value) {
        var setter = this._element['set_' + name] || _.noop;

        return setter.call(this._element, value);
    }

    function getValueFromFlash(name) {
        var getter = this._element['get_' + name] || _.noop;

        return getter.call(this._element);
    }

    function triggerFlashEvent(eventName) {
        var triggerEvent = this._element[eventName];

        [].shift.apply(arguments);

        if (triggerEvent) {
            return triggerEvent.apply(this._element, arguments);
        }
    }

    function createEvent(eventName, target) {
        var eventFrags = eventName.match(/([a-z]+\.([a-z]+))/i);
        var detail = {target: target};

        if (eventFrags !== null) {
            eventName = eventFrags[1];
            detail.namespace = eventFrags[2];
        }

        if (browser.browser === 'IE' && browser.version > 8) {
            var evt = envGlobal.document.createEvent("CustomEvent");

            evt.initCustomEvent(eventName, false, false, detail);

            return evt;
        }

        if (!envGlobal.CustomEvent) {
            return detail;
        }

        return new envGlobal.CustomEvent(eventName, {detail: detail});
    }

    function propagateAttributeChanges() {
        var that = this;
        var ignored = ['currentTime', 'paused', 'error', 'src'];

        if (_.get(envGlobal, ['MutationObserver'])) {
            // Newer browsers support an efficient way to observe DOM modifications
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.target === that._element && !_.includes(ignored, mutation.attributeName)) {
                        setFlashValue.call(that, mutation.attributeName, that._element[mutation.attributeName]);
                    }
                });
            });

            var configAttributes = {attributes: true};

            observer.observe(that._element, configAttributes);

            that._disposables.add(new disposable.Disposable(function() {
                observer.disconnect();
            }));
        } else {
            // For older browsers. There is a significant performance overhead with this method.
            // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
            log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

            var handleModifiedEvent = function handleModifiedEvent(event) {
                if (!_.includes(ignored, event.target.tagName)) {
                    setFlashValue.call(that, event.target.tagName, that._element[event.target.tagName]);
                }
            };

            if (that._element.addEventListener) {
                that._element.addEventListener('DOMAttrModified', handleModifiedEvent, false);

                that._disposables.add(new disposable.Disposable(function() {
                    that._element.removeEventListener('DOMAttrModified', handleModifiedEvent, false);
                }));
            } else {
                that._element.attachEvent('onpropertychange', handleModifiedEvent);

                that._disposables.add(new disposable.Disposable(function() {
                    that._element.detachEvent('DOMAttrModified', handleModifiedEvent);
                }));
            }
        }
    }

    function addListenerForExitFullScreen() {
        var that = this;

        function exitHandler() {
            if(!document.webkitIsFullScreen && !document.mozFullScreen && !document.msFullscreenElement && !document.fullscreenElement) {
                document.removeEventListener('webkitfullscreenchange', exitHandler);
                document.removeEventListener('mozfullscreenchange', exitHandler);
                document.removeEventListener('fullscreenchange', exitHandler);
                document.removeEventListener('MSFullscreenChange', exitHandler);
                document.removeEventListener('keydown', checkForExit);

                that._isFullscreen = false;
                that._element.style.position = that._previousPosition;
                that._element.style.height = that._previousHeight;
                that._element.style.width = that._previousWidth;
            }
        }

        function checkForExit(event) {
            var keyEvent = event || envGlobal.event;
            var isEscape = false;

            if ("key" in keyEvent) {
                isEscape = (keyEvent.key === "Escape" || keyEvent.key === "Esc");
            } else {
                isEscape = (keyEvent.keyCode === 27);
            }

            if (isEscape) {
                exitHandler();
            }
        }

        document.addEventListener('webkitfullscreenchange', exitHandler, false);
        document.addEventListener('mozfullscreenchange', exitHandler, false);
        document.addEventListener('fullscreenchange', exitHandler, false);
        document.addEventListener('MSFullscreenChange', exitHandler, false);
        document.addEventListener('keydown', checkForExit, false);
    }

    // ----------------------------------------

    return FlashPlayer;
});