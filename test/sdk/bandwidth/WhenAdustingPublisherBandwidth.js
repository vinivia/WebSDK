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
    'sdk/bandwidth/PublisherBandwidthAdjuster',
    '../../../test/mock/mockRoomService'
], function (PublisherBandwidthAdjuster, MockRoomService) {
    describe('When Adjusting Publisher Bandwidth', function () {
        var publisher = {};
        var publisherBandwidthAdjuster;
        var roomService;

        beforeEach(function () {
            publisherBandwidthAdjuster = new PublisherBandwidthAdjuster(publisher);

            roomService = new MockRoomService();
        });

        afterEach(function () {
            publisherBandwidthAdjuster.close();
            roomService.stop();
        });

        it('Has property connect that is a function', function () {
            expect(publisherBandwidthAdjuster.connect).to.be.a('function');
        });

        it('Has property close that is a function', function () {
            expect(publisherBandwidthAdjuster.close).to.be.a('function');
        });

        it('Room service with no room causes default bandwidth limit', function () {
            MockRoomService.buildUpMockRoom(roomService, null);

            publisher.limitBandwidth = function (bandwidth) {
                expect(bandwidth).to.be.equal(500000);
            };

            publisherBandwidthAdjuster.connect(roomService);
        });

        it('Room service with no room causes passed bandwidth limit', function () {
            MockRoomService.buildUpMockRoom(roomService, null);

            publisher.limitBandwidth = function (bandwidth) {
                expect(bandwidth).to.be.equal(100000);
            };

            publisherBandwidthAdjuster.connect(roomService, {roomBandwidthLimit: 100000});
        });

        it('Room service with a room with 2 member causes default bandwidth limit', function () {
            MockRoomService.buildUpMockRoomWithMembers(roomService, [{}]);

            publisher.limitBandwidth = function (bandwidth) {
                expect(bandwidth).to.be.equal(500000);
            };

            publisherBandwidthAdjuster.connect(roomService);
        });

        it('Room service with a room with 3 members causes passed bandwidth/2 bandwidth limit', function () {
            MockRoomService.buildUpMockRoomWithMembers(roomService, [{}, {}, {}]);

            publisher.limitBandwidth = function (bandwidth) {
                expect(bandwidth).to.be.equal(100000/2);
            };

            publisherBandwidthAdjuster.connect(roomService, {roomBandwidthLimit: 100000});
        });
    });
});