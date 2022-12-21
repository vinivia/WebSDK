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
    'sdk/express/RoomExpress',
    'sdk/room/RoomService',
    '../../../../test/mock/HttpStubber',
    '../../../../test/mock/WebSocketStubber',
    '../../../../test/mock/PeerConnectionStubber',
    'sdk/room/Stream',
    'sdk/room/stream.json',
    'sdk/room/track.json'
], function(_, RoomExpress, RoomService, HttpStubber, WebSocketStubber, PeerConnectionStubber, Stream, memberStream, track) {
    describe('When Subscribing to a Member Stream', function() {
        var mockStreamId = 'mystreamId';
        var stream = {
            uri: Stream.getPCastPrefix() + mockStreamId,
            type: memberStream.types.user.name,
            audioState: track.states.trackEnabled.name,
            videoState: track.states.trackEnabled.name
        };

        var streamingAndRtmpToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoiZGVtbyIsImRpZ2VzdCI6InVqSlRBbitqWnVYUHBSQlJjWUF3YjNPaC9IN2p0eUQxdzR2L2c1WEt1U0I0TFN5NGZBbXlBek9uQkdmaVhhUjRYbWFpclZtY3BhSVpON1ZyN2NRVkZnPT0iLCJ0b2tlbiI6IntcImV4cGlyZXNcIjoxOTI5NjA5NjcwMjI1LFwiY2FwYWJpbGl0aWVzXCI6W1wic3RyZWFtaW5nXCIsXCJydG1wXCJdLFwicmVxdWlyZWRUYWdcIjpcInJvb21JZDpldXJvcGUtY2VudHJhbCNkZW1vI211bHRpcGFydHlDaGF0RGVtb1Jvb20uWnBxYko0bU5raDZ1XCJ9In0=';
        var realTimeToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoiZGVtbyIsImRpZ2VzdCI6IjgxNy84MU01aXg4WTZidEgrT3Q1bjlFblU1cXlLRHJHRWJ4dzFCTjZqS0Y5czIrejMzZmhtSDV2VjFqSTVtZXVxL1VKdTRTSTQ1VHJjQXByRS9xN2tnPT0iLCJ0b2tlbiI6IntcImV4cGlyZXNcIjoxOTI5NjA5NjcwMjI1LFwiY2FwYWJpbGl0aWVzXCI6W1wicmVhbC10aW1lXCJdLFwicmVxdWlyZWRUYWdcIjpcInJvb21JZDpldXJvcGUtY2VudHJhbCNkZW1vI211bHRpcGFydHlDaGF0RGVtb1Jvb20uWnBxYko0bU5raDZ1XCJ9In0=';
        var streamingToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoiZGVtbyIsImRpZ2VzdCI6IjBrNjRXcUJwU3UwYkJyYkF2QktJVng1WENPRysreTBVQThhM2dwNEFMeXJiR05BRHQ3dGttQ05aRlBYMXdiaTBTQ3N1MFBUdjVnVis4a2VtTVFOa09RPT0iLCJ0b2tlbiI6IntcImV4cGlyZXNcIjoxOTI5NjA5NjcwMjI1LFwiY2FwYWJpbGl0aWVzXCI6W1wic3RyZWFtaW5nXCJdLFwicmVxdWlyZWRUYWdcIjpcInJvb21JZDpldXJvcGUtY2VudHJhbCNkZW1vI211bHRpcGFydHlDaGF0RGVtb1Jvb20uWnBxYko0bU5raDZ1XCJ9In0=';
        var ondemandToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoiZGVtbyIsImRpZ2VzdCI6IkEvZmxzT1h4YXQ1NUpvYTNSYVY2VG5uZ0IvSEc1THdoMUZ1MHh0SkdkZWlCakJuVkk3clZVNWkvS1dnbGZHVms2VXlEZHNkSzhZekxiVk5tc1dWY2ZBPT0iLCJ0b2tlbiI6IntcImV4cGlyZXNcIjoxOTI5NjA5NjcwMjI1LFwiY2FwYWJpbGl0aWVzXCI6W1wib24tZGVtYW5kXCJdLFwicmVxdWlyZWRUYWdcIjpcInJvb21JZDpldXJvcGUtY2VudHJhbCNkZW1vI211bHRpcGFydHlDaGF0RGVtb1Jvb20uWnBxYko0bU5raDZ1XCJ9In0=';
        var rtmpToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoiZGVtbyIsImRpZ2VzdCI6IlZKaFhSNmUrN29xQTVpRm9XTVYyUjRTbmFjYnJRekJ5Skg4WEx0eHBpM2NBTFpyT2JYZlhTRVU2ZVlIaktiWGUwZEJ4em1RK2psUURKYVI1T1ROdDFnPT0iLCJ0b2tlbiI6IntcImV4cGlyZXNcIjoxOTI5NjA5NjcwMjI1LFwiY2FwYWJpbGl0aWVzXCI6W1wicnRtcFwiXSxcInJlcXVpcmVkVGFnXCI6XCJyb29tSWQ6ZXVyb3BlLWNlbnRyYWwjZGVtbyNtdWx0aXBhcnR5Q2hhdERlbW9Sb29tLlpwcWJKNG1Oa2g2dVwifSJ9';
        var audioOnlyToken = 'DIGEST:eyJhcHBsaWNhdGlvbklkIjoiZGVtbyIsImRpZ2VzdCI6IjZ3ODQ3S3N2ZFh5WjhRNnlyNWNzMnh0YjMxdFQ0TFR3bHAyeUZyZ0t2K0pDUEJyYkI4Qnd5a3dyT2NIWE52OXQ5eU5qYkFNT2tuQ1N1VnE5eGdBZjdRPT0iLCJ0b2tlbiI6IntcImV4cGlyZXNcIjoxOTI5NjA5NjcwMjI1LFwiY2FwYWJpbGl0aWVzXCI6W1wiYXVkaW8tb25seVwiXSxcInJlcXVpcmVkVGFnXCI6XCJyb29tSWQ6ZXVyb3BlLWNlbnRyYWwjZGVtbyNtdWx0aXBhcnR5Q2hhdERlbW9Sb29tLlpwcWJKNG1Oa2g2dVwifSJ9';

        var httpStubber;
        var websocketStubber;
        var peerConnectionStubber = new PeerConnectionStubber();

        beforeEach(function() {
            peerConnectionStubber.stub();

            httpStubber = new HttpStubber();
            httpStubber.stubAuthRequest();
            httpStubber.stubStreamRequest();

            websocketStubber = new WebSocketStubber();
            websocketStubber.stubAuthRequest();
            websocketStubber.stubSetupStream();
        });

        afterEach(function() {
            peerConnectionStubber.restore();
            httpStubber.restore();
            websocketStubber.restore();
        });

        describe('subscriber token capabilities includes more than 1 of [real-time | streaming | on-deman | rtmp]', function() {
            it('returns conflicting-capability', function(done) {
                var roomExpress = new RoomExpress({authToken: streamingAndRtmpToken});

                roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: streamingAndRtmpToken}, function(error, response) {
                    expect(error).to.not.exist;
                    expect(response).to.be.an('object');
                    expect(response.status).to.be.equal('conflicting-capability');
                    done();
                });
            });
        });

        describe('subscriber token capabilities includes real-time', function() {
            describe('browser supports real-time', function() {
                it('subscribes to real-time stream', function(done) {
                    var roomExpress = new RoomExpress({authToken: realTimeToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature === 'real-time';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: realTimeToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('ok');
                        expect(response.mediaStream).to.be.an('object');
                        expect(response.originStreamId).to.be.an('string');
                        done();
                    });
                });
            });
            describe('browser does not support real-time', function() {
                it('returns unsupported-features', function(done) {
                    var roomExpress = new RoomExpress({authToken: realTimeToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature !== 'real-time';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: realTimeToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('unsupported-features');
                        done();
                    });
                });
            });
        });

        describe('subscriber token capabilities includes streaming', function() {
            describe('browser supports [dash | hls]', function() {
                it('subscribes to streaming stream', function(done) {
                    var roomExpress = new RoomExpress({authToken: streamingToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature === 'dash' || feature === 'hls';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: streamingToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('ok');
                        expect(response.mediaStream).to.be.an('object');
                        expect(response.originStreamId).to.be.an('string');
                        done();
                    });
                });
            });
            describe('browser does not support [dash | hls]', function() {
                it('returns unsupported-features', function(done) {
                    var roomExpress = new RoomExpress({authToken: streamingToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature !== 'dash' && feature !== 'hls';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: streamingToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('unsupported-features');
                        done();
                    });
                });
            });
        });

        describe('subscriber token capabilities includes on-demand', function() {
            describe('browser supports [dash | hls]', function() {
                it('subscribes to on-demand stream', function(done) {
                    var roomExpress = new RoomExpress({authToken: ondemandToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature === 'dash' || feature === 'hls';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: ondemandToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('ok');
                        expect(response.mediaStream).to.be.an('object');
                        expect(response.originStreamId).to.be.an('string');
                        done();
                    });
                });
            });
            describe('browser does not support [dash | hls]', function() {
                it('returns unsupported-features', function(done) {
                    var roomExpress = new RoomExpress({authToken: ondemandToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature !== 'dash' && feature !== 'hls';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: ondemandToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('unsupported-features');
                        done();
                    });
                });
            });
        });

        describe('subscriber token capabilities includes rtmp', function() {
            describe('browser supports rtmp', function() {
                it('subscribes to rtmp stream', function(done) {
                    var roomExpress = new RoomExpress({authToken: rtmpToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature === 'rtmp';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: rtmpToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('ok');
                        expect(response.mediaStream).to.be.an('object');
                        expect(response.originStreamId).to.be.an('string');
                        done();
                    });
                });
            });
            describe('browser does not support rtmp', function() {
                it('returns unsupported-features', function(done) {
                    var roomExpress = new RoomExpress({authToken: rtmpToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature !== 'rtmp';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: rtmpToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('unsupported-features');
                        done();
                    });
                });
            });
        });

        describe('subscriber token capabilities do not include [real-time | streaming | on-demand | rtmp]', function() {
            describe('browser supports real-time', function() {
                it('subscribes to real-time stream', function(done) {
                    var roomExpress = new RoomExpress({authToken: audioOnlyToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature === 'real-time';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: audioOnlyToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('ok');
                        expect(response.mediaStream).to.be.an('object');
                        expect(response.originStreamId).to.be.an('string');
                        done();
                    });
                });
            });
            describe('browser does not support real-time', function() {
                it('returns unsupported-features', function(done) {
                    var roomExpress = new RoomExpress({authToken: audioOnlyToken});

                    roomExpress.getPCastExpress().getPCast().isFeatureSupported = function(feature) {
                        return feature !== 'real-time';
                    };

                    roomExpress.subscribeToMemberStream(new Stream(stream.uri, stream.type, stream.audioState, stream.videoState), {token: audioOnlyToken}, function(error, response) {
                        expect(error).to.not.exist;
                        expect(response).to.be.an('object');
                        expect(response.status).to.be.equal('unsupported-features');
                        done();
                    });
                });
            });
        });
    });
});