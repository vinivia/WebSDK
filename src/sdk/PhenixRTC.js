/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. All Rights Reserved.
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
    'phenix-web-lodash-light',
    'phenix-web-detect-browser',
    './PhenixFlashVideo'
], function(_, DetectBrowser, PhenixVideo) {
    'use strict';

    // ----------------------------------------
    // rtc/global.js

    var envGlobal = window; // eslint-disable-line no-restricted-globals

    // ----------------------------------------
    // rtc/WebRTCShim.js

    var log = function() {
        // Console.log.apply(console, arguments);
    };

    var logWarn = function() {
        console.log.apply(console, arguments);
    };

    var browser = new DetectBrowser(navigator.userAgent).detect();
    var RTCPeerConnection = envGlobal.RTCPeerConnection;
    var RTCSessionDescription = envGlobal.RTCSessionDescription;
    var RTCIceCandidate = envGlobal.RTCIceCandidate;
    var getSources = null;
    var getDestinations = null;
    var getUserMedia = null;
    var attachMediaStream = null;
    var attachUriStream = null;
    var reattachMediaStream = null;
    var webrtcSupported = false;

    var getStats = function() {};

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        getSources = _.bind(navigatorMediaDevicesEnumerateDevicesByTypeWrapper, null, 'input');
    }

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        getDestinations = _.bind(navigatorMediaDevicesEnumerateDevicesByTypeWrapper, null, 'output');
    }

    if ((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || envGlobal.getUserMedia) {
        getUserMedia = navigatorGetUserMedia;
    }

    switch (browser.browser) {
    case 'Firefox':
        log('Firefox detected', browser);

        attachMediaStream = attachStreamToElement;
        reattachMediaStream = reattachStreamToElement;
        getStats = function getPeerConnectionStats(pc, track, successCallback, errorCallback) {
            pc.getStats(track, _.bind(handleGetStatsSuccess, this, pc, successCallback), errorCallback);
        };

        webrtcSupported = true;

        break;
    case 'Opera':
        log('Opera detected', browser);

        attachMediaStream = attachStreamToElement;
        reattachMediaStream = reattachStreamToElement;
        getStats = function getPeerConnectionStats(pc, track, successCallback, errorCallback) {
            pc.getStats(_.bind(handleGetStatsSuccess, this, pc, successCallback), track, errorCallback);
        };

        webrtcSupported = true;

        break;
    case 'Chrome':
        log('Webkit detected', browser);

        attachMediaStream = attachStreamToElement;
        reattachMediaStream = reattachStreamToElement;
        getStats = function getPeerConnectionStats(pc, track, successCallback, errorCallback) {
            pc.getStats(_.bind(handleGetStatsSuccess, this, pc, successCallback), track, errorCallback);
        };

        webrtcSupported = true;

        break;
    case 'Edge':
        log('Edge detected', browser);

        attachMediaStream = attachStreamToElement;
        reattachMediaStream = reattachStreamToElement;
        getStats = function getPeerConnectionStats(pc, track, successCallback, errorCallback) {
            pc.getStats(track, _.bind(handleGetStatsSuccess, this, pc, successCallback), errorCallback);
        };

        webrtcSupported = true;

        break;
    case 'Safari':
        log('Safari detected', browser);

        attachMediaStream = function(element, stream, callback) {
            if (_.isObject(stream)) {
                element.__phenixHasPlayedWebRtc = true;
            }

            element = attachStreamToElement(element, stream, callback);

            return element;
        };
        attachUriStream = function(element, streamUri) {
            if (element.__phenixHasPlayedWebRtc) {
                element = (new PhenixVideo(element, streamUri, false)).getElement();
            } else {
                return attachUriStreamToElement(element, streamUri);
            }

            element.play();

            return element;
        };
        reattachMediaStream = reattachStreamToElement;
        getStats = function getPeerConnectionStats(pc, track, successCallback, errorCallback) {
            pc.getStats(track).then(_.bind(handleGetStatsSuccess, this, pc, successCallback), errorCallback);
        };

        webrtcSupported = true;

        break;
    case 'ReactNative':
        log('React Native detected', browser);

        attachMediaStream = function() {
            log('attachMediaStream not supported in React Native environment');
        };
        attachUriStream = function() {
            log('attachUriStream not supported in React Native environment');
        };
        reattachMediaStream = function() {
            log('reattachMediaStream not supported in React Native environment');
        };
        getStats = function getPeerConnectionStats(pc, track, successCallback, errorCallback) {
            pc.getStats(track).then(_.bind(handleGetStatsSuccess, this, pc, successCallback), errorCallback);
        };

        webrtcSupported = true;

        break;
    default:
        logWarn('Browser version does not appear to be WebRTC-capable', browser.browser, browser.version);

        break;
    }

    function navigatorGetUserMedia(constraints, successCallback, errorCallback) {
        var onSuccess = _.bind(handleGetUserMediaSuccess, this, constraints, successCallback, errorCallback);

        if (navigator && navigator.mediaDevices && _.isFunction(navigator.mediaDevices.getUserMedia)) {
            return navigator.mediaDevices.getUserMedia(constraints)
                .then(function(mediaStream) {
                    return onSuccess(mediaStream);
                }).catch(function(e) {
                    return errorCallback(e);
                });
        }

        if (navigator && _.isFunction(navigator.getUserMedia)) {
            return navigator.getUserMedia(constraints, onSuccess, errorCallback);
        }

        if (envGlobal && _.isFunction(envGlobal.getUserMedia)) {
            return envGlobal.getUserMedia(constraints, onSuccess, errorCallback);
        }
    }

    function handleGetUserMediaSuccess(constraints, successCallback, errorCallback, stream) {
        setTimeout(function() {
            var tracks = stream.getTracks();

            for (var i = 0; i < tracks.length; i++) {
                var track = tracks[i];

                track.onended = function(event) {
                    log(event.timeStamp, 'Track', track.id, track.label, 'ended');
                };

                log('Track', track.id, track.label, tracks[i].kind, 'readyState=', tracks[i].readyState);

                if (track.readyState === 'ended') {
                    return handleGetUserMediaUnavailable('User media not available', errorCallback, tracks);
                }
            }

            var requestedTrackCount = (constraints.audio ? 1 : 0) + (constraints.video ? 1 : 0);

            // Edge sometimes only gets a subset of tracks requested
            if (tracks.length !== requestedTrackCount) {
                return handleGetUserMediaUnavailable('Unable to get all requested user media.', errorCallback, tracks);
            }

            successCallback(stream);
        }, 100);
    }

    function handleGetUserMediaUnavailable(message, errorCallback, tracks) {
        try {
            var error = new Error(message);

            error.code = 'unavailable';

            errorCallback(error);
        } finally {
            stopAllTracks(tracks);
        }
    }

    function stopAllTracks(tracks) {
        for (var j = 0; j < tracks.length; j++) {
            tracks[j].stop();
        }
    }

    function navigatorMediaDevicesEnumerateDevicesByTypeWrapper(type, callback) {
        if (type !== 'input' && type !== 'output') {
            throw new Error('Unsupported device type ' + type);
        }

        if (!navigator.mediaDevices) {
            return;
        }

        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            var sources = [];

            devices.forEach(function(device) {
                if (device.kind === 'audio' + type) {
                    sources.push({
                        kind: 'audio',
                        id: device.deviceId,
                        label: device.label
                    });
                } else if (device.kind === 'video' + type) {
                    sources.push({
                        kind: 'video',
                        id: device.deviceId,
                        label: device.label
                    });
                }
            });

            callback(sources);
        });
    }

    function attachStreamToElement(element, stream, callback) {
        if (typeof element.srcObject !== 'undefined') {
            element.srcObject = stream;
        } else if (typeof element.mozSrcObject !== 'undefined') {
            element.mozSrcObject = stream;
        } else if (typeof element.src !== 'undefined') {
            element.src = URL.createObjectURL(stream);
        } else {
            log('Error attaching stream to element.');
        }

        var playPromise = element.play();

        if (playPromise === undefined) {
            if (typeof callback === 'function') {
                callback();
            }

            return element;
        }

        playPromise.then(function() {
            if (typeof callback === 'function') {
                callback();
            }
        }).catch(function(e) {
            log('Play() failed: ' + e);

            if (typeof callback === 'function') {
                callback(e);
            }
        });

        return element;
    }

    function attachUriStreamToElement(element, streamUri) {
        element.src = streamUri;

        element.play();

        return element;
    }

    function reattachStreamToElement(to, from) {
        to.src = from.src;

        return to;
    }

    function handleGetStatsSuccess(pc, successCallback, stats) {
        successCallback(normalizePeerConnectionStats(pc, stats));
    }

    function normalizePeerConnectionStats(pc, stats) {
        switch (browser.browser) {
        case 'Edge':
            stats.forEach(function(stat) {
                stat.mediaType = getMediaTypeByCodecFromSdp(pc, stat.codecId);
                stat.bytesSent = estimateBytesFromNumberOfPacketsAndMediaType(stat.packetsSent, stat.mediaType);
                stat.bytesReceived = estimateBytesFromNumberOfPacketsAndMediaType(stat.packetsReceived, stat.mediaType);
            });

            break;
        case 'Safari':
            stats.forEach(function(stat) {
                if (_.includes(stat.id.toLowerCase(), 'audio') && _.includes(stat.id.toLowerCase(), 'rtp')) {
                    stat.mediaType = 'audio';
                }

                if (_.includes(stat.id.toLowerCase(), 'video') && _.includes(stat.id.toLowerCase(), 'rtp')) {
                    stat.mediaType = 'video';
                }
            });

            break;
        default:
            break;
        }

        return stats;
    }

    function getMediaTypeByCodecFromSdp(peerConnection, codec) {
        if (!codec) {
            return;
        }

        var mediaType;

        findInSdpSections(peerConnection, function(section) {
            if (_.startsWith(section, 'video') && _.includes(section.toLowerCase(), codec.toLowerCase())) {
                mediaType = 'video';
            }

            if (_.startsWith(section, 'audio') && _.includes(section.toLowerCase(), codec.toLowerCase())) {
                mediaType = 'audio';
            }
        });

        return mediaType;
    }

    function findInSdpSections(peerConnection, callback) {
        var localSections = peerConnection.localDescription.sdp.split('m=');
        var remoteSections = peerConnection.remoteDescription.sdp.split('m=');

        if (localSections.length !== remoteSections.length) {
            return false;
        }

        return _.findIndex(localSections, function(section, index) {
            return callback(section, index, remoteSections);
        });
    }

    function estimateBytesFromNumberOfPacketsAndMediaType(packets, mediaType) {
        var packetsReceivedNum = parseInt(packets) || 0;

        if (mediaType === 'audio') {
            return packetsReceivedNum * 100;
        }

        if (mediaType === 'video') {
            return packetsReceivedNum * 1080;
        }
    }

    // ----------------------------------------

    var phenixRTC = {
        global: envGlobal,
        browser: browser.browser,
        browserVersion: browser.version,
        RTCPeerConnection: RTCPeerConnection,
        RTCSessionDescription: RTCSessionDescription,
        RTCIceCandidate: RTCIceCandidate,
        getSources: getSources,
        getDestinations: getDestinations,
        getUserMedia: getUserMedia,
        getStats: getStats,
        attachMediaStream: attachMediaStream,
        attachUriStream: attachUriStream || attachUriStreamToElement,
        reattachMediaStream: reattachMediaStream,
        webrtcSupported: webrtcSupported,
        PhenixFlashVideo: PhenixVideo
    };

    return phenixRTC;
});