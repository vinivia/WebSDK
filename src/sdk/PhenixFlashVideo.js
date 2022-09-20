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

define([
    'phenix-web-lodash-light',
    'phenix-web-disposable',
    './PhenixFlashPlayer',
    'phenix-web-detect-browser'
], function(_, disposable, FlashPlayer, DetectBrowser) {
    'use strict';

    // ----------------------------------------
    // rtc/global.js

    var envGlobal = window; // eslint-disable-line no-restricted-globals

    // ----------------------------------------
    // rtc/PhenixFlashVideo`.js

    var log = function() {
        console.log.apply(console, arguments);
    } || function() {
    };

    var logError = function() {
        console.error.apply(console, arguments);
    } || log;

    function PhenxFlashVideo(ghost, stream, options) {
        var that = this;

        this._ghost = ghost;
        this._stream = stream;
        this._options = options || {};
        this._events = {};
        this._disposables = new disposable.DisposableList();
        this._flashPlayer = null;

        var loaded = function loaded(success) {
            that._loaded = true;
            that._enabled = success === true;

            if (success) {
                initialize.call(that);
            } else {
                logError('Failed to create Phenix video element');
            }

            if (that._onReady) {
                that._onReady(that._enabled);
            }
        };

        try {
            this._video = createPhenxFlashVideoElement.call(this);
            this._video.className = this._ghost.className;
            this._video.height = this._ghost.height;
            this._video.width = this._ghost.width;

            this._ghostInitStyleCssText = this._ghost.style.cssText;
            this._ghost.style.cssText = 'visibility:hidden !important;width:0px !important;height:0px !important;' +
                'margin:0px !important;padding:0px !important;' +
                'border-style:none !important;border-width:0px !important;' +
                'max-width:0px !important;max-height:0px !important;outline:none !important';

            this._disposables.add(new disposable.Disposable(function() {
                that._ghost.style.cssText = that._ghostInitStyleCssText;
            }));

            this._video.onunload = function() {
                that._loaded = false;
            };

            observeInsertion.call(this);

            if (!document.body || !document.body.contains) {
                log('document.body.contains is not supported');
            }

            if (document.body && document.body.contains && document.body.contains(this._ghost)) {
                this._ghost.parentNode.replaceChild(this._video, this._ghost);

                if (this._flashPlayer) {
                    this._video = this._flashPlayer.finishInitializationInDom();
                }

                this._disposables.add(new disposable.Disposable(function() {
                    if (that._video.parentNode) {
                        that._video.parentNode.replaceChild(that._ghost, that._video);
                    }
                }));
            }

            var waitFor = new WaitFor();

            waitFor.waitForReady(this._video, loaded);
        } catch (e) {
            logError('Error while loading Phenix RTC' + e);
            loaded(false);
        }
    }

    PhenxFlashVideo.prototype.hookUpEvents = function() {
        var that = this;
        var ghost = this._ghost;
        var onError = function onError() {
            dispatchEvent(ghost, 'error');
        };

        var onMute = function onMute() {
            ghost.muted = that._video.muted;
            dispatchEvent(ghost, 'mute');
        };

        var onUnmute = function onUnmute() {
            ghost.muted = that._video.muted;
            dispatchEvent(ghost, 'unmute');
        };

        var onEnded = function onEnded() {
            ghost.ended = that._video.ended;
            dispatchEvent(ghost, 'ended');
        };

        var onLoadedMetadata = function onLoadedMetadata() {
            ghost.width = that._video.width;
            ghost.height = that._video.height;
            dispatchEvent(ghost, 'loadedmetadata');
        };

        var onLoadedData = function onLoadedData() {
            ghost.width = that._video.width;
            ghost.height = that._video.height;
            dispatchEvent(ghost, 'loadeddata');
        };

        var onResize = function onResize() {
            ghost.width = that._video.width;
            ghost.height = that._video.height;
            dispatchEvent(ghost, 'resize');
        };

        this.addEventListener('error', onError);
        this.addEventListener('mute', onMute);
        this.addEventListener('unmute', onUnmute);
        this.addEventListener('ended', onEnded);
        this.addEventListener('loadedmetadata', onLoadedMetadata);
        this.addEventListener('loadeddata', onLoadedData);
        this.addEventListener('resize', onResize);

        var eventDisposable = new disposable.Disposable(function() {
            that.removeEventListener('error', onError);
            that.removeEventListener('mute', onMute);
            that.removeEventListener('unmute', onUnmute);
            that.removeEventListener('ended', onEnded);
            that.removeEventListener('loadedmetadata', onLoadedMetadata);
            that.removeEventListener('loadeddata', onLoadedData);
            that.removeEventListener('resize', onResize);
        });

        this._disposables.add(eventDisposable);

        return eventDisposable;
    };

    PhenxFlashVideo.prototype.onReady = function(callback) {
        var that = this;

        if (this._loaded) {
            setTimeout(function() {
                callback(that._enabled);
            }, 1);
        } else {
            this._onReady = callback;
        }
    };

    PhenxFlashVideo.prototype.getElement = function() {
        return this._video;
    };

    PhenxFlashVideo.prototype.addEventListener = function(name, listener, useCapture) {
        addEventListener.call(this, name, listener, useCapture);
    };

    PhenxFlashVideo.prototype.removeEventListener = function(name, listener, useCapture) {
        removeEventListener.call(this, name, listener, useCapture);
    };

    PhenxFlashVideo.prototype.destroy = function() {
        this._disposables.dispose();
    };

    function createPhenxFlashVideoElement() {
        this._flashPlayer = new FlashPlayer(this._ghost, this._stream, this._options);

        var that = this;

        this._disposables.add(new disposable.Disposable(function() {
            that._flashPlayer.destroy();
        }));

        return this._flashPlayer.getElement();
    }

    function addEventListener(name, listener /* , useCapture */) {
        return this._flashPlayer.addEventListener(name, listener);
    }

    function removeEventListener(name, listener /* , useCapture */) {
        return this._flashPlayer.removeEventListener(name, listener);
    }

    function registerEvent(name) {
        var that = this;

        function listener() {
            var listeners = that._events[name];

            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    listeners[i].apply(that, arguments);
                }
            }
        }

        that._video.phenixSetEventListener(name, listener);
    }

    function dispatchEvent(source, name) {
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent('HTMLEvents');
            event.initEvent(name, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = name;
        }

        event.eventName = name;

        setTimeout(function() {
            if (document.createEvent) {
                source.dispatchEvent(event);
            } else {
                source.fireEvent('on' + event.eventType, event);
            }
        });
    }

    function initialize() {
        var events = Object.keys(this._events);

        for (var i = 0; i < events.length; i++) {
            registerEvent.call(this, events[i]);
        }

        this.hookUpEvents();

        propagateAttributeChanges.call(this);

        this._video.id = this._ghost.id;
        this._video.style.cssText = this._ghostInitStyleCssText;
        this._video.className = this._ghost.className;
        this._video.innerHtml = this._ghost.innerHtml;
        this._video.width = this._ghost.width;
        this._video.height = this._ghost.height;
        this._video.autoplay = this._ghost.autoplay;
        this._video.muted = this._ghost.muted;
        this._video.defaultMuted = this._ghost.defaultMuted;
        this._video.volume = this._ghost.volume;
    }

    function propagateAttributeChanges() {
        var that = this;
        var readonly = ['style'];

        if (_.get(envGlobal, ['MutationObserver'])) {
            // Newer browsers support an efficient way to observe DOM modifications
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'attributes' && mutation.target === that._ghost && readonly.indexOf(mutation.attributeName) === -1) {
                        that._video[mutation.attributeName] = that._ghost[mutation.attributeName];
                    }
                });
            });

            var configAttributes = {attributes: true};

            observer.observe(that._ghost, configAttributes);

            that._disposables.add(new disposable.Disposable(function() {
                observer.disconnect();
            }));
        } else {
            // For older browsers. There is a significant performance overhead with this method.
            // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
            log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

            var handleModifiedEvent = function handleModifiedEvent(event) {
                that._video[event.target.tagName] = that._ghost[event.target.tagName];
            };

            if (that._ghost.addEventListener) {
                that._ghost.addEventListener('DOMAttrModified', handleModifiedEvent, false);

                that._disposables.add(new disposable.Disposable(function() {
                    that._ghost.removeEventListener('DOMAttrModified', handleModifiedEvent, false);
                }));
            } else {
                that._ghost.attachEvent('onpropertychange', handleModifiedEvent);

                that._disposables.add(new disposable.Disposable(function() {
                    that._ghost.detachEvent('DOMAttrModified', handleModifiedEvent);
                }));
            }
        }
    }

    function observeInsertion() {
        var that = this;

        if (_.get(envGlobal, ['MutationObserver'])) {
            // Newer browsers support an efficient way to observe DOM modifications
            var observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        for (var i = 0; i < mutation.addedNodes.length; i++) {
                            var node = mutation.addedNodes[i];

                            if (mutation.target !== that._video) {
                                if (node === that._ghost) {
                                    // Replace element with our video element
                                    mutation.target.replaceChild(that._video, that._ghost);
                                    initialize.call(that);
                                } else if (isDescendant(mutation.target, that._ghost)) {
                                    if (that._ghost.parentNode) {
                                        that._ghost.parentNode.replaceChild(that._video, that._ghost);
                                    }

                                    initialize.call(that);
                                }
                            }
                        }
                    }
                });
            });

            var configMutations = {
                childList: true,
                attributes: false,
                characterData: false,
                subtree: true
            };

            observer.observe(document.body, configMutations);

            that._disposables.add(new disposable.Disposable(function() {
                observer.disconnect();
            }));
        } else {
            // For older browsers. There is a significant performance overhead with this method.
            // See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events
            log('Falling back to use of DOM event listeners. This results in degraded performance for further DOM modifications and does not work for IE prior to version 9. See https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Mutation_events for details.');

            var domInsertedListener = function() {
                if (that._ghost.parentNode) {
                    that._ghost.parentNode.replaceChild(that._video, that._ghost);
                }
            };

            that.addEventListener('DOMNodeInserted', domInsertedListener, false);

            that._disposables.add(new disposable.Disposable(function() {
                that.removeEventListener('DOMNodeInserted', domInsertedListener, false);
            }));
        }
    }

    function isDescendant(parent, child) {
        var node = child.parentNode;

        while (node !== null) {
            if (node === parent) {
                return true;
            }

            node = node.parentNode;
        }

        return false;
    }

    // ----------------------------------------
    // rtc/waitFor.js

    var browser = new DetectBrowser(navigator.userAgent).detect();
    var ReadyStateComplete = 4;

    function WaitFor(timeout) {
        this._timeout = timeout || 15000;
    }

    WaitFor.prototype.waitForReadyWithTimeout = function(element, loaded, timeout) {
        var triggered = false;
        var waitFor = 1;
        var sum = waitFor;

        var guardedLoaded = function(success) {
            if (!triggered) {
                triggered = true;
                loaded(success);
            }
        };

        var checkLoaded = function checkLoaded() {
            if (element.readyState === ReadyStateComplete) { // IE
                return guardedLoaded(true);
            }

            waitFor = Math.min(waitFor + 1000, 2 * waitFor);
            sum += waitFor;

            if (sum > timeout) {
                logError('Timed out while waiting for <object> to load');
                guardedLoaded(false);
            } else {
                setTimeout(checkLoaded, waitFor);
            }
        };

        if (!(Object.prototype.hasOwnProperty && Object.prototype.hasOwnProperty.call(element, 'onload'))) {
            // There are no events in IE to detect when it is loaded
            if (browser.browser !== 'IE') {
                logError('No means of detecting when <object> is loaded');
            }
        }

        element.onload = function() {
            guardedLoaded(true);
        };

        checkLoaded();
    };

    WaitFor.prototype.waitForReady = function(element, loaded) {
        this.waitForReadyWithTimeout(element, loaded, this._timeout);
    };

    // ----------------------------------------

    return PhenxFlashVideo;
});