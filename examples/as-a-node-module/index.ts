import { KbAnnounceIt, PackageDetails } from '@kibibit/announce-it';

const announceIt = new KbAnnounceIt({
  accessTokenKey: 'TWITTER_ACCESS_KEY',
  accessTokenSecret: 'TWITTER_ACCESS_SECRET',
  consumerKey: 'TWITTER_CONSUMER_KEY',
  consumerSecret: 'TWITTER_CONSUMER_SECRET'
});

const myPackage: PackageDetails = require('./package');

// get generated tweet
const tweet: string = announceIt.generateTweet(myPackage);

console.log('going to publish this tweet!', tweet);

// publish tweet to twitter
announceIt.announceRelease(myPackage);
