/**
 * Copyright 2017 Phenix Inc. All Rights Reserved.
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
    '../environment',
    './MetricsTransmitter'
], function (_, assert, environment, MetricsTransmitter) {
    var config = {
        urls: {
            local: '',
            staging: 'https://telemetry-stg.phenixp2p.com',
            production: 'https://telemetry.phenixp2p.com'
        }
    };

    function MetricsTransmitterFactory() {
        this._metricsTransmitters = {};
    }

    MetricsTransmitterFactory.prototype.createMetricsTransmitter = function createMetricsTransmitter(pcastBaseUri) {
        var env = environment.parseEnvFromPcastBaseUri(pcastBaseUri || '');

        var telemetryServerUrl = config.urls[env];

        if (!this._metricsTransmitters[env]) {
            this._metricsTransmitters[env] = createNewTransmitter.call(this, telemetryServerUrl);
        }

        return this._metricsTransmitters[env];
    };

    function createNewTransmitter(uri) {
        var transmitter = new MetricsTransmitter(uri);

        if (!uri) {
            transmitter.setEnabled(false);
        }

        return transmitter;
    }

    return new MetricsTransmitterFactory();
});