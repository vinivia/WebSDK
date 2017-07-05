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
    'sdk/LodashLight',
    'sdk/observable/Observable'
], function (_, Observable) {
    describe('When instantiating an Observable', function () {
        var value = 'observableValue';
        var subscriptionTimeout = 100;
        var observable;

        beforeEach(function () {
            observable = new Observable(value);
        });

        it('Returns object that has a getValue function', function () {
            expect(observable.getValue).to.be.a('function');
        });

        it('Returns object that has a setValue function', function () {
            expect(observable.setValue).to.be.a('function');
        });

        it('Returns object that has a subscribe function', function () {
            expect(observable.subscribe).to.be.a('function');
        });

        it('Returns object from subscribe call that has a dispose function', function () {
            expect(observable.subscribe(function () {}).dispose).to.be.a('function');
        });

        describe('When Observable has beforeChange function', function () {
            it('Expects beforeChange to be triggered on initialization of observable', function () {
                var beforeChange = function (value) {
                    expect(value).to.be.equal('initialValue');
                };

                new Observable('initialValue', beforeChange);
            });

            it('Expects beforeChange to be triggered before subscription callback', function (done) {
                var count = 0;

                var beforeChange = function () {
                    count++;
                };

                var subscriptionCallback = function () {
                    expect(count).to.be.equal(2);
                    done();
                };

                var obs = new Observable('initialValue', beforeChange);

                obs.subscribe(subscriptionCallback);

                obs.setValue('newValue');
            });
        });

        describe('When subscribing to an Observable', function () {
            var newValue1 = 'newObservableValue1';
            var newValue2 = 'newObservableValue2';

            it('Triggers subscription callback when observable changes', function (done) {
                observable.subscribe(function (changedValue) {
                    expect(changedValue).to.be.equal(newValue1);
                    done();
                });
                observable.setValue(newValue1);
            });

            it('Triggers subscription callback when inital notify option is set', function (done) {
                observable.subscribe(function (changedValue) {
                    expect(changedValue).to.be.equal(value);
                    done();
                }, {initial: 'notify'});
            });

            it('Triggers subscription callback when value changed externally when Listening for Changes', function (done) {
                var myValue;

                var subscription = observable.subscribe(function (changedValue) {
                    expect(changedValue).to.be.equal('newValue');
                    subscription.dispose();
                    done();
                }, {
                    listenForChanges: {
                        callback: function () {
                            return myValue;
                        },
                        timeout: 300
                    }
                });

                myValue = 'newValue';
            });

            it('Triggers a single subscription callback when observable changes twice within 100 milliseconds', function (done) {
                var count = 0;

                observable.subscribe(function (updatedValue) {
                    count++;
                    expect(updatedValue).to.be.equal(newValue2);
                    setTimeout(function () {
                        expect(count).to.be.equal(1);
                        done();
                    }, subscriptionTimeout);
                });
                observable.setValue(newValue1);
                observable.setValue(newValue2);
            });

            it('Triggers two subscription callbacks when observable changes once and then again after 100 milliseconds', function (done) {
                var count = 0;

                observable.subscribe(function (updatedValue) {
                    count++;

                    if (count === 1) {
                        expect(updatedValue).to.be.equal(newValue1);
                    }

                    if (count === 2) {
                        expect(updatedValue).to.be.equal(newValue2);
                    }

                    setTimeout(function () {
                        expect(count).to.be.equal(2);
                        done();
                    }, subscriptionTimeout * 1.5);
                });

                observable.setValue(newValue1);

                setTimeout(function () {
                    observable.setValue(newValue2);
                }, subscriptionTimeout + 1);
            });

            it('Triggers no subscription callbacks when observable subscription is disposed and then the observable changes', function (done) {
                var count = 0;

                var subscription = observable.subscribe(function () {
                    count++;
                });

                subscription.dispose();
                observable.setValue(newValue1);

                setTimeout(function () {
                    expect(count).to.be.equal(0);
                    done();
                }, subscriptionTimeout + 1);
            });

            describe('When Observable has multiple subscriptions (two)', function () {
                it('Triggers one callback per subscription for a single change', function (done) {
                    var count = 0;

                    observable.subscribe(function () {
                        count++;
                    });
                    observable.subscribe(function () {
                        count++;
                    });

                    observable.setValue(newValue1);

                    setTimeout(function () {
                        expect(count).to.be.equal(2);
                        done();
                    }, subscriptionTimeout + 1);
                });

                it('Triggers no callback per subscription for a single change when all have been disposed', function (done) {
                    var count = 0;

                    var subscriptionOne = observable.subscribe(function () {
                        count++;
                    });
                    var subscriptionTwo = observable.subscribe(function () {
                        count++;
                    });

                    subscriptionOne.dispose();
                    subscriptionTwo.dispose();

                    observable.setValue(newValue1);

                    setTimeout(function () {
                        expect(count).to.be.equal(0);
                        done();
                    }, subscriptionTimeout + 1);
                });
            });

            describe('When Observable has extension', function () {
                beforeEach(function () {
                    subscriptionTimeout = 50;
                });

                it('Trigger callback after timeout wait triggered by first change for notifyAtFixedRate', function (done) {
                    observable.extend({
                        method: 'notifyAtFixedRate',
                        timeout: subscriptionTimeout
                    });

                    observable.subscribe(function () {
                        var timeElapsedSinceFirstChange = triggerTime - _.now();
                        expect(timeElapsedSinceFirstChange).to.be.below(subscriptionTimeout * 1.5);
                        done();
                    });

                    var triggerTime = _.now();
                    observable.setValue(newValue1);

                    setTimeout(function () {
                        observable.setValue(newValue2);
                    }, subscriptionTimeout / 2);
                });

                it('Method notifyWhenChangesStop - Two changes within timeout window increase timeout window by time elapsed', function (done) {
                    observable.extend({
                        method: 'notifyWhenChangesStop',
                        timeout: subscriptionTimeout
                    });

                    observable.subscribe(function () {
                        var timeElapsedSinceFirstChange = _.now() - triggerTime;
                        expect(timeElapsedSinceFirstChange).to.be.at.least(subscriptionTimeout * 1.5);
                        done();
                    });

                    var triggerTime = _.now();
                    observable.setValue(newValue1);

                    setTimeout(function () {
                        observable.setValue(newValue2);
                    }, subscriptionTimeout / 2);
                });
            });
        });
    });
});