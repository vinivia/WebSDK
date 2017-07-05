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
    'sdk/observable/ObservableArray'
], function (ObservableArray) {
    describe('When instantiating an ObservableArray', function () {
        var value = ['arrayValue1'];
        var emptyArray = [];
        var observableArray;

        beforeEach(function () {
            observableArray = new ObservableArray(value);
        });

        it('Returns observable of an array', function () {
            expect(observableArray.getValue()).to.be.a('array');
        });

        it('Has property extend which is a function', function () {
            expect(observableArray.extend).to.be.a('function');
        });

        describe('When modifying observable array', function () {
            var newValue1 = 'newArrayValue1';

            it('Push does not modify original array', function () {
                observableArray.push(newValue1);
                expect(value).to.be.deep.equal([value[0]]);
            });

            it('Push adds an item to the end of the array', function () {
                observableArray.push(newValue1);
                expect(observableArray.getValue()).to.be.deep.equal([value[0], newValue1]);
            });

            it('Pop removes and returns the top item in the array', function () {
                expect(observableArray.pop()).to.be.equal(value[0]);
                expect(observableArray.getValue()).to.be.deep.equal(emptyArray);
            });

            it('Remove returns item of matching value and removes it from the array', function () {
                observableArray.push(newValue1);
                expect(observableArray.remove(value[0])).to.be.deep.equal(value);
                expect(observableArray.getValue()).to.be.deep.equal([ newValue1 ]);
            });

            it('Remove returns all items matching input function and removes them from the array', function () {
                observableArray.push(newValue1);

                var arrayAfterPush = [value[0], newValue1];
                var allArrayValues = observableArray.remove(function () {
                    return true;
                });
                expect(allArrayValues).to.be.deep.equal(arrayAfterPush);
                expect(observableArray.getValue()).to.be.deep.equal(emptyArray);
            });

            it('RemoveAll returns all items in the array and removes them', function () {
                observableArray.push(newValue1);

                var arrayAfterPush = [value[0], newValue1];
                var allArrayValues = observableArray.removeAll();
                expect(allArrayValues).to.be.deep.equal(arrayAfterPush);
                expect(observableArray.getValue()).to.be.deep.equal(emptyArray);
            });
        });

        describe('When subscribing to an Observable', function () {
            it('Triggers subscription callback when observable array has value pushed to it', function (done) {
                var newValue1 = 'newObservableValue1';

                observableArray.subscribe(function (changedValue) {
                    expect(changedValue).to.be.deep.equal([value[0], newValue1]);
                    done();
                });
                observableArray.push(newValue1);
            });

            it('Triggers subscription callback when observable array has value popped', function (done) {
                observableArray.subscribe(function (changedValue) {
                    expect(changedValue).to.be.deep.equal(emptyArray);
                    done();
                });
                observableArray.pop();
            });

            it('Triggers subscription callback when observable array has value removed', function (done) {
                observableArray.subscribe(function (changedValue) {
                    expect(changedValue).to.be.deep.equal(emptyArray);
                    done();
                });
                observableArray.remove(function () {
                    return true;
                });
            });

            it('Does not trigger subscription callback when nothing removed', function (done) {
                var count = 0;
                observableArray.subscribe(function () {
                    count++;
                });
                observableArray.remove(function () {
                    return false;
                });
                setTimeout(function () {
                    expect(count).to.be.equal(0);
                    done();
                });
            });

            it('Triggers subscription callback when observable array removeAll called', function (done) {
                observableArray.subscribe(function (changedValue) {
                    expect(changedValue).to.be.deep.equal(emptyArray);
                    done();
                });
                observableArray.removeAll();
            });
        });
    });
});