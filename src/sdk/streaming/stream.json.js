'use strict';

var streamEnums = {
    networkStates: {
        networkEmpty: {
            id: 0,
            name: 'NETWORK_EMPTY'
        },
        networkIdle: {
            id: 1,
            name: 'NETWORK_IDLE'
        },
        networkLoading: {
            id: 2,
            name: 'NETWORK_LOADING'
        },
        networkNoSource: {
            id: 3,
            name: 'NETWORK_NO_SOURCE'
        }
    },
    types: {
        realTime: {
            id: 0,
            name: 'real-time'
        },
        dash: {
            id: 1,
            name: 'dash'
        },
        hls: {
            id: 2,
            name: 'hls'
        },
        rtmp: {
            id: 0,
            name: 'rtmp'
        }
    },
    streamEvents: {
        playerEnded: {
            id: 0,
            name: 'playerended'
        },
        playerError: {
            id: 1,
            name: 'playererror'
        },
        stopped: {
            id: 2,
            name: 'stopped'
        }
    },
    rendererEvents: {
        ended: {
            id: 0,
            name: 'ended'
        },
        error: {
            id: 1,
            name: 'error'
        },
        autoMuted: {
            id: 2,
            name: 'autoMuted'
        },
        failedToPlay: {
            id: 3,
            name: 'failedToPlay'
        }
    }
};

module.exports = streamEnums;