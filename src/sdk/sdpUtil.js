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
    'phenix-rtc'
], function (_, assert) {
    'use strict';

    var h264ProfileIdRegex = /profile-level-id=[^;\n]*/;

    function sdpUtil() {

    }

    sdpUtil.prototype.getH264ProfileId = function getUserMedia(offerSdp) {
        assert.isStringNotEmpty(offerSdp, 'offerSdp');

        var h264ProfileIdMatch = _.get(offerSdp.match(h264ProfileIdRegex), '0', '');

        return _.get(h264ProfileIdMatch.split('='), '1', null);
    };

    sdpUtil.prototype.replaceH264ProfileId = function getUserMedia(offerSdp, newProfileId) {
        assert.isStringNotEmpty(offerSdp, 'offerSdp');
        assert.isStringNotEmpty(newProfileId, 'newProfileId');

        var currentProfileId = this.getH264ProfileId(offerSdp);

        if (!currentProfileId) {
            return offerSdp;
        }

        return offerSdp.replace('profile-level-id=' + currentProfileId, 'profile-level-id=' + newProfileId);
    };

    return new sdpUtil();
});