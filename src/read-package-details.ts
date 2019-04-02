import fs from 'fs-extra';
import { get, isString } from 'lodash';

export interface IPackageDetails {
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
  };
}

export function readPackageDetails(root: string): Promise<IPackageDetails> {
  return fs.readJson(`${ root }/package.json`)
    .then((packageDetails: Partial<IPackageDetails>) => {
      if (!isString(get(packageDetails, 'announcements.tweet'))) {
        throw new Error('no tweet template found. please see the readme for more details');
      }

      // here, we KNOW the package has the announcement template string
      return packageDetails as IPackageDetails;
    });
}
