/**
 * Copyright 2019 PhenixP2P Inc. All Rights Reserved.
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
    'phenix-web-assert'
], function(_, assert) {
    'use strict';

    var mostRecentStrategy = 'most-recent';
    var highAvailabilityStrategy = 'high-availability';
    var defaultBannedFailureCount = 1000;

    function MemberSelector(selectionStrategy, logger, options) {
        if (selectionStrategy) {
            assert.isStringNotEmpty(selectionStrategy, 'selectionStrategy');
        }

        assert.isObject(logger, 'logger');

        this._selectionStrategy = selectionStrategy || mostRecentStrategy;
        this._logger = logger;
        this._failureCountForBanningAMember = _.get(options, ['failureCountForBanningAMember'], defaultBannedFailureCount);

        this.reset();
    }

    MemberSelector.prototype.getNext = function getNext(members) {
        this._logger.info('Select member from [%s]', members);

        var newSelectedMember = getNextMember.call(this, members);

        if (!newSelectedMember) {
            this._logger.info('Unable to select new member from [%s]', members);
        } else {
            this._logger.info('Selecting new member [%s]/[%s]', newSelectedMember.getSessionId(), newSelectedMember.getObservableScreenName().getValue());
        }

        this._lastSelectedMember = newSelectedMember;

        return newSelectedMember;
    };

    MemberSelector.prototype.getStrategy = function() {
        return this._selectionStrategy;
    };

    MemberSelector.prototype.markFailed = function() {
        if (!this._lastSelectedMember) {
            this._logger.warn('Marking failed member but there was no recent selected member');

            return;
        }

        var memberKey = getMemberKey(this._lastSelectedMember);
        var failureCount = _.get(this._failureCounts, [memberKey], 0);

        failureCount++;

        this._logger.info('Failure count for member [%s] is now [%s]', memberKey, failureCount);

        _.set(this._failureCounts, [memberKey], failureCount);
        this._lastSelectedMember = null;
    };

    MemberSelector.prototype.markDead = function() {
        if (!this._lastSelectedMember) {
            this._logger.warn('Marking dead member but there was no recent selected member');

            return;
        }

        var memberKey = getMemberKey(this._lastSelectedMember);

        this._logger.info('Member [%s] is now permanently removed', memberKey);

        _.set(this._failureCounts, [memberKey], this._failureCountForBanningAMember);
        this._lastSelectedMember = null;
    };

    MemberSelector.prototype.getNumberOfMembersWithFailures = function() {
        return _.keys(this._failureCounts).length;
    };

    MemberSelector.prototype.reset = function() {
        this._lastSelectedMember = null;
        this._failureCounts = {};
    };

    MemberSelector.prototype.dispose = function dispose() {
        this.reset();
    };

    MemberSelector.getSimilarMembers = function(screenName, optionalSessionId, members) {
        var otherMembers = _.filter(members, function(member) {
            return member.getObservableScreenName().getValue() !== screenName && (!optionalSessionId || member.getSessionId() !== optionalSessionId);
        });
        var primaryMembers = _.filter(otherMembers, isPrimary);
        var alternateMembers = _.filter(otherMembers, isAlternate);

        if (isPrimaryName(screenName)) {
            return primaryMembers || alternateMembers || otherMembers;
        }

        if (isAlternateName(screenName)) {
            return alternateMembers || primaryMembers || otherMembers;
        }

        return otherMembers || primaryMembers || alternateMembers;
    };

    function getMemberKey(member) {
        if (!member) {
            return '';
        }

        return member.getSessionId() + member.getObservableScreenName().getValue();
    }

    function getNextMember(members) {
        var that = this;

        switch (this._selectionStrategy) {
        case mostRecentStrategy:
            var activeMembers = _.reduce(members, function(activeMembers, member) {
                if (_.get(that._failureCounts, [getMemberKey(member)], 0) < that._failureCountForBanningAMember) {
                    activeMembers.push(member);
                }

                return activeMembers;
            }, []);

            return getMostRecentMember(activeMembers);
        case highAvailabilityStrategy:
            if (this._lastSelectedMember && _.includes(members, this._lastSelectedMember)) {
                return this._lastSelectedMember;
            }

            var selectedMember = undefined;
            var minFailureCount = Math.max(0, that._failureCountForBanningAMember - 1);

            _.forEach(members, function(member) {
                var failureCount = _.get(that._failureCounts, [getMemberKey(member)], 0);

                if (failureCount < minFailureCount) {
                    minFailureCount = failureCount;
                    selectedMember = member;
                } else if (failureCount === minFailureCount) {
                    if (!selectedMember) {
                        selectedMember = member;
                    } else if (isPrimary(member)) {
                        if (!isPrimary(selectedMember)) {
                            selectedMember = member;
                        }
                    } else if (isAlternate(member)) {
                        if (!isPrimary(selectedMember) && !isAlternate(selectedMember)) {
                            selectedMember = member;
                        }
                    }
                }
            });

            return selectedMember;
        default:
            throw new Error('Invalid Selection Strategy');
        }
    }

    function getMostRecentMember(members) {
        return _.reduce(members, function(mostRecentMember, member) {
            if (!mostRecentMember) {
                return member;
            }

            return mostRecentMember.getLastUpdate() > member.getLastUpdate() ? mostRecentMember : member;
        });
    }

    function isPrimary(member) {
        var screenName = member.getObservableScreenName().getValue();

        return isPrimaryName(screenName);
    }

    function isAlternate(member) {
        var screenName = member.getObservableScreenName().getValue();

        return isAlternateName(screenName);
    }

    function isPrimaryName(name) {
        var primary = /primary/i;

        return primary.test(name);
    }

    function isAlternateName(name) {
        var alternate = /alternate/i;

        return alternate.test(name);
    }

    return MemberSelector;
});