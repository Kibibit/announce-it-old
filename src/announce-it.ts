import { forEach, get, isNil, isObject, template, chain, isString } from 'lodash';
import Twitter from 'twitter-lite';

import { IPackageDetails } from './read-package-details';

export interface IKbAnnounceItOptions {
  consumerKey: string;
  consumerSecret: string;
  accessTokenKey: string;
  accessTokenSecret: string;
  branch: string;
}

export interface IBranchObject {
  name: string;
  prerelease: boolean;
}

export interface IStabilityGroups {
  stable: string[];
  unstable: string[];
}

export class KbAnnounceIt {
  private client: any;
  private branchName: string;
  constructor(options: IKbAnnounceItOptions) {

    if (!get(options, 'consumerKey') ||
      !get(options, 'consumerSecret') ||
      !get(options, 'accessTokenKey') ||
      !get(options, 'accessTokenSecret') ||
      !get(options, 'branch')) {

      throw new Error('ERROR: missing required options');
    }

    this.branchName = options.branch;
    this.client = new Twitter({
      subdomain: 'api',
      consumer_key: options.consumerKey,
      consumer_secret: options.consumerSecret,
      access_token_key: options.accessTokenKey,
      access_token_secret: options.accessTokenSecret
    });
  }

  announceRelease(packageDetails: IPackageDetails): Promise<string> {
    const releaseBranches: any[] = get(packageDetails, 'release.branches');

    const branchesGroupedByStability: IStabilityGroups = chain(releaseBranches)
    .groupBy((branch: string | IBranchObject) => {
      if (isString(branch)) { return 'stable'; }
      return branch.prerelease ? 'unstable' : 'stable';
    })
    .mapValues((branches: Array<string | IBranchObject>) =>
      branches.map((branch) => isString(branch) ? branch : branch.name))
    .defaultsDeep({
      stable: [],
      unstable: []
    })
    .value() as any;

    const isIncludeUnstable = packageDetails.announcements.includeUnstable;
    const isUnstableRelease = branchesGroupedByStability
      .unstable.includes(this.branchName);
    const isStableRelease = branchesGroupedByStability
      .stable.includes(this.branchName);
    const isNotRelease = !isUnstableRelease && !isStableRelease;

    if ((!isIncludeUnstable && isUnstableRelease) || isNotRelease) {
      return Promise.reject(new Error('Not a stable release'));
    }

    const tweet = this.generateTweet(packageDetails);

    return this.client
      .get('account/verify_credentials')
      .then(() => this.client.post('statuses/update', { status: tweet }))
      .then(() => tweet);
  }

  generateTweet(packageDetails: IPackageDetails): string {
    this.ensureKeyAttributes(packageDetails);

    const tweetTemplate = template(packageDetails.announcements.tweet);
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
    const requiredKeys = [ 'name', 'version', 'announcements.tweet' ];

    if (!isObject(packageDetails)) {
      throw new Error('Expecting Object');
    }

    forEach(requiredKeys, (key) => {
      if (isNil(get(packageDetails, key))) {
        throw new Error(`The key ${ key } is missing from given object`);
      }
    });
  }
}
