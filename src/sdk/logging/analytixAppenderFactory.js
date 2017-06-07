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
    '../environment',
    '../assert',
    './AnalytixAppender'
], function (_, environment, assert, AnalytixAppender) {

    var config = {
        urls: {
            local: '',
            staging: 'https://analytix-stg.phenixp2p.com',
            production: 'https://analytix.phenixp2p.com'
        }
    };

    function AnalytixAppenderFactory() {
        this._analytixAppenders = {};
    }

    AnalytixAppenderFactory.prototype.getAppender = function getAppender(pcastBaseUri) {
        var env = environment.parseEnvFromPcastBaseUri(pcastBaseUri || '');

        var analytixServerUrl = config.urls[env];

        if (!this._analytixAppenders[env]) {
            this._analytixAppenders[env] = createNewAppender.call(this, analytixServerUrl);
        }

        return this._analytixAppenders[env];
    };

    function createNewAppender(uri) {
        var appender = new AnalytixAppender();

        if (uri) {
            appender.setUri(uri);
        } else {
            appender.setEnabled(false);
        }

        return appender;
    }

    return new AnalytixAppenderFactory();
});