/**
 * Copyright 2018 PhenixP2P Inc. All Rights Reserved.
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
define(['phenix-web-lodash-light'], function(_) {
    'use strict';

    // TODO(dy) wrap PC in this class
    function PeerConnection() {

    }

    PeerConnection.convertPeerConnectionStats = function(stats, lastStats) {
        return convertPeerConnectionStats(stats, lastStats);
    };

    function convertPeerConnectionStats(stats, lastStats) {
        if (!stats) {
            return null;
        }

        var newStats = [];

        var convertStats = function convertStats(ssrc, mediaType, timestamp, bytesSent, bytesReceived, direction) {
            if (ssrc) {
                if (!_.hasIndexOrKey(lastStats, ssrc)) {
                    lastStats[ssrc] = {timestamp: 0};
                }

                var timeDelta = parseFloat(timestamp) - lastStats[ssrc].timestamp;
                var up = calculateUploadRate(parseFloat(bytesSent), lastStats[ssrc].bytesSent, timeDelta);
                var down = calculateDownloadRate(parseFloat(bytesReceived), lastStats[ssrc].bytesReceived, timeDelta);

                lastStats[ssrc].bytesSent = parseFloat(bytesSent);
                lastStats[ssrc].bytesReceived = parseFloat(bytesReceived);
                lastStats[ssrc].timestamp = parseFloat(timestamp);

                newStats.push({
                    uploadRate: up,
                    downloadRate: down,
                    mediaType: mediaType,
                    ssrc: ssrc,
                    direction: direction
                });
            }
        };

        if (_.isFunction(stats.result)) {
            _.forEach(stats.result(), function(statsReport) {
                if (statsReport.type === 'ssrc') {
                    var ssrc = statsReport.stat('ssrc');
                    var bytesSent = statsReport.stat('bytesSent');
                    var bytesReceived = statsReport.stat('bytesReceived');
                    var mediaType = statsReport.stat('mediaType');
                    var timestamp = statsReport.timestamp.getTime();
                    var direction = statsReport.id.indexOf('send') > -1 ? 'upload' : 'download';

                    convertStats(ssrc, mediaType, timestamp, bytesSent, bytesReceived, direction);
                }
            });
        } else if (_.isFunction(stats.values)) {
            _.forEach(Array.from(stats.values()), function(statsReport) {
                if (_.hasIndexOrKey(statsReport, 'ssrc')) {
                    if (!statsReport.ssrc || _.includes(statsReport.id, 'rtcp')) {
                        return;
                    }

                    var direction = statsReport.type.indexOf('outbound') > -1 ? 'upload' : 'download';

                    convertStats(statsReport.ssrc, statsReport.mediaType, statsReport.timestamp, statsReport.bytesSent, statsReport.bytesReceived, direction);
                }
            });
        } else {
            _.forEach(stats, function(statsReport) {
                if (_.hasIndexOrKey(statsReport, 'ssrc')) {
                    if (!statsReport.ssrc || _.includes(statsReport.id, 'rtcp')) {
                        return;
                    }

                    var direction = statsReport.type.indexOf('outbound') > -1 ? 'upload' : 'download';

                    convertStats(statsReport.ssrc, statsReport.mediaType, statsReport.timestamp, statsReport.bytesSent, statsReport.bytesReceived, direction);
                }
            });
        }

        return newStats;
    }

    function calculateUploadRate(bytesSent, prevBytesSent, timeDelta) {
        if (bytesSent) {
            var bytesSentBefore = prevBytesSent || 0;
            var bps = 8 * 1000 * (bytesSent - bytesSentBefore) / timeDelta;

            return Math.round(bps / 1000);
        }

        return 0;
    }

    function calculateDownloadRate(bytesReceived, prevBytesReceived, timeDelta) {
        if (bytesReceived) {
            var bytesReceivedBefore = prevBytesReceived || 0;
            var bps = 8 * 1000 * (bytesReceived - bytesReceivedBefore) / timeDelta;

            return Math.round(bps / 1000);
        }

        return 0;
    }

    return PeerConnection;
});