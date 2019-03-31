#!/usr/bin/env node
import Twitter from 'twitter-lite';
import fs from 'fs-extra';
import findRoot from 'find-root';
import dotenv from 'dotenv';

dotenv.config();
const root = findRoot(process.cwd());



const client = new Twitter({
  subdomain: "api",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

client
  .get('account/verify_credentials')
    .then(() => fs.readJson(`${root}/package.json`, 'utf8'))
    .then((packageData) => {
      return `Version ${packageData.version} of ${packageData.name} is out!`;
    })
    .then((tweet) => {
      client.post('statuses/update', {status: tweet})
      return tweet;
    })
    .then((tweet) => console.log('Tweeted:', tweet))
    .catch(console.error);
    