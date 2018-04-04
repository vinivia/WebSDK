/**
 * Copyright 2018 PhenixP2P Inc. Confidential and Proprietary. All Rights Reserved.
 */
const runner = require('./runner');

runner.runCommands([
    'npm run deploy-examples:example',
    'npm run deploy-examples:src',
    'npm run deploy-examples:dist',
    'npm run deploy-examples:deps'
]);