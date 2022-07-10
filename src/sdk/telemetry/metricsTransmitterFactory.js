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
const _ = require('phenix-web-lodash-light');
const assert = require('phenix-web-assert');
const environment = require('../environment');
const MetricsTransmitter = require('./MetricsTransmitter');
function MetricsTransmitterFactory() {
    this._metricsTransmitters = {};
}

MetricsTransmitterFactory.prototype.createMetricsTransmitter = function createMetricsTransmitter(pcastBaseUri) {
    var env = environment.getEnvironmentFromUrl(pcastBaseUri || '');

    var telemetryServerUrl = environment.getTelemetryServerUri(pcastBaseUri);

    if (!this._metricsTransmitters[env]) {
        this._metricsTransmitters[env] = createNewTransmitter.call(this, telemetryServerUrl, env);
    }

    return this._metricsTransmitters[env];
};

function createNewTransmitter(uri, env) {
    var transmitter = new MetricsTransmitter(uri, env);

    if (!uri) {
        transmitter.setEnabled(false);
    }

    return transmitter;
}

module.exports = new MetricsTransmitterFactory();