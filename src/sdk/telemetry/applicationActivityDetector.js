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
    'phenix-web-lodash-light',
    'phenix-web-assert',
    'phenix-web-event',
    'phenix-web-disposable'
], function (_, assert, event, disposable) {
    var defaultDocumentFocusIntervalTimeout = 3000;

    function ApplicationActivityDetector() {
        this._namedEvents = new event.NamedEvents();
        this._timeOfLastTabFocusChange = _.now();
        this._disposables = new disposable.DisposableList();
        this._isForeground = true;

        this._disposables.add(this._namedEvents);

        detectTabFocusChange.call(this);
    }

    ApplicationActivityDetector.prototype.isForeground = function() {
        return this._isForeground;
    };

    ApplicationActivityDetector.prototype.getTimeSinceLastChange = function() {
        return _.now() - this._timeOfLastTabFocusChange;
    };

    ApplicationActivityDetector.prototype.onForeground = function isEnabled(callback) {
        assert.isFunction(callback, 'callback');

        return this._namedEvents.listen('foreground', callback);
    };

    ApplicationActivityDetector.prototype.onBackground = function setEnabled(callback) {
        assert.isFunction(callback, 'callback');

        return this._namedEvents.listen('background', callback);
    };

    function detectTabFocusChange() {
        if (canDetectDirectly()) {
            return detectTabFocusChangeDirectly.call(this);
        }

        detectTabFocusChangeIndirectly.call(this);
    }

    function canDetectDirectly() {
        return typeof chrome !== 'undefined' && chrome.extension && chrome.extension.onRequest; // eslint-disable-line no-undef
    }

    function detectTabFocusChangeDirectly() {
        if (!canDetectDirectly()) {
            return;
        }

        var that = this;

        chrome.extension.onRequest.addListener(function(request, sender, sendResponse) { // eslint-disable-line no-undef
            if(request === "is_selected") {
                chrome.tabs.getSelected(null, function(tab){ // eslint-disable-line no-undef
                    var isForeground = tab.id === sender.tab.id;

                    setFocusState.call(that, isForeground);

                    if(isForeground) {
                        sendResponse(true);
                    } else {
                        sendResponse(false);
                    }
                });
            }
        });
    }

    function detectTabFocusChangeIndirectly() {
        var hidden;
        var visibilityChange;
        var that = this;

        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
            hidden = "hidden";
            visibilityChange = "visibilitychange";
        } else if (typeof document.msHidden !== "undefined") {
            hidden = "msHidden";
            visibilityChange = "msvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") {
            hidden = "webkitHidden";
            visibilityChange = "webkitvisibilitychange";
        }

        function handleVisibilityChange() {
            var isForeground = !document[hidden];

            setFocusState.call(that, isForeground);
        }

        if (typeof document.addEventListener !== "undefined" && typeof document[hidden] !== "undefined") {
            _.addEventListener(document, visibilityChange, handleVisibilityChange, false);

            that._disposables.add(new disposable.Disposable(function() {
                _.removeEventListener(document, visibilityChange, handleVisibilityChange, false);
            }));
        } else {
            listenForDocumentFocus.call(that);
        }
    }

    function listenForDocumentFocus() {
        var that = this;

        that._documentFocusInterval = setInterval(function() {
            var isForeground = document.hasFocus();

            setFocusState.call(that, isForeground);
        }, defaultDocumentFocusIntervalTimeout);

        that._disposables.add(new disposable.Disposable(function() {
            if (_.isNumber(that._documentFocusInterval)) {
                clearInterval(that._documentFocusInterval);
            }

            that._documentFocusInterval = null;
        }));
    }

    function setFocusState(isForeground) {
        assert.isBoolean(isForeground, 'isForeground');

        if (this._isForeground === isForeground) {
            return;
        }

        if (isForeground) {
            this._isForeground = true;

            return triggerFocusChange.call(this, 'foreground');
        }

        this._isForeground = false;

        return triggerFocusChange.call(this, 'background');
    }

    function triggerFocusChange(state) {
        var currentTime = _.now();
        var timeElapsedOfLastState = currentTime - this._timeOfLastTabFocusChange;

        this._timeOfLastTabFocusChange = currentTime;
        this._namedEvents.fire(state, [timeElapsedOfLastState]);
    }

    return new ApplicationActivityDetector();
});