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
    'sdk/http'
], function (http) {
    describe('When Sending Http Requests with Retry', function () {
        var requests;

        var httpResponseText = 'My Response Text';

        beforeEach(function() {
            this.xhr = sinon.useFakeXMLHttpRequest();

            requests = [];
            this.xhr.onCreate = function (req) {
                requests.push(req);
            };
        });

        afterEach(function() {
            this.xhr.restore();
        });

        describe('When sending http get requests', function () {
            it('Has property getWithRetry that is a function', function () {
                expect(http.getWithRetry).to.be.a('function');
            });

            it('Expect a successful response to trigger callback with responseText', function () {
                http.getWithRetry('', function(error, responseText) {
                    expect(error).to.not.be.ok;
                    expect(responseText).to.be.equal(httpResponseText);
                }, 2);


                requests[0].respond(200, null, httpResponseText);
            });

            it('Expect request method to be get', function () {
                http.getWithRetry('', function(error, responseText) { }, 2);

                expect(requests[0].method).to.be.equal('GET');
            });

            it('Expect a response of 500 to attempt a retry', function () {
                http.getWithRetry('', function(error, responseText) {}, 2);

                requests[0].respond(500, [], 'Error');

                expect(requests[1]).to.be.ok;
            });

            it('Expect a response of 500 to attempt a retry until response with 200', function () {
                http.getWithRetry('', function(error, responseText) {}, 2);

                requests[0].respond(500, [], 'Error');
                requests[1].respond(200, [], 'text: "My Response Text"');

                expect(requests[2]).to.not.be.ok;
            });

            it('Expect a responses with 500 to attempt to retry request until max is reached then return error', function () {
                http.getWithRetry('', function(error, responseText) {
                    expect(error).to.be.ok;
                    expect(responseText).to.be.not.ok;
                }, 2);

                requests[0].respond(500, [], 'Error');
                requests[1].respond(500, [], 'Error');
                requests[2].respond(500, [], 'Error');

                expect(requests[3]).to.not.be.ok;
            });
        });

        describe('When sending http post requests', function () {
            it('Has property PostWithRetry that is a function', function () {
                expect(http.postWithRetry).to.be.a('function');
            });

            it('Expect a successful response to trigger callback with responseText with json data type', function () {
                http.postWithRetry('', 'json', {}, function(error, responseText) {
                    expect(error).to.not.be.ok;
                    expect(responseText).to.be.equal(httpResponseText);
                }, 2);


                requests[0].respond(200, null, httpResponseText);
            });

            it('Expect a successful response to trigger callback with responseText with protobuf data type', function () {
                http.postWithRetry('', 'protobuf', {}, function(error, responseText) {
                    expect(error).to.not.be.ok;
                    expect(responseText).to.be.equal(httpResponseText);
                }, 2);


                requests[0].respond(200, null, httpResponseText);
            });

            it('Expect an error when invalid data type passed in', function () {
                http.postWithRetry('', 'var', {}, function(error, responseText) {
                    expect(error).to.be.ok;
                    expect(responseText).to.not.be.ok;
                }, 2);
            });

            it('Expect request method to be post', function () {
                http.postWithRetry('', 'json', {}, function(error, responseText) { }, 2);

                expect(requests[0].method).to.be.equal('POST');
            });

            it('Expect a response of 500 to attempt a retry', function () {
                http.postWithRetry('', 'json', {}, function(error, responseText) {}, 2);

                requests[0].respond(500, [], 'Error');

                expect(requests[1]).to.be.ok;

                requests[1].respond(200, [], 'text: "My Response Text"');

                expect(requests[2]).to.not.be.ok;
            });

            it('Expect a responses with 500 to attempt to retry request until max is reached then return error', function () {
                http.postWithRetry('', 'json', {}, function(error, responseText) {
                    expect(error).to.be.ok;
                    expect(responseText).to.be.not.ok;
                }, 3);

                requests[0].respond(500, [], 'Error');
                requests[1].respond(500, [], 'Error');
                requests[2].respond(500, [], 'Error');

                expect(requests[3]).to.not.be.ok;
            });
        });
    })
});