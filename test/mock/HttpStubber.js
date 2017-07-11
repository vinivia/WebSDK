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
define([], function () {
    function HttpStubber() {
        this._requests = [];
    }

    HttpStubber.prototype.stub = function(callback) {
        var that = this;

        this.xhr = sinon.useFakeXMLHttpRequest();

        this.xhr.onCreate = function (req) {
            that._requests.push(req);

            if (callback) {
                callback(req);
            }
        };
    };

    HttpStubber.prototype.stubAuthRequest = function(callback) {
        var that = this;
        var authResponse = {
            status: 'ok',
            authenticationToken: 'newToken'
        };

        this.xhr = sinon.useFakeXMLHttpRequest();

        this.xhr.onCreate = function (req) {
            that._requests.push(req);

            req.respond(200, null, authResponse);

            if (callback) {
                callback(req);
            }
        };
    };

    HttpStubber.prototype.restore = function() {
        this.xhr.restore();

        this._requests = [];
    };

    HttpStubber.prototype.getRequests = function() {
        return this._requests;
    };


    return HttpStubber;
});