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
    describe('When Sending Http Requests', function () {
        var requests;

        var httpResponseText = 'My Response Text';

        beforeEach(function () {
            this.xhr = sinon.useFakeXMLHttpRequest();

            requests = [];
            this.xhr.onCreate = function (req) {
                requests.push(req);
            };
        });

        afterEach(function () {
            this.xhr.restore();
        });

        describe('When sending http get requests', function () {
            it('has property get that is a function', function () {
                expect(http.get).to.be.a('function');
            });

            it('expects a successful response to trigger callback with responseText', function () {
                http.get('', function (error, responseText) {
                    expect(error).to.be.null;
                    expect(responseText).to.be.equal(httpResponseText);
                });


                requests[0].respond(200, null, httpResponseText);
            });

            it('expects request method to be get', function () {
                http.get('', function () {
                });

                expect(requests[0].method).to.be.equal('GET');
            });

            it('respects settings', function () {
                http.get('', function () {
                }, {timeout: 2000});

                expect(requests[0].timeout).to.be.equal(2000);
            });
        });

        describe('When sending http post requests', function () {
            it('Has property post that is a function', function () {
                expect(http.post).to.be.a('function');
            });

            it('expects a successful response to trigger callback with responseText with json data type', function () {
                http.post('', 'json', function (error, responseText) {
                    expect(error).to.be.null;
                    expect(responseText).to.be.equal(httpResponseText);
                });

                requests[0].respond(200, null, httpResponseText);
            });

            it('expects a successful response to trigger callback with responseText with protobuf data type', function () {
                http.post('', 'protobuf', function (error, responseText) {
                    expect(error).to.be.null;
                    expect(responseText).to.be.equal(httpResponseText);
                });

                requests[0].respond(200, null, httpResponseText);
            });

            it('expects an error when invalid data type passed in', function () {
                http.post('', 'var', function (error, responseText) {
                    expect(error).to.exist;
                    expect(responseText).to.be.undefined;
                });
            });

            it('expects request method to be post', function () {
                http.post('', 'json', function () {
                });

                expect(requests[0].method).to.be.equal('POST');
            });

            it('respects settings', function () {
                http.get('', function () {
                }, {timeout: 2000});

                expect(requests[0].timeout).to.be.equal(2000);
            });
        });
    });
});