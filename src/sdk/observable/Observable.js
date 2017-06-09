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
    '../LodashLight',
    '../assert'
], function (_, assert) {
    'use strict';

    function Observable(initialValue, beforeChange) {
        this.latestValue = null;
        this.subscribeCallbacks = {};
        this.subscriptionTimeout = 100;
        this.subscriptionCount = 0;
        this.resetOnChange = false;
        this.lastChangeTime = 0;
        this.isPendingChanges = false;
        this.beforeChange = beforeChange;

        setLatestValue.call(this, initialValue);
    }

    Observable.prototype.getValue = function getValue() {
        return clone(this.latestValue);
    };

    Observable.prototype.setValue = function setValue(value) {
        if (value !== this.latestValue) {
            setLatestValue.call(this, value);
            onSubscribeCallback.call(this, this.subscriptionTimeout);
        }
    };

    Observable.prototype.subscribe = function subscribe(callback, options) {
        assert.isFunction(callback);

        if (options) {
            assert.isObject(options);
        }

        var that = this;
        var key = _.uniqueId();
        var listenForChanges;

        that.subscribeCallbacks[key] = callback;
        that.subscriptionCount += 1;

        if (options) {
            if (options.initial === 'notify') {
                onSubscribeCallback.call(that, that.subscriptionTimeout, true);
            }
            if (options.listenForChanges) {
                listenForChanges = setInterval(function() {
                    var valueAtInterval = options.listenForChanges.callback();

                    if (valueAtInterval !== that.latestValue) {
                        that.setValue(valueAtInterval);
                    }
                }, options.listenForChanges.timeout)
            }
        }

        function dispose() {
            delete that.subscribeCallbacks[key];

            if (listenForChanges) {
                clearInterval(listenForChanges);

                listenForChanges = null;
            }

            that.subscriptionCount -= 1;
        }

        return { dispose: dispose };
    };

    Observable.prototype.extend = function extend(options) {
        assert.isObject(options);

        switch (options.method) {
            case 'notifyWhenChangesStop':
                this.subscriptionTimeout = options.timeout;
                this.resetOnChange = true;
                break;
            case 'notifyAtFixedRate':
                this.subscriptionTimeout = options.timeout;
                break;
            default:
                break;
        }
        if (_.isNumber(options.rateLimit)) {
            this.subscriptionTimeout = options.rateLimit;
        }

        return this;
    };

    function clone(value) {
        if (typeof value === 'undefined' || value === null) {
            return value;
        }

        // necessary for observable array. Subsequent comparison must not be equal in order to trigger updates.
        if (_.isArray(value)) {
            return value.slice();
        } else {
            return value;
        }
    }

    function setLatestValue(value) {
        var valueToSet = value;

        if (this.beforeChange) {
            valueToSet = this.beforeChange(value);
        }

        this.latestValue = clone(valueToSet);
    }

    function onSubscribeCallback(timeoutLength, noTimeout) {
        this.lastChangeTime = _.now();

        if (!this.isPendingChanges && this.subscriptionCount !== 0) {
            this.isPendingChanges = true;

            if (noTimeout) {
                return notifySubscribers.call(this);
            }

            continueAfterTimeout.call(this, timeoutLength)
        }
    }

    function continueAfterTimeout(timeoutLength) {
        var that = this;

        setTimeout(function() {
            var timeElapsedSinceLastChange = _.now() - that.lastChangeTime;

            if (that.resetOnChange && timeElapsedSinceLastChange < that.subscriptionTimeout) {
                continueAfterTimeout.call(that, that.subscriptionTimeout - timeElapsedSinceLastChange);
            } else {
                notifySubscribers.call(that);
            }
        }, timeoutLength);
    }

    function notifySubscribers() {
        try {
            executeSubscriptionCallbacks.call(this);
        } finally {
            this.isPendingChanges = false;
        }
    }

    function executeSubscriptionCallbacks() {
        var that = this;

        _.forOwn(that.subscribeCallbacks, function (callback) {
            if (_.isFunction(callback)) {
                callback(that.latestValue);
            }
        });
    }

    return Observable;

});
