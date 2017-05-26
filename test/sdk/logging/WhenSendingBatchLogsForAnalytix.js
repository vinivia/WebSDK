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
    'sdk/logging/AnalytixAppender',
    'ByteBuffer',
    'sdk/MQProtocol',
    'sdk/logging/logging.json'
], function (AnalytixAppender, ByteBuffer, MQProtocol, logging) {
    describe('When Sending Batch Logs For Analytix', function () {
        var requests;
        var analytixAppender;

        var sessionId = 'mockSessionId';

        beforeEach(function() {
            this.xhr = sinon.useFakeXMLHttpRequest();

            requests = [];
            this.xhr.onCreate = function (req) {
                requests.push(req);
            };

            analytixAppender = new AnalytixAppender();
        });

        afterEach(function() {
            this.xhr.restore();

            analytixAppender.setUri('local');
        });

        it('Has property log that is a function', function () {
            expect(analytixAppender.log).to.be.a('function');
        });

        it('Has property setUri that is a function', function () {
            expect(analytixAppender.setUri).to.be.a('function');
        });

        it('Has property setThreshold that is a function', function () {
            expect(analytixAppender.setUri).to.be.a('function');
        });

        it('Has property getThreshold that is a function', function () {
            expect(analytixAppender.setUri).to.be.a('function');
        });

        it('Expect logging without setting uri does not trigger http request', function () {
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            expect(requests[0]).to.not.be.ok;
        });

        it('Expect logging with setting uri does trigger http request', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            expect(requests[0]).to.be.ok;
        });

        it('Expect threshold to be set when setThreshold is passed a log level', function () {
            analytixAppender.setThreshold(logging.level.WARN);

            expect(analytixAppender.getThreshold()).to.be.equal(logging.level.WARN);
        });

        it('Expect only logs of level at the threshold to be logged', function () {
            analytixAppender.setThreshold(logging.level.WARN);
            analytixAppender._records = [];

            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});
            expect(analytixAppender._records).length(0);

            analytixAppender.log(0, 'Debug', '', ['Message'], sessionId, '', '', '', {level: logging.level.DEBUG});
            expect(analytixAppender._records).length(0);

            analytixAppender.log(0, 'Info', '', ['Message'], sessionId, '', '', '', {level: logging.level.INFO});
            expect(analytixAppender._records).length(0);

            analytixAppender.log(0, 'Warn', '', ['Message'], sessionId, '', '', '', {level: logging.level.WARN});
            expect(analytixAppender._records).length(1);

            analytixAppender.log(0, 'Error', '', ['Message'], sessionId, '', '', '', {level: logging.level.ERROR});
            expect(analytixAppender._records).length(2);

            analytixAppender.log(0, 'Fatal', '', ['Message'], sessionId, '', '', '', {level: logging.level.FATAL});
            expect(analytixAppender._records).length(3);
        });

        it('Expect logging with setting uri does removes pending logs from queue beneath max batch size of 100', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            expect(analytixAppender._records).length(0);
        });

        it('Expect response with 200 status to batch log request to not throw error', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            var protocol = new MQProtocol();
            var responseText = protocol.encode('analytix.StoreLogRecordsResponse', {status:'ok', storedRecords: 2}).toBinary();

            expect(function () {
                requests[0].respond(200, null, responseText);
            }).to.not.throw();
        });

        it('Expect messages logged after initial log but before response to be queued', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});
            analytixAppender.log(0, 'Trace', '', ['Message1'], sessionId, '', '', '', {level: logging.level.TRACE});
            analytixAppender.log(0, 'Trace', '', ['Message2'], sessionId, '', '', '', {level: logging.level.TRACE});

            expect(analytixAppender._records).length(2);
        });

        it('Expect queued messages to be sent in next request upon subsequent log', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});
            analytixAppender.log(0, 'Trace', '', ['Message1'], sessionId, '', '', '', {level: logging.level.TRACE});
            analytixAppender.log(0, 'Trace', '', ['Message2'], sessionId, '', '', '', {level: logging.level.TRACE});

            var protocol = new MQProtocol();
            var responseText = protocol.encode('analytix.StoreLogRecordsResponse', {status:'ok', storedRecords: 2}).toBinary();

            requests[0].respond(200, null, responseText);

            analytixAppender.log(0, 'Trace', '', ['Message3'], sessionId, '', '', '', {level: logging.level.TRACE});

            expect(analytixAppender._records).length(0);
        });

        it('Expect only a maximum of 100 logs to be sent at a time', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            for (var i = 0; i < 199; i++) {
                analytixAppender.log(0, 'Trace', '', ['Message' + i], sessionId, '', '', '', {level: logging.level.TRACE});
            }

            var protocol = new MQProtocol();
            var responseText = protocol.encode('analytix.StoreLogRecordsResponse', {status:'ok', storedRecords: 2}).toBinary();

            requests[0].respond(200, null, responseText);

            analytixAppender.log(0, 'Trace', '', ['LastMessage'], sessionId, '', '', '', {level: logging.level.TRACE});

            expect(analytixAppender._records).length(100);
        });

        it('Expect logs to be deleted if maximum queue size is reached', function () {
            analytixAppender.setUri('stg');
            analytixAppender.log(0, 'Trace', '', ['Message'], sessionId, '', '', '', {level: logging.level.TRACE});

            for (var i = 0; i < 1001; i++) {
                analytixAppender.log(0, 'Trace', '', ['Message' + i], sessionId, '', '', '', {level: logging.level.TRACE});
            }

            expect(analytixAppender._records).length(501);
        });
    });
});