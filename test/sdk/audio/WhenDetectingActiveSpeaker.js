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
    'sdk/audio/AudioSpeakerDetector',
    'phenix-rtc'
], function (AudioSpeakerDetector, rtc) {
    describe('When Detecting Active Speaker on WebRTC Supported Browser', function () {
        var audioSpeakerDetector;

        before(function () {
            if (!rtc.webrtcSupported) {
                this.skip();
            }
        });

        beforeEach(function () {
            var streams = [new MediaStream()];

            audioSpeakerDetector = new AudioSpeakerDetector(streams);
        });

        afterEach(function() {
            audioSpeakerDetector.dispose();
        });

        it('Has property onValue that is a function', function () {
            expect(audioSpeakerDetector.start).to.be.a('function');
        });

        it('Has property startDetection that is a function', function () {
            expect(audioSpeakerDetector.stop).to.be.a('function');
        });

        it('Expect start to not throw an error', function () {
            expect(function () {
                audioSpeakerDetector.start({}, function() {});
            }).to.not.throw();
        });

        it('Expect stop to not throw an error', function () {
            expect(function () {
                audioSpeakerDetector.stop();
            }).to.not.throw();
        });
    });
});