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
    'Promise',
    'jquery',
    'lodash',
    'sdk/PCast',
    'sdk/logging/pcastLoggerFactory',
    'sdk/logging/Logger'
], function (Promise, $, _, PCast, pcastLoggerFactory, Logger) {
    'use strict';

    describe('When connecting to PCast', function () {
        var pcastLoggerStub;
        var pcast;
        var authToken;

        this.timeout(30000);

        before(function () {
            pcastLoggerStub = sinon.stub(pcastLoggerFactory, 'createPCastLogger', function() {
                return sinon.createStubInstance(Logger);
            }); //disable requests to external source

            pcast = new PCast();

            var parser = document.createElement('a');
            parser.href = pcast.getBaseUri();

            var applicationId = window.__env__['PHENIX_APPLICATION_ID'];
            var secret = window.__env__['PHENIX_SECRET'];
            var data = {
                applicationId: applicationId,
                secret: secret
            };

            expect(applicationId).to.be.a('string');
            expect(secret).to.be.a('string');

            return new Promise(function (resolve, reject) {
                $.ajax({
                    url: 'https://' + parser.hostname + '/pcast/auth',
                    accepts: 'application/json',
                    contentType: 'application/json',
                    method: 'POST',
                    data: JSON.stringify(data)
                }).success(function (data) {
                    authToken = data.authenticationToken;
                    resolve();
                }).error(function (jqXHR, textStatus, errorThrown) {
                    reject(errorThrown instanceof Error ? errorThrown : new Error(textStatus || 'undefined-error'));
                });
            }).should.be.fulfilled;
        });
        it('acquires an authentication token', function () {
            expect(authToken).to.be.a('string');
        });
        describe('When starting PCast', function () {
            var theSessionId;
            var onlineCallbackInvocationCount = 0;
            var offlineCallbackInvocationCount = 0;

            before(function () {
                return new Promise(function (resolve, reject) {
                    pcast.start(authToken, function authenticateCallback (pcast, status, sessionId) {
                        theSessionId = sessionId;

                        if (status !== 'ok') {
                            reject(new Error('auth-failed'));
                        } else {
                            resolve();
                        }
                    }, function onlineCallback (pcast) {
                        onlineCallbackInvocationCount++;
                    }, function offlineCallback (pcast) {
                        offlineCallbackInvocationCount++;
                    });
                }).should.be.fulfilled;
            });
            it('receives a session ID', function () {
                expect(theSessionId).to.be.a('string');
            });
            it('became "online" once', function () {
                expect(onlineCallbackInvocationCount).to.be.equal(1);
            });
            it('did not become "offline"', function () {
                expect(offlineCallbackInvocationCount).to.be.equal(0);
            });
            describe('When stopping PCast', function () {
                before(function () {
                    return new Promise(function (resolve, reject) {
                        pcast.stop();
                        var intervalId = setInterval(function () {
                            if (offlineCallbackInvocationCount > 0) {
                                resolve();
                                clearInterval(intervalId);
                            } else {
                                reject(new Error('Offline Callback not called'));
                            }
                        }, 100);
                    }).should.be.fulfilled;
                });
                it('became "online" once', function () {
                    expect(onlineCallbackInvocationCount).to.be.equal(1);
                });
                it('became "offline" once', function () {
                    expect(offlineCallbackInvocationCount).to.be.equal(1);
                });
            });
            after(function () {
                pcast.stop();
                pcastLoggerStub.restore();
            });
        });
    });
});