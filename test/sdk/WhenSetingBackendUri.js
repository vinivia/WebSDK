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

define([
    'lodash',
    'sdk/environment'
], function(_, environment) {
    'use strict';
    describe('When setting pcast-uri with local subdomain "https://local.test.com"', function() {
        it('resolves to telemetry URL "https://local.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://local.test.com');
            expect(telemetryUrl).eql('https://local.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with local subdomain and port "https://local.test.com:9999"', () => {
        it('resolves to telemetry URL "https://local.test.com:9999/telemetry"', () => {
            const telemetryUrl = environment.getTelemetryServerUri('https://local.test.com:9999');

            expect(telemetryUrl).eql('https://local.test.com:9999/telemetry');
        });
    });

    describe('When setting pcast-uri with local subdomain, port and path "https://local.test.com:9999/pcast/uri"', () => {
        it('resolves to telemetry URL "https://local.test.com:9999/telemetry"', () => {
            const telemetryUrl = environment.getTelemetryServerUri('https://local.test.com:9999/pcast/uri');

            expect(telemetryUrl).eql('https://local.test.com:9999/telemetry');
        });
    });

    describe('When setting pcast-uri with pcast-stg subdomain "https://pcast-stg.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry-stg.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://pcast-stg.test.com');
            expect(telemetryUrl).eql('https://telemetry-stg.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with stg subdomain "https://stg.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry-stg.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://stg.test.com');
            expect(telemetryUrl).eql('https://telemetry-stg.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with stg-us subdomain "https://stg-us.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry-stg.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://stg-us.test.com');
            expect(telemetryUrl).eql('https://telemetry-stg.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with pcast subdomain "https://pcast.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://pcast.test.com');
            expect(telemetryUrl).eql('https://telemetry.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with XYZ subdomain "https://xyz.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://xyz.test.com');
            expect(telemetryUrl).eql('https://telemetry.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with co.uk subdomain "https://xyz.test.co.uk"', function() {
        it('resolves to telemetry URL "https://telemetry.test.co.uk/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://xyz.test.co.uk');
            expect(telemetryUrl).eql('https://telemetry.test.co.uk/telemetry');
        });
    });

    describe('When setting pcast-uri with co.uk subdomain "https://test.co.uk"', function() {
        it('resolves to telemetry URL "https://telemetry.test.co.uk/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://test.co.uk');
            expect(telemetryUrl).eql('https://telemetry.test.co.uk/telemetry');
        });
    });

    describe('When setting pcast-uri with two subdomain XYZ.XYZ subdomain "https://xyz.xyz.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry.xyz.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://xyz.xyz.test.com');
            expect(telemetryUrl).eql('https://telemetry.xyz.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with www. subdomain "https://www.test.com"', function() {
        it('resolves to telemetry URL "https://telemetry.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://www.test.com');
            expect(telemetryUrl).eql('https://telemetry.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri with two subdomain XYZ.XYZ subdomain "https://xyz.xyz-stg.test.com"', () => {
        it('resolves to telemetry URL "https://telemetry.xyz-stg.test.com/telemetry"', () => {
            const telemetryUrl = environment.getTelemetryServerUri('https://xyz.xyz-stg.test.com');

            expect(telemetryUrl).eql('https://telemetry.xyz-stg.test.com/telemetry');
        });
    });

    describe('When setting pcast-uri no subdomain "https://test.com"', function() {
        it('resolves to telemetry URL "https://telemetry.test.com/telemetry"', function() {
            var telemetryUrl = environment.getTelemetryServerUri('https://test.com');
            expect(telemetryUrl).eql('https://telemetry.test.com/telemetry');
        });
    });
});