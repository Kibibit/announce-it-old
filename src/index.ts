#!/usr/bin/env node
require('dotenv').config();

console.log('Token:', process.env.TWITTER_TOKEN);
console.log('secret:', process.env.TWITTER_SECRET);
