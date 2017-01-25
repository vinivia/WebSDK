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
    'sdk/observable/ObservableMonitor'
], function (Observable, ObservableMonitor) {
    describe('When instantiating an Observable Monitor', function () {
        var observable;
        var observableMonitor;
        var valueToObserve;

        beforeEach(function () {
            valueToObserve = {value: 'initialValue'};
            observable = new Observable();
            observableMonitor = new ObservableMonitor(observable);
        });

        it('Has property start which is a function', function () {
            expect(observableMonitor.start).to.be.a('function');
        });

        it('Has property stop which is a function', function () {
            expect(observableMonitor.stop).to.be.a('function');
        });

        describe('When monitoring for changes on object', function () {
            var newValue = 'newValue';

            beforeEach(function () {
                observableMonitor.start(function () {
                    return valueToObserve.value;
                }, 50)
            });

            afterEach(function () {
                observableMonitor.stop();
            });

            it('Modifying object value produces subscribe event', function (done) {
                observable.subscribe(function (value) {
                    expect(value).to.be.equal(newValue);

                    done();
                });

                valueToObserve.value = newValue;
            });

            it('Modifying object value when not running does not change observable value', function (done) {
                setTimeout(function () {
                    observableMonitor.stop();

                    valueToObserve.value = newValue;
                }, 51);

                setTimeout(function () {
                    expect(observable.getValue()).to.be.equal('initialValue');

                    done();
                }, 151);
            });
        });
    });
});