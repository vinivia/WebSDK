'use strict';

var roomEnums = {
    types: {
        directChat: {
            id: 0,
            name: 'DirectChat'
        },
        multiPartyChat: {
            id: 1,
            name: 'MultiPartyChat'
        },
        moderatedChat: {
            id: 2,
            name: 'ModeratedChat'
        },
        townHall: {
            id: 3,
            name: 'TownHall'
        },
        channel: {
            id: 4,
            name: 'Channel'
        }
    },
    events: {
        memberJoined: {
            id: 0,
            name: 'MemberJoined'
        },
        memberLeft: {
            id: 1,
            name: 'MemberLeft'
        },
        memberUpdated: {
            id: 2,
            name: 'MemberUpdated'
        },
        roomUpdated: {
            id: 3,
            name: 'RoomUpdated'
        },
        roomEnded: {
            id: 4,
            name: 'RoomEnded'
        }
    }
};

module.exports = roomEnums;