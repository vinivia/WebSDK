/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
    'phenix-web-assert'
], function(_, assert) {
    'use strict';

    // ToDo: Add supported frame rates [30, 15]
    var aspectRatios = [
        {
            '16x9': [
                {2160: 3840}, // 4k (UHD)
                {1080: 1920}, // 1080p (FHD)
                {768: 1366}, //
                {720: 1280}, // 720p(HD)
                {576: 1024},
                {480: 853}, // 480p
                {360: 640}, // 360p (nHD)
                {180: 320}
            ]
        },
        {
            '4x3': [
                {1200: 1600}, // UXGA
                {1080: 1440},
                {720: 960},
                {600: 800}, // SVGA
                {576: 768},
                {480: 640}, // VGA
                {360: 480},
                {288: 352}, // CIF
                {240: 320}, // QVGA
                {144: 176}, // QCIF
                {120: 160} // QQVGA
            ]
        }
    ];
    var resolutionSelectionStrategies = {
        fallbackToLower: {
            id: 0,
            name: 'fallbackToLower'
        },
        fallbackToHigher: {
            id: 1,
            name: 'fallbackToHigher'
        },
        fallbackToLowerThenHigher: {
            id: 2,
            name: 'fallbackToLowerThenHigher'
        },
        exact: {
            id: 3,
            name: 'exact'
        }
    };

    function ResolutionProvider(options) {
        assert.isObject(options, 'options');

        if (options.resolutionSelectionStrategy) {
            assert.isValidType(options.resolutionSelectionStrategy, resolutionSelectionStrategies, 'options.resolutionSelectionStrategy');
        }

        if (options.aspectRatio) {
            assert.isStringNotEmpty(options.aspectRatio, 'options.aspectRatio');
        }

        if (options.resolutionHeight) {
            assert.isNumber(options.resolutionHeight, 'options.resolutionHeight');
        }

        if (options.frameRate) {
            assert.isNumber(options.frameRate, 'options.frameRate');
        }

        this._resolutionSelectionStrategy = options.resolutionSelectionStrategy || resolutionSelectionStrategies.fallbackToLowerThenHigher.name;
        this._defaultAspectRatio = options.aspectRatio || '16x9';
        this._defaultResolutionHeight = options.resolutionHeight || 720;
        this._defaultFrameRate = options.frameRate || 15;
    }

    ResolutionProvider.prototype.getDefaultResolution = function getDefaultResolution() {
        var aspectRatioHeights = getObjectValueInArray(this._defaultAspectRatio, aspectRatios);
        var width = getObjectValueInArray(this._defaultResolutionHeight, aspectRatioHeights) || this.calculateWidthByAspectRatio(this._defaultResolutionHeight, this._defaultAspectRatio);

        return {
            height: this._defaultResolutionHeight,
            width: width,
            aspectRatio: this._defaultAspectRatio
        };
    };

    ResolutionProvider.prototype.getDefaultFrameRate = function getDefaultFrameRate() {
        return this._defaultFrameRate;
    };

    ResolutionProvider.prototype.getNextResolution = function getNextResolution(height, aspectRatio) {
        assert.isNumber(height, 'height');
        assert.isStringNotEmpty(aspectRatio, 'aspectRatio');

        switch (this._resolutionSelectionStrategy) {
        case resolutionSelectionStrategies.fallbackToLower.name:
            return getNextLowestResolution.call(this, height, aspectRatio);
        case resolutionSelectionStrategies.fallbackToHigher.name:
            return getNextHighestResolution.call(this, height, aspectRatio);
        case resolutionSelectionStrategies.fallbackToLowerThenHigher.name:
            var nextResolution = null;

            if (height > this._defaultResolutionHeight) {
                nextResolution = getNextHighestResolution.call(this, height, aspectRatio);
            } else {
                nextResolution = getNextLowestResolution.call(this, height, aspectRatio);

                if (!nextResolution || !nextResolution.height) {
                    nextResolution = getNextHighestResolution.call(this, this._defaultResolutionHeight, this._defaultAspectRatio);
                }
            }

            return nextResolution;
        case resolutionSelectionStrategies.exact.name:
        default:
            return;
        }
    };

    ResolutionProvider.prototype.canResolveNextResolution = function() {
        return this._resolutionSelectionStrategy !== resolutionSelectionStrategies.exact.name;
    };

    ResolutionProvider.prototype.calculateWidthByAspectRatio = function calculateWidthByAspectRatio(height, aspectRatio) {
        switch (aspectRatio) {
        case '16x9':
            return roundUpToNearestEvenNumber((16 / 9) * height);
        case '4x3':
            return roundUpToNearestEvenNumber((4 / 3) * height);
        default:
            throw new Error('Aspect Ratio not supported');
        }
    };

    function roundUpToNearestEvenNumber(value) {
        assert.isNumber(value, 'value');

        return 2 * Math.floor((value + 1) / 2);
    }

    function getNextHighestResolution(height, aspectRatio) {
        var aspectRatioHeights = getObjectValueInArray(aspectRatio, aspectRatios);
        var aspectRatioIndex = getIndexInArray(aspectRatio, aspectRatios);
        var heightIndex = getIndexInArray(height.toString(), aspectRatioHeights);
        var isLargestHeight = heightIndex === 0;
        var isSmallestAspectRatio = aspectRatios.length - 1 === aspectRatioIndex;

        var newAspectRatio;
        var newAspectRatioHeights;
        var newHeight;
        var newWidth;

        if (!_.isNumber(heightIndex)) {
            heightIndex = getNextHighestKeyIndex(height, aspectRatioHeights);

            if (!heightIndex) {
                return;
            }
        } else {
            if (isLargestHeight) {
                if (isSmallestAspectRatio) {
                    return null;
                }

                aspectRatioIndex++;

                newAspectRatio = getIndexKey(aspectRatioIndex, aspectRatios);
                newAspectRatioHeights = getObjectValueInArray(newAspectRatio, aspectRatios);
                heightIndex = getNextHighestKeyIndex(this._defaultResolutionHeight, newAspectRatioHeights);
                newHeight = getIndexKey(heightIndex, aspectRatioHeights);
                newWidth = this.calculateWidthByAspectRatio(newHeight, newAspectRatio);

                return {
                    aspectRatio: newAspectRatio,
                    height: parseInt(newHeight),
                    width: parseInt(newWidth)
                };
            }

            heightIndex--;
        }

        newAspectRatio = getIndexKey(aspectRatioIndex, aspectRatios);
        newAspectRatioHeights = getIndexValue(aspectRatioIndex, aspectRatios);
        newHeight = getIndexKey(heightIndex, newAspectRatioHeights);
        newWidth = newAspectRatioHeights[heightIndex][newHeight];

        return {
            aspectRatio: newAspectRatio,
            height: parseInt(newHeight),
            width: parseInt(newWidth)
        };
    }

    function getNextLowestResolution(height, aspectRatio) {
        var aspectRatioHeights = getObjectValueInArray(aspectRatio, aspectRatios);
        var aspectRatioIndex = getIndexInArray(aspectRatio, aspectRatios);
        var heightIndex = getIndexInArray(height.toString(), aspectRatioHeights);
        var isSmallestHeight = heightIndex === aspectRatioHeights.length - 1;
        var isSmallestAspectRatio = aspectRatios.length - 1 === aspectRatioIndex;

        var newAspectRatio;
        var newAspectRatioHeights;
        var newHeight;
        var newWidth;

        if (!_.isNumber(heightIndex)) {
            heightIndex = getNextLowestKeyIndex(height, aspectRatioHeights);

            if (!heightIndex) {
                return;
            }
        } else {
            if (isSmallestHeight) {
                if (isSmallestAspectRatio) {
                    return null;
                }

                aspectRatioIndex++;

                newAspectRatio = getIndexKey(aspectRatioIndex, aspectRatios);
                newHeight = this._defaultResolutionHeight;
                newWidth = this.calculateWidthByAspectRatio(newHeight, newAspectRatio);

                return {
                    aspectRatio: newAspectRatio,
                    height: parseInt(newHeight),
                    width: parseInt(newWidth)
                };
            }

            heightIndex++;
        }

        newAspectRatio = getIndexKey(aspectRatioIndex, aspectRatios);
        newAspectRatioHeights = getIndexValue(aspectRatioIndex, aspectRatios);
        newHeight = getIndexKey(heightIndex, newAspectRatioHeights);
        newWidth = newAspectRatioHeights[heightIndex][newHeight];

        return {
            aspectRatio: newAspectRatio,
            height: parseInt(newHeight),
            width: parseInt(newWidth)
        };
    }

    function getObjectValueInArray(value, collection) {
        var valueObject = _.find(collection, function(item) {
            return item.hasOwnProperty(value);
        });

        return valueObject ? valueObject[value] : null;
    }

    function getIndexInArray(value, collection) {
        return _.findIndex(collection, function(item) {
            return item.hasOwnProperty(value);
        });
    }

    function getIndexKey(index, collection) {
        var keys = _.keys(collection[index]);

        return keys[0];
    }

    function getIndexValue(index, collection) {
        var keys = _.keys(collection[index]);

        return collection[index][keys[0]];
    }

    function getNextHighestKeyIndex(value, collection) {
        if ( _.keys(collection[0])[0] < value) {
            return null;
        }

        return _.reduce(collection, function(closestIndex, nextItem, index) {
            if (!closestIndex) {
                return index;
            }

            var currentClosestKey = _.keys(collection[closestIndex])[0];
            var nextKey = _.keys(nextItem)[0];

            if (nextKey < value) {
                return closestIndex;
            }

            return Math.abs(value - nextKey) < Math.abs(value - currentClosestKey) ? index : closestIndex;
        });
    }

    function getNextLowestKeyIndex(value, collection) {
        if ( _.keys(collection[collection.length - 1])[0] > value) {
            return null;
        }

        return _.reduce(collection, function(closestIndex, nextItem, index) {
            if (!closestIndex) {
                return index;
            }

            var currentClosestKey = _.keys(collection[closestIndex])[0];
            var nextKey = _.keys(nextItem)[0];

            if (nextKey > value) {
                return closestIndex;
            }

            return Math.abs(value - nextKey) < Math.abs(value - currentClosestKey) ? index : closestIndex;
        });
    }

    return ResolutionProvider;
});