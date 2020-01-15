/**
 * Copyright 2020 Phenix Real Time Solutions, Inc. All Rights Reserved.
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

/* global exports */
const preferencesService = require('sdk/preferences/service');
const pageMod = require('sdk/page-mod');
const allowedDomainsPreferenceKey = 'media.getusermedia.screensharing.allowed_domains';
const include = /.*phenixp2p.*/;
const whiteListedDomains = ['phenixp2p.com', '*.phenixp2p.com'];

function addWhiteListedDomainsToPreferences() {
    const domains = preferencesService.get(allowedDomainsPreferenceKey).replace(/\s/g, '').split(',');

    whiteListedDomains.forEach(function(whiteListedDomain) {
        if (domains.indexOf(whiteListedDomain) !== -1) {
            return;
        }

        domains.push(whiteListedDomain);
    });

    preferencesService.set(allowedDomainsPreferenceKey, domains.join(','));
}

function removeWhiteListedDomainsFromPreferences() {
    var domains = preferencesService.get(allowedDomainsPreferenceKey).replace(/\s/g, '').split(',');

    whiteListedDomains.forEach(function(whiteListedDomain) {
        domains = domains.filter(function(domain) {
            return domain !== whiteListedDomain;
        });
    });

    preferencesService.set(allowedDomainsPreferenceKey, domains.join(','));
}

exports.main = function(options) {
    switch (options.loadReason) {
    case 'install':
    case 'upgrade':
    case 'downgrade':
    case 'enable':
        addWhiteListedDomainsToPreferences();

        break;
    case 'startup':
        break;
    default:
        break;
    }
};

exports.onUnload = function(reason) {
    switch (reason) {
    case 'uninstall':
    case 'upgrade':
    case 'downgrade':
    case 'disable':
        removeWhiteListedDomainsFromPreferences();

        break;
    case 'shutdown':
        break;
    default:
        break;
    }
};

pageMod.PageMod({
    include: include,
    attachTo: ['existing', 'top'],
    contentScript: 'unsafeWindow.PCastScreenSharing = cloneInto({}, unsafeWindow);'
});