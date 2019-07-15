#!/usr/bin/env node
// add console colors
require('manakin').global;

const cli = require('../lib/announce-it-cli');

cli.run();
