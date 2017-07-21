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
    'sdk/assert'
], function (assert) {
    describe('When Asserting Types with Assert', function () {
        describe('When asserting argument is an object', function () {
            it('Has property isObject that is a function', function () {
                expect(assert.isObject).to.be.a('function');
            });

            it('Error thrown on string', function () {
                expect(function () {
                    assert.isObject('', 'myObject');
                }).to.throw(Error);
            });

            it('No Error thrown on object', function () {
                expect(function () {
                    assert.isObject({}, 'myObject');
                }).to.not.throw();
            });
        });

        describe('When asserting argument is an array', function () {
            it('Has property isArray that is a function', function () {
                expect(assert.isArray).to.be.a('function');
            });

            it('Error thrown on string', function () {
                expect(function () {
                    assert.isArray('', 'myArray');
                }).to.throw(Error);
            });

            it('No Error thrown on array', function () {
                expect(function () {
                    assert.isObject([], 'myArray');
                }).to.not.throw();
            });
        });

        describe('When asserting argument is a string', function () {
            it('Has property isString that is a function', function () {
                expect(assert.isString).to.be.a('function');
            });

            it('Error thrown on object', function () {
                expect(function () {
                    assert.isString({}, 'myString');
                }).to.throw(Error);
            });

            it('No Error thrown on string', function () {
                expect(function () {
                    assert.isString('', 'myString');
                }).to.not.throw();
            });
        });

        describe('When asserting argument is a number', function () {
            it('Has property isNumber that is a function', function () {
                expect(assert.isNumber).to.be.a('function');
            });

            it('Error thrown on string', function () {
                expect(function () {
                    assert.isNumber('', 'myNumber');
                }).to.throw(Error);
            });

            it('No Error thrown on number', function () {
                expect(function () {
                    assert.isNumber(123, 'myNumber');
                }).to.not.throw();
            });
        });

        describe('When asserting argument is a function', function () {
            it('Has property isFunction that is a function', function () {
                expect(assert.isFunction).to.be.a('function');
            });

            it('Error thrown on object', function () {
                expect(function () {
                    assert.isFunction({}, 'myFunction');
                }).to.throw(Error);
            });

            it('No Error thrown on function', function () {
                expect(function () {
                    assert.isFunction(function () {}, 'myFunction');
                }).to.not.throw();
            });
        });
    });
});