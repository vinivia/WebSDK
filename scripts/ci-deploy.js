/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. Confidential and Proprietary. All Rights Reserved.
 */
const {createHash} = require('crypto');
const runner = require('./runner');
const packageJson = require('../package.json');
const name = packageJson.name;
const version = packageJson.version;
const isBeta = !!version.match(/beta/g);
const publishDate = new Date().toISOString();
const publishId = createHash('md5').update(publishDate).digest('hex').slice(0, 5);
const latestVersion = version.match(/^[0-9]*[.][0-9]*/)[0] + (isBeta ? '.beta' : '.latest');

runner.runCommands([
    'node --version',
    'npm --version',
    isBeta ? `npm run publish --tag beta -- --temp-dir publish-working-directory-${publishId}` : `npm run publish -- --temp-dir publish-working-directory-${publishId}`,
    `node ./scripts/publish-check.js name=${name} version=${version}`,
    `scp -r dist/ repo@repository.phenixrts.com:dist/WebSDK/${version}`,
    `ssh repo@repository.phenixrts.com rm -f dist/WebSDK/${latestVersion}`,
    `ssh repo@repository.phenixrts.com ln -s ~/dist/WebSDK/${version} dist/WebSDK/${latestVersion}`
]);