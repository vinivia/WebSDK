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
    'phenix-web-detect-browser'
], function(_, DetectBrowser) {
    'use strict';

    var environment = {};
    var browser = new DetectBrowser(navigator.userAgent).detect();

    environment.getEnvironmentFromUrl = function(uri) {
        try {
            var baseURL;

            if (URL && browser.browser !== 'IE') {
                baseURL = new URL(uri);
            } else {
                baseURL = getLocation(uri);
            }

            if (baseURL.port) {
                return baseURL.protocol + '//' + baseURL.hostname + ':' + baseURL.port;
            }

            return baseURL.protocol + '//' + baseURL.hostname;
        } catch (e) {
            return '';
        }
    };

    environment.parseEnvFromPcastBaseUri = function(uri) {
        uri = uri.toLowerCase();

        if (_.includes(uri, 'local')) {
            return 'local';
        } else if (_.includes(uri, 'stg')) {
            return 'staging';
        }

        return 'production';
    };

    environment.getTelemetryServerUri = function(baseUri) {
        if (!baseUri) {
            return '';
        }

        try {
            var baseURL;

            if (URL && browser.browser !== 'IE') {
                baseURL = new URL(baseUri);
            } else {
                baseURL = getLocation(baseUri);
            }

            var segments = baseURL.hostname.split('.');

            if (segments.length === 2 ||
                (segments.length === 3 && segments[segments.length - 2].length <= 2 && segments[segments.length - 1].length <= 3)
            ) {
                segments.unshift('telemetry');
            } else if (_.startsWith(segments[0], 'stg-') || _.endsWith(segments[0], '-stg') || _.includes(segments[0], '-stg-') || segments[0] === 'stg') {
                segments[0] = 'telemetry-stg';
            } else if (_.startsWith(segments[0], 'local') || _.endsWith(segments[0], 'local')) {
                // Leave URL unchanged
            } else {
                segments[0] = 'telemetry';
            }

            baseURL.hostname = segments.join('.');

            switch (baseURL.protocol) {
            case 'ws:':
                baseURL.protocol = 'http:';

                break;
            case 'wss:':
                baseURL.protocol = 'https:';

                break;

            default:
                break;
            }

            if (baseURL.port) {
                return baseURL.protocol + '//' + baseURL.hostname + ':' + baseURL.port + '/telemetry';
            }

            return baseURL.protocol + '//' + baseURL.hostname + '/telemetry';
        } catch (e) {
            return baseUri;
        }
    };

    function getLocation(url) {
        var match = url.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/); // eslint-disable-line

        return match && {
            href: url,
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7],
            origin: match[1] + '//' + match[2]
        };
    }

    return environment;
});