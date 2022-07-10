'use strict';

var memberEnums = {
    roles: {
        participant: {
            id: 0,
            name: 'Participant'
        },
        moderator: {
            id: 1,
            name: 'Moderator'
        },
        presenter: {
            id: 2,
            name: 'Presenter'
        },
        audience: {
            id: 3,
            name: 'Audience'
        }
    },
    states: {
        active: {
            id: 0,
            name: 'Active'
        },
        passive: {
            id: 1,
            name: 'Passive'
        },
        handRaised: {
            id: 2,
            name: 'HandRaised'
        },
        inactive: {
            id: 3,
            name: 'Inactive'
        },
        offline: {
            id: 4,
            name: 'Offline'
        }
    }
};

module.exports = memberEnums;