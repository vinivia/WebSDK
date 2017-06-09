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
    'sdk/observable/Observable',
    'sdk/room/RoomService',
    'sdk/room/Room',
    'sdk/room/Member',
    '../../test/mock/mockPCast'
], function (Observable, RoomService, Room, Member, MockPCast) {
    function MockRoomService () {
        var room = sinon.createStubInstance(Room);

        var roomService = new RoomService(new MockPCast());

        roomService.start('Audience', 'MockScreenName');

        MockRoomService.buildUpMockRoom(roomService, room);

        return roomService;
    }

    MockRoomService.buildUpMockRoomWithMembers = function (roomService, members) {
        var room = sinon.createStubInstance(Room);

        room.getObservableMembers.restore();
        room.getObservableMembers = sinon.stub(room, 'getObservableMembers', function () {
            return new Observable(members);
        });

        this.buildUpMockRoom(roomService, room);
    };

    MockRoomService.buildUpMockRoom = function (roomService, room) {
        if (roomService.getObservableActiveRoom.restore) {
            roomService.getObservableActiveRoom.restore();
        }

        roomService.getObservableActiveRoom = sinon.stub(roomService, 'getObservableActiveRoom', function () {
            return new Observable(room);
        });
    };

    return MockRoomService;
});