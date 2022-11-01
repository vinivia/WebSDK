/**
 * Copyright 2022 Phenix Real Time Solutions, Inc. Confidential and Proprietary. All Rights Reserved.
 */
const spawn = require('child_process').spawn;
const args = process.argv.slice(2);
let name = '';
let version = '';
let scriptOutput = '';

args.forEach(value => {
    if (value.startsWith('name=')) {
        name = value.replace('name=', '');
    }

    if (value.startsWith('version=')) {
        version = value.replace('version=', '').trim();
    }
});

if (!name) {
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('Please include package name as a name parameter\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');

    process.exit(1);
}

if (!version) {
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('Please include version as a parameter\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++\n');

    process.exit(1);
}

const child = spawn('npm', ['view', name, 'version']);

child.stdout.setEncoding('utf8');
child.stdout.on('data', data => {
    data = data.toString();
    scriptOutput += data;
});

child.stderr.setEncoding('utf8');
child.stderr.on('data', () => {
    process.stdout.write('++++++++++++++++\n');
    process.stdout.write('++++++++++++++++\n');
    process.stdout.write('Error occurred\n');
    process.stdout.write('++++++++++++++++\n');
    process.stdout.write('++++++++++++++++\n');

    process.exit(1);
});

child.on('close', () => {
    if (version.match(/beta/g)) {
        process.exit(0);
    }

    const currentVersion = scriptOutput.trim();

    if (version === currentVersion) {
        process.exit(0);
    }

    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('Version [' + version + '] was not published. Current version is [' + currentVersion + ']\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n');
    process.stdout.write('++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n');

    process.exit(1);
});