#!/usr/bin/env node
import Twitter from 'twitter-lite';
//
require('dotenv').config();

const tweet = 'Hi @kibibit_opensrc, Are you ready to announce-it?';


const client = new Twitter({
  subdomain: "api",
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

client
  .get('account/verify_credentials')
  .then(() => {
    console.log('account verified');
    return client.post('statuses/update', {status: tweet});
  })
  .then(() => console.log('Tweeted:', tweet))
  .catch(console.error);
