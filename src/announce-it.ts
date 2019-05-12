import { forEach, get, isNil, isObject, template } from 'lodash';
import Twitter from 'twitter-lite';

import { IPackageDetails } from './read-package-details';

export interface IKbAnnounceItOptions {
  consumerKey: string;
  consumerSecret: string;
  accessTokenKey: string;
  accessTokenSecret: string;
}

export class KbAnnounceIt {
  private client: any;
  constructor(options: IKbAnnounceItOptions) {

    if (!get(options, 'consumerKey') ||
      !get(options, 'consumerSecret') ||
      !get(options, 'accessTokenKey') ||
      !get(options, 'accessTokenSecret')) {

      throw new Error('ERROR: missing required options');
    }

    this.client = new Twitter({
      subdomain: 'api',
      consumer_key: options.consumerKey,
      consumer_secret: options.consumerSecret,
      access_token_key: options.accessTokenKey,
      access_token_secret: options.accessTokenSecret
    });
  }

  announceRelease(packageDetails: IPackageDetails): Promise<any> {
    if (!packageDetails.version.match(/^(\d+\.)+\d+$/)) {
      return Promise.reject('Not a release version');
    }

    const tweet = this.generateTweet(packageDetails);

    return this.client
      .get('account/verify_credentials')
      .then(() => this.client.post('statuses/update', { status: tweet }))
      .then(() => console.log('Tweeted successfully:', tweet));
  }

  generateTweet(packageDetails: IPackageDetails): string {
    const tweetTemplate = template(packageDetails.announcements.tweet);
    this.ensureKeyAttributes(packageDetails);
    let tweet: string;
    try {
      tweet = tweetTemplate({
        package: packageDetails.name,
        version: packageDetails.version,
        description: packageDetails.description,
        author: packageDetails.author,
        homepage: packageDetails.homepage,
        npmpage: `https://www.npmjs.com/package/${ packageDetails.name }/v/${ packageDetails.version }`
      });
    } catch (e) {
      throw new Error('Using missing variables in tweet template');
    }

    return tweet;
  }

  private ensureKeyAttributes(packageDetails: Partial<IPackageDetails>): void {
    const requiredKeys = ['name', 'version', 'announcements.tweet'];

    if (!isObject(packageDetails)) {
      throw new Error('Expecting Object');
    }

    forEach(requiredKeys, (key) => {
      if (isNil(get(packageDetails, key))) {
        throw new Error(`The key ${key} is missing from given object`);
      }
    });
  }
}
