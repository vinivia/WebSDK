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
    'phenix-web-assert',
    'phenix-rtc'
], function(_, assert) {
    'use strict';

    var h264ProfileIdRegex = /profile-level-id=[^;\n]*/;
    var vp8Regex = /vp8/i;
    var vp9Regex = /vp9/i;
    var h264Regex = /h264/i;
    var h265Regex = /h265/i;

    function sdpUtil() {

    }

    sdpUtil.prototype.getH264ProfileIds = function getH264ProfileIds(offerSdp) {
        assert.isStringNotEmpty(offerSdp, 'offerSdp');

        var h264ProfileIds = [];
        var h264ProfileIdMatch = offerSdp.match(h264ProfileIdRegex);
        var restOfOffer = offerSdp;

        while (h264ProfileIdMatch) {
            var h264ProfileId = _.get(h264ProfileIdMatch, '0', '');

            h264ProfileIds.push(h264ProfileId.split('=')[1]);

            restOfOffer = restOfOffer.substring(h264ProfileIdMatch.index + h264ProfileId.length, offerSdp.length);
            h264ProfileIdMatch = restOfOffer.match(h264ProfileIdRegex);
        }

        return h264ProfileIds;
    };

    sdpUtil.prototype.replaceH264ProfileId = function replaceH264ProfileId(offerSdp, profileIdToReplace, newProfileId) {
        assert.isStringNotEmpty(offerSdp, 'offerSdp');
        assert.isStringNotEmpty(newProfileId, 'newProfileId');

        var profileIds = this.getH264ProfileIds(offerSdp);

        if (!_.includes(profileIds, profileIdToReplace)) {
            return offerSdp;
        }

        return offerSdp.replace('profile-level-id=' + profileIdToReplace, 'profile-level-id=' + newProfileId);
    };

    sdpUtil.prototype.getH264ProfileIdWithSameProfileAndEqualToOrHigherLevel = function(profileIds, replaceProfileId) {
        if (_.includes(profileIds, replaceProfileId)) {
            return replaceProfileId;
        }

        var nextProfileId = _.reduce(profileIds, function(selectedProfileId, profileId) {
            var selectedProfile = parseInt(selectedProfileId.substring(0, 2), 16);
            var selectedLevel = parseInt(selectedProfileId.substring(4, 6), 16);
            var profile = parseInt(profileId.substring(0, 2), 16);
            var level = parseInt(profileId.substring(4, 6), 16);

            // We prefer the profile that we are replacing
            if (selectedProfile !== profile) {
                return selectedProfileId;
            }

            return selectedLevel >= level ? selectedProfileId : profileId;
        }, replaceProfileId);

        return nextProfileId === replaceProfileId ? null : nextProfileId;
    };

    sdpUtil.prototype.getH264ProfileIdWithSameOrHigherProfileAndEqualToOrHigherLevel = function(profileIds, replaceProfileId) {
        var matchingProfile = this.getH264ProfileIdWithSameProfileAndEqualToOrHigherLevel(profileIds, replaceProfileId);

        if (matchingProfile) {
            return matchingProfile;
        }

        var nextProfileId = _.reduce(profileIds, function(selectedProfileId, profileId) {
            var selectedProfile = parseInt(selectedProfileId.substring(0, 2), 16);
            var selectedLevel = parseInt(selectedProfileId.substring(4, 6), 16);
            var profile = parseInt(profileId.substring(0, 2), 16);
            var level = parseInt(profileId.substring(4, 6), 16);

            // We prefer the profile that we are replacing
            if (selectedProfile < profile) {
                return profileId;
            } else if (profile < selectedProfile) {
                return selectedProfileId;
            }

            return selectedLevel > level ? selectedProfileId : profileId;
        }, replaceProfileId);

        return nextProfileId === replaceProfileId ? null : nextProfileId;
    };

    sdpUtil.prototype.getSupportedCodecs = function getSupportedCodecs(offerSdp) {
        assert.isStringNotEmpty(offerSdp, 'offerSdp');

        var codecs = [];

        if (vp8Regex.test(offerSdp)) {
            codecs.push('VP8');
        }

        if (vp9Regex.test(offerSdp)) {
            codecs.push('VP9');
        }

        if (h264Regex.test(offerSdp)) {
            codecs.push('H264');
        }

        if (h265Regex.test(offerSdp)) {
            codecs.push('H265');
        }

        return codecs;
    };

    return new sdpUtil();
});