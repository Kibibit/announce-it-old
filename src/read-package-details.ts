import fs from 'fs-extra';
import { get, isString } from 'lodash';

export interface PackageDetails {
  name: string;
  version: string;
  description: string;
  author: string;
  homepage: string;
  repository: {
    type: string;
    url: string;
  };
  announcements: {
    tweet: string;
  }
}

export function readPackageDetails(root: string): Promise<PackageDetails> {
  return fs.readJson(`${ root }/package.json`)
    .then((packageDetails: Partial<PackageDetails>) => {
      if (!isString(get(packageDetails, 'announcements.tweet'))) {
        throw new Error('no tweet template found. please see the readme for more details');
      }

      // here, we KNOW the package has a the announcement template string
      return packageDetails as PackageDetails;
    });
}
