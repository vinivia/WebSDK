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
    'Long',
], function (_, Long) {
    describe('When utilizing LodashLight', function () {

        describe('When getting current time using now', function () {
            it('Has property now that is a function', function () {
                expect(_.now).to.be.a('function');
            });

            it('Returns integer', function () {
                expect(_.now()).to.be.a('number');
            });
        });

        describe('When getting iso timestamp as a string', function () {
            it('Has property isoString that is a function', function () {
                expect(_.isoString).to.be.a('function');
            });

            it('Returns integer', function () {
                expect(_.isoString()).to.be.a('string');
            });
        });

        describe('When padding a number with pad', function () {
            it('Has property pad that is a function', function () {
                expect(_.pad).to.be.a('function');
            });

            it('Returns string not padded when length matches order of magnitude', function () {
                expect(_.pad(10, 2)).to.be.equal('10');
            });

            it('Returns string not padded when length is greater than order of magnitude', function () {
                expect(_.pad(100, 2)).to.be.equal('100');
            });

            it('Returns string padded when length is less than order of magnitude', function () {
                expect(_.pad(1, 2)).to.be.equal('01');
            });

            it('Returns string padded when length is less than order of magnitude', function () {
                expect(_.pad(1, 3)).to.be.equal('001');
            });
        });

        describe('When iterating through objects properties using forOwn', function () {
            var myObject;
            var count;

            beforeEach(function () {
                myObject = {};
                count = 0;
            });

            it('Has property forOwn that is a function', function () {
                expect(_.forOwn).to.be.a('function');
            });

            it('Only user defined properties are iterated over', function () {
                myObject.mykeyOne = 'myvalue';
                myObject.mykeyTwo = 'myvalue';

                _.forOwn(myObject, function () {
                    count += 1;
                });

                expect(count).to.be.equal(2);
            });

            it('Callback arguments are the current key-value pair', function () {
                myObject.mykey = 'myvalue';

                _.forOwn(myObject, function (value, key) {
                    expect(value).to.be.equal('myvalue');
                    expect(key).to.be.equal('mykey');
                });
            });

            it('Expect items to be the same after forOwn is executed and no modification occurs', function () {
                myObject.mykey = 'myvalue';

                _.forOwn(myObject, function () {});

                expect(myObject.mykey).to.be.equal('myvalue');
            });
        });

        describe('When iterating through array items using forEach', function () {
            var myArray;

            beforeEach(function () {
                myArray = [];
            });

            it('Has property forEach that is a function', function () {
                expect(_.forEach).to.be.a('function');
            });

            it('Expect callback arguments to be item-index pairs', function () {
                myArray.push('newItem');

                _.forEach(myArray, function (item, index) {
                    expect(item).to.be.equal('newItem');
                    expect(index).to.be.equal(0);
                });
            });

            it('Expect callback to be executed 2 times for an array of size 2', function () {
                var count = 0;

                myArray.push('newItem');
                myArray.push('newItemTwo');

                _.forEach(myArray, function () {
                    count++;
                });

                expect(count).to.be.equal(2);
            });

            it('Expect items to be the same after forEach is executed and no modification occurs', function () {
                myArray.push('newItem');

                _.forEach(myArray, function (item, index) {});

                expect(myArray[0]).to.be.equal('newItem');
            });
        });

        describe('When mapping array items using map', function () {
            var myArray;

            beforeEach(function () {
                myArray = [];
            });

            it('Has property map that is a function', function () {
                expect(_.map).to.be.a('function');
            });

            it('Expect callback arguments to be item-index pairs', function () {
                myArray.push('newItem');
                myArray.push(true);

                var newArray = _.map(myArray, function (item) {
                    return item === true;
                });

                expect(newArray[0]).to.be.equal(false);
                expect(newArray[1]).to.be.equal(true);
            });

            it('Expect original array items to be the same after map is executed and no modification occurs', function () {
                myArray.push('newItem');

                _.map(myArray, function (item, index) { return false; });

                expect(myArray[0]).to.be.equal('newItem');
            });
        });

        describe('When checking a collection for an item using includes', function () {
            it('Has property includes that is a function', function () {
                expect(_.includes).to.be.a('function');
            });

            describe('When an array is passed in', function () {
                var myArray;

                beforeEach(function () {
                    myArray = ['value1','value2','value3'];
                });

                it('Returns true when item in collection', function () {
                    expect(_.includes(myArray, 'value2')).to.be.equal(true);
                });

                it('Returns false when item not in collection', function () {
                    expect(_.includes(myArray, 'value4')).to.be.equal(false);
                });

                it('Array is not modified by includes', function () {
                    _.includes(myArray, 'value4');

                    expect(myArray[0]).to.be.equal('value1');
                    expect(myArray[1]).to.be.equal('value2');
                    expect(myArray[2]).to.be.equal('value3');
                });
            });

            describe('When an object is passed in', function () {
                var myObject;

                beforeEach(function () {
                    myObject = {
                        key1: 'value1',
                        key2: 'value2',
                        key3: 'value3'
                    };
                });

                it('Returns true when item in collection', function () {
                    expect(_.includes(myObject, 'value2')).to.be.equal(true);
                });

                it('Returns false when item not in collection', function () {
                    expect(_.includes(myObject, 'value4')).to.be.equal(false);
                });

                it('Object is not modified by includes', function () {
                    _.includes(myObject, 'value4');

                    expect(myObject.key1).to.be.equal('value1');
                    expect(myObject.key2).to.be.equal('value2');
                    expect(myObject.key3).to.be.equal('value3');
                });
            });
        });

        describe('When reducing a collection using reduce', function () {
            it('Has property reduce that is a function', function () {
                expect(_.reduce).to.be.a('function');
            });

            describe('When an array is passed in', function () {
                var myArray;

                beforeEach(function () {
                    myArray = [1,2,3];
                });

                it('Returns single value when initial value passed in', function () {
                    expect(_.reduce(myArray,
                        function (sum, value) {
                            return sum + value;
                        }, 0)
                    ).to.be.equal(6);
                });

                it('Returns single value when initial value not passed in', function () {
                    expect(_.reduce(myArray,
                        function (sum, value) {
                            return value;
                        })
                    ).to.be.equal(3);
                });

                it('Array is not modified by reduce', function () {
                    _.reduce(myArray, function () {});

                    expect(myArray[0]).to.be.equal(1);
                    expect(myArray[1]).to.be.equal(2);
                    expect(myArray[2]).to.be.equal(3);
                });
            });

            describe('When an object is passed in', function () {
                var myObject;

                beforeEach(function () {
                    myObject = {
                        key1: 'value1',
                        key2: 'value1',
                        key3: 'value3'
                    };
                });

                it('Returns single object when new object passed in as initial value', function () {
                    var result = _.reduce(myObject,
                        function (result, value, key) {
                            (result[value] || (result[value] = [])).push(key);
                            return result;
                        }, {});

                    expect(result.value1[0]).to.be.equal('key1');
                    expect(result.value1[1]).to.be.equal('key2');
                    expect(result.value3[0]).to.be.equal('key3');
                });

                it('Object is not modified by reduce', function () {
                    _.includes(myObject, 'value4');

                    expect(myObject.key1).to.be.equal('value1');
                    expect(myObject.key2).to.be.equal('value1');
                    expect(myObject.key3).to.be.equal('value3');
                });
            });
        });

        describe('When finding array item using find', function () {
            var myArray;

            beforeEach(function () {
                myArray = [1, 2, 3];
            });

            it('Has property find that is a function', function () {
                expect(_.find).to.be.a('function');
            });

            it('Expect to return item that matches callback', function () {
                var item = _.find(myArray, function (val) {
                    return val === 2;
                });

                expect(item).to.be.equal(2);
            });

            it('Expect to return undefined when no matches to callback', function () {
                var item = _.find(myArray, function (val) {
                    return val === 4;
                });

                expect(item).to.be.undefined;
            });

            it('Expect to return item that matches callback after initial index', function () {
                var item = _.find(myArray, function (val) {
                    return val === 2;
                }, 1);

                expect(item).to.be.equal(2);
            });

            it('Expect to return undefined when no matches to callback after inital index', function () {
                var item = _.find(myArray, function (val) {
                    return val === 1;
                }, 1);

                expect(item).to.be.undefined;
            });
        });

        describe('When finding array item index using findIndex', function () {
            var myArray;

            beforeEach(function () {
                myArray = [1, 2, 3];
            });

            it('Has property findIndex that is a function', function () {
                expect(_.findIndex).to.be.a('function');
            });

            it('Expect to return item that matches callback', function () {
                var index = _.findIndex(myArray, function (val) {
                    return val === 2;
                });

                expect(index).to.be.equal(1);
            });

            it('Expect to return undefined when no matches to callback', function () {
                var index = _.findIndex(myArray, function (val) {
                    return val === 4;
                });

                expect(index).to.be.undefined;
            });

            it('Expect to return item that matches callback after initial index', function () {
                var index = _.findIndex(myArray, function (val) {
                    return val === 2;
                }, 1);

                expect(index).to.be.equal(1);
            });

            it('Expect to return undefined when no matches to callback after inital index', function () {
                var index = _.findIndex(myArray, function (val) {
                    return val === 1;
                }, 1);

                expect(index).to.be.undefined;
            });
        });

        describe('When filtering an array using filter', function () {
            var myArray;

            beforeEach(function () {
                myArray = [1, 2, 3];
            });

            it('Expect error to be thrown for object', function () {
                expect(function () {
                    _.filter({}, function () {});
                }).to.throw(Error);
            });

            it('Has property filter that is a function', function () {
                expect(_.filter).to.be.a('function');
            });

            it('Expect to return an array with one item for condition matching one item in collection', function () {
                var collection = _.filter(myArray, function (val) {
                    return val === 2;
                });

                expect(collection.length).to.be.equal(1);
                expect(collection[0]).to.be.equal(2);
            });

            it('Expect to return empty list when no matches to callback', function () {
                var collection = _.filter(myArray, function (val) {
                    return val === 5;
                });

                expect(collection.length).to.be.equal(0);
            });

            it('Expect to return list of same size when all match in callback', function () {
                var collection = _.filter(myArray, function (val) {
                    return typeof val === 'number';
                });

                expect(collection.length).to.be.equal(3);
            });
        });

        describe('When removing items from an array using remove', function () {
            var myArray;

            beforeEach(function () {
                myArray = [1, 2, 3];
            });

            it('Has property remove that is a function', function () {
                expect(_.remove).to.be.a('function');
            });

            it('Expect to return an array with one item for condition matching one item in collection', function () {
                var collection = _.remove(myArray, function (val) {
                    return val === 2;
                });

                expect(collection.length).to.be.equal(2);
                expect(collection[0]).to.be.equal(1);
                expect(collection[1]).to.be.equal(3);
            });

            it('Expect to return full list when no matches to callback', function () {
                var collection = _.remove(myArray, function (val) {
                    return val === 5;
                });

                expect(collection.length).to.be.equal(3);
            });

            it('Expect to return empty list when all match in callback', function () {
                var collection = _.remove(myArray, function (val) {
                    return typeof val === 'number';
                });

                expect(collection.length).to.be.equal(0);
            });
        });

        describe('When getting a random item from an array using sample', function () {
            it('Has property sample that is a function', function () {
                expect(_.sample).to.be.a('function');
            });

            it('Expect to return int item that matches callback', function () {
                var myArray = [1, 2, 3];
                var randomItem = _.sample(myArray);

                expect(_.includes(myArray, randomItem)).to.be.equal(true);
            });

            it('Expect to return string item that matches callback', function () {
                var myArray = ['value1', 'value2'];
                var randomItem = _.sample(myArray);

                expect(_.includes(myArray, randomItem)).to.be.equal(true);
            });
        });

        describe('When freezing an Object using freeze', function () {
            it('Has property freeze that is a function', function () {
                expect(_.freeze).to.be.a('function');
            });

            it('Expect frozen object to be immutable - value cannot change', function () {
                var myObject = { key: 'value' };
                _.freeze(myObject);

                myObject.key = 'newValue';

                expect(myObject.key).to.be.equal('value');
            });

            it('Expect frozen object to be immutable - new property cannot be added', function () {
                var myObject = { key: 'value' };
                _.freeze(myObject);

                myObject.newKey = 'newValue';

                expect(myObject.newKey).to.be.undefined;
            });

            it('Expect frozen object to be immutable - property cannot be deleted', function () {
                var myObject = { key: 'value' };
                _.freeze(myObject);

                delete myObject.key;

                expect(myObject.key).to.be.equal('value');
            });

            it('Expect frozen array to be immutable - values cannot change', function () {
                var myArray = [5];
                _.freeze(myArray);

                myArray[0] = 10;

                expect(myArray[0]).to.be.equal(5);
            });

            it('Expect frozen array to be immutable - push throws an error', function () {
                var myArray = [5];
                _.freeze(myArray);

                expect(function () {
                    myArray.push(10);
                }).to.throw(Error);
            });

            it('Expect frozen array to be immutable - pop throws an error', function () {
                var myArray = [5];
                _.freeze(myArray);

                expect(function () {
                    myArray.pop();
                }).to.throw(Error);
            });
        });

        describe('When using noop', function () {
            it('has property noop', function () {
                expect(_.noop).to.be.a('function');
            });

            it('Expect to return undefined when no arguments passed in', function () {
                expect(_.noop()).to.be.undefined;
            });

            it('Expect to return undefined when arguments passed in', function () {
                expect(_.noop({}, 'value4')).to.be.undefined;
            });
        });

        describe('When comparing collections using findDifferences', function () {
            it('Has property remove that is a function', function () {
                expect(_.findDifferences).to.be.a('function');
            });

            it('Expect object and array comparison throws an error', function () {
                expect(function () {
                    _.findDifferences({}, []);
                }).to.throw(Error);
            });

            it('Expect string and string comparison throws an error', function () {
                expect(function () {
                    _.findDifferences('', '');
                }).to.throw(Error);
            });

            describe('When comparing two objects', function () {
                var myObject1;
                var myObject2;

                beforeEach(function () {
                    myObject1 = { name: 'hello', id: '123'};
                    myObject2 = { name: 'hello', id: '123'};
                });

                it('Expect to return an array with no items when two empty objects passed in', function () {
                    var differences = _.findDifferences({}, {});

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return an array with no items when no differences', function () {
                    var differences = _.findDifferences(myObject1, myObject2);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return an array with no items when same item passed in for both', function () {
                    var differences = _.findDifferences(myObject1, myObject1);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return array with one item of key of id when ids are different', function () {
                    var differences = _.findDifferences(myObject1, { name: 'hello', id: '125'});

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('id');
                });

                it('Expect to return one item when properties are objects that have the same properties and values', function () {
                    var differences = _.findDifferences({ name: {id:'1'}}, { name: {id:'1'}});

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('name');
                });

                it('Expect to return no items when properties are objects that have the same properties and values when deep is true', function () {
                    var differences = _.findDifferences({ name: {id:'1'}}, { name: {id:'1'}}, true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return no items when properties are objects that have the same properties and values when deep is true', function () {
                    var differences = _.findDifferences({ name: {id:{value:'1'}}}, { name: {id:{value:'1'}}}, true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return one item when property is array that have the same values and values when deep is false', function () {
                    var differences = _.findDifferences({ name: {ids:[1,2,3]}}, { name: {ids:[1,2,3]}}, false);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('name');
                });

                it('Expect to return no items when property is array that have the same values and values when deep is true', function () {
                    var differences = _.findDifferences({ name: {ids:[1,2,3]}}, { name: {ids:[1,2,3]}}, true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return no items when property is array of identical objects when deep is true', function () {
                    var differences = _.findDifferences({ names: [{ids:'123'}]}, { names: [{ids:'123'}]}, true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return one item when property is array of objects with different values when deep is true', function () {
                    var differences = _.findDifferences({ names: [{ids:'123'}]}, { names: [{ids:'125'}]}, true);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('names');
                });

                it('Expect to return one item when one property is array of objects and the other object has property of empty array when deep is true', function () {
                    var differences = _.findDifferences({ names: [{ids:'123'}]}, { names: []}, true);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('names');
                });

                it('Expect to return one item when one one object does not have the other objects property when deep is false', function () {
                    var differences = _.findDifferences({ names: [{ids:'123'}]}, {}, false);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('names');
                });

                it('Expect to return one item when one one object does not have the other objects property when deep is false', function () {
                    var differences = _.findDifferences({}, { names: [{ids:'123'}]}, false);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal('names');
                });
            });
            describe('When comparing two arrays', function () {
                var myArray1;
                var myArray2;

                beforeEach(function () {
                    myArray1 = [ 'hello', '123' ];
                    myArray2 = [ 'hello', '123' ];
                });

                it('Expect to return an array with no items when two empty arrays passed in', function () {
                    var differences = _.findDifferences([], []);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return an array with no items when no differences', function () {
                    var differences = _.findDifferences(myArray1, myArray2);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return an array with no items when same item passed in for both', function () {
                    var differences = _.findDifferences(myArray1, myArray1);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return array with one item of key of id when ids are different', function () {
                    var differences = _.findDifferences(myArray1, [ 'hello', '125' ]);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal(1);
                });

                it('Expect to return one item when empty array of array passed in', function () {
                    var differences = _.findDifferences([[]], [[]]);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal(0);
                });

                it('Expect to return no items when empty array of array passed in with deep property true', function () {
                    var differences = _.findDifferences([[]], [[]], true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return no items when empty array of array of array passed in with deep property true', function () {
                    var differences = _.findDifferences([[[]]], [[[]]], true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return one item when empty array of array passed in with deep property false', function () {
                    var differences = _.findDifferences([{name: 'hello'}], [{name: 'hello'}], false);

                    expect(differences.length).to.be.equal(1);
                });

                it('Expect to return no items when empty array of array passed in with deep property true', function () {
                    var differences = _.findDifferences([{name: 'hello'}], [{name: 'hello'}], true);

                    expect(differences.length).to.be.equal(0);
                });

                it('Expect to return one item when empty array passed in against array with one item', function () {
                    var differences = _.findDifferences([], [123], false);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal(0);
                });

                it('Expect to return one item when empty array passed in against array with one item', function () {
                    var differences = _.findDifferences([123], [], false);

                    expect(differences.length).to.be.equal(1);
                    expect(differences[0]).to.be.equal(0);
                });
            });
        });
        describe('When binding context to a function', function () {
            var contextA = { myVal: 'contextA' };
            var contextB = { myVal: 'contextB' };
            var exposeContextAndArguments;

            beforeEach(function() {
                exposeContextAndArguments = function () {
                    return [this, arguments];
                }
            });

            it('Has property bind that is a function', function () {
                expect(_.bind).to.be.a('function');
            });

            it('Returns function with new context attached', function () {
                var exposedContext = _.bind(exposeContextAndArguments, contextA)()[0];

                expect(exposedContext.myVal).to.be.equal(contextA.myVal);
            });

            it('Returns function with new context and argument attached', function () {
                var boundFunction = _.bind(exposeContextAndArguments, contextA, 'First Argument');

                var exposedArguments = boundFunction()[1];

                expect(exposedArguments[0]).to.be.equal('First Argument');
                expect(exposedArguments[1]).to.be.undefined;
            });

            it('Returns function with new context and argument attached with additional arguments passed into function call', function () {
                var boundFunction = _.bind(exposeContextAndArguments, contextA, 'First Argument');

                var exposedArguments = boundFunction('Second Argument')[1];

                expect(exposedArguments[0]).to.be.equal('First Argument');
                expect(exposedArguments[1]).to.be.equal('Second Argument');
            });

            it('Returns function with new context and argument attached when argument passed into function', function () {
                var boundFunction = _.bind(exposeContextAndArguments, contextA);

                var exposedArguments = boundFunction('First Argument')[1];

                expect(exposedArguments[0]).to.be.equal('First Argument');
                expect(exposedArguments[1]).to.be.undefined;
            });
        });

        describe('When validating argument is an object', function () {
            it('Has property now that is a function', function () {
                expect(_.isObject).to.be.a('function');
            });

            it('Expect to return false when null is passed in', function () {
                expect(_.isObject(null)).to.not.be.true;
            });

            it('Expect to return false when a string is passed in', function () {
                expect(_.isObject('')).to.not.be.true;
            });

            it('Expect to return false when undefined is passed in', function () {
                expect(_.isObject(undefined)).to.not.be.true;
            });

            it('Expect to return false when a number is passed in', function () {
                expect(_.isObject(123)).to.not.be.true;
            });

            it('Expect to return false when a function is passed in', function () {
                expect(_.isObject(function () {})).to.not.be.true;
            });

            it('Expect to return true when an object is passed in', function () {
                expect(_.isObject({})).to.be.true;
            });
        });

        describe('When validating argument is an array', function () {
            it('Has property now that is a function', function () {
                expect(_.isArray).to.be.a('function');
            });

            it('Expect to return false when null is passed in', function () {
                expect(_.isArray(null)).to.not.be.true;
            });

            it('Expect to return false when a string is passed in', function () {
                expect(_.isArray('')).to.not.be.true;
            });

            it('Expect to return false when undefined is passed in', function () {
                expect(_.isArray(undefined)).to.not.be.true;
            });

            it('Expect to return false when a number is passed in', function () {
                expect(_.isArray(1234)).to.not.be.true;
            });

            it('Expect to return false when an object is passed in', function () {
                expect(_.isArray({})).to.not.be.true;
            });

            it('Expect to return false when a function is passed in', function () {
                expect(_.isArray(function () {})).to.not.be.true;
            });

            it('Expect to return true when an array is passed in', function () {
                expect(_.isArray([])).to.be.true;
            });
        });

        describe('When validating argument is a string', function () {
            it('Has property now that is a function', function () {
                expect(_.isString).to.be.a('function');
            });

            it('Expect to return false when null is passed in', function () {
                expect(_.isString(null)).to.not.be.true;
            });

            it('Expect to return false when undefined is passed in', function () {
                expect(_.isString(undefined)).to.not.be.true;
            });

            it('Expect to return false when a number is passed in', function () {
                expect(_.isString(1234)).to.not.be.true;
            });

            it('Expect to return false when an object is passed in', function () {
                expect(_.isString({})).to.not.be.true;
            });

            it('Expect to return false when an array is passed in', function () {
                expect(_.isString([])).to.not.be.true;
            });

            it('Expect to return false when a function is passed in', function () {
                expect(_.isString(function () {})).to.not.be.true;
            });

            it('Expect to return true when a string is passed in', function () {
                expect(_.isString('')).to.be.true;
            });
        });

        describe('When validating argument is a number', function () {
            it('Has property now that is a function', function () {
                expect(_.isNumber).to.be.a('function');
            });

            it('Expect to return false when null is passed in', function () {
                expect(_.isNumber(null)).to.not.be.true;
            });

            it('Expect to return false when undefined is passed in', function () {
                expect(_.isNumber(undefined)).to.not.be.true;
            });

            it('Expect to return false when a string is passed in', function () {
                expect(_.isNumber('')).to.not.be.true;
            });

            it('Expect to return false when an object is passed in', function () {
                expect(_.isNumber({})).to.not.be.true;
            });

            it('Expect to return false when an array is passed in', function () {
                expect(_.isNumber([])).to.not.be.true;
            });

            it('Expect to return false when NaN is passed in', function () {
                expect(_.isNumber(NaN)).to.not.be.true;
            });

            it('Expect to return false when a Function is passed in', function () {
                expect(_.isNumber(function () {})).to.not.be.true;
            });

            it('Expect to return true when a number is passed in', function () {
                expect(_.isNumber(1234)).to.be.true;
            });
            it('Expect to return true when a floating point number is passed in', function () {
                expect(_.isNumber(1234.1234)).to.be.true;
            });
        });

        describe('When validating argument is a function', function () {
            it('Has property now that is a function', function () {
                expect(_.isFunction).to.be.a('function');
            });

            it('Expect to return false when null is passed in', function () {
                expect(_.isFunction(null)).to.not.be.true;
            });

            it('Expect to return false when undefined is passed in', function () {
                expect(_.isFunction(undefined)).to.not.be.true;
            });

            it('Expect to return false when a string is passed in', function () {
                expect(_.isFunction('')).to.not.be.true;
            });

            it('Expect to return false when an object is passed in', function () {
                expect(_.isFunction({})).to.not.be.true;
            });

            it('Expect to return false when an array is passed in', function () {
                expect(_.isFunction([])).to.not.be.true;
            });

            it('Expect to return false when NaN is passed in', function () {
                expect(_.isFunction(NaN)).to.not.be.true;
            });

            it('Expect to return false when a number is passed in', function () {
                expect(_.isFunction(1234)).to.not.be.true;
            });

            it('Expect to return true when a function is passed in', function () {
                expect(_.isFunction(function () {})).to.be.true;
            });
        });

        describe('When converting value to utc', function () {
            it('Has property utc that is a function', function () {
                expect(_.utc).to.be.a('function');
            });

            it('Expect to return NaN when null is passed in', function () {
                expect(_.utc(null)).to.be.nan;
            });

            it('Expect to return NaN when NaN is passed in', function () {
                expect(_.utc(NaN)).to.be.nan;
            });

            it('Expect to return a Number when a number is passed in', function () {
                expect(_.utc(1234)).to.be.equal(1234);
            });

            it('Expect to return a number when utc datetime is passed in', function () {
                expect(_.utc(_.now())).to.be.number;
            });

            it('Expect to successfully convert Long datetime to utc datetime', function () {
                expect(_.utc(Long.fromNumber(1488469432437))).to.be.equal(1488469432437);
            });
        });

        describe('When converting to string', function () {
            it('Has property toString that is a function', function () {
                expect(_.toString).to.be.a('function');
            });

            it('Expect object to be converted to string', function () {
                var myObject = { key: 'value' };

                expect(_.toString(myObject)).to.be.equal('[object Object]{"key":"value"}');
            });

            it('Expect array to be converted to string', function () {
                expect(_.toString([1,2,3])).to.be.equal('1,2,3');
            });

            it('Expect number to be converted to string', function () {
                expect(_.toString(4)).to.be.equal('4');
            });

            it('Expect string to be converted to string', function () {
                expect(_.toString('string')).to.be.equal('string');
            });

            it('Expect boolean to be converted to string', function () {
                expect(_.toString(true)).to.be.equal('true');
            });

            it('Expect undefined to be converted to string', function () {
                expect(_.toString(undefined)).to.be.equal('');
            });

            it('Expect null to be converted to string', function () {
                expect(_.toString(null)).to.be.equal('');
            });

            it('Expect Error to be converted to string', function () {
                expect(_.toString(new Error('My Error'))).to.be.equal('Error: My Error');
            });
        });
    });
});