import fs from 'fs-extra';
import { assign } from 'lodash';

import { IPackageDetails, readPackageDetails } from './read-package-details';

const packageDetails: IPackageDetails = {
  name: 'package-name',
  description: 'package description',
  version: '1.0.0',
  author: 'test@test.com',
  homepage: 'pizza.com',
  repository: {
    type: '',
    url: ''
  },
  announcements: {
    tweet: 'nice!'
  }
};

jest.mock('fs-extra');

describe('readPackageDetails', () => {
  it('should return the package details', () => {
    // @ts-ignore
    fs.readJson.mockResolvedValue(packageDetails);
    return expect(readPackageDetails('rootFolder')).resolves.toMatchSnapshot();
  });

  it('should throw error if reading package.json failed', () => {
    // @ts-ignore
    fs.readJson.mockRejectedValue(new Error('failed reading json file'));
    return expect(readPackageDetails('rootFolder')).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw error if missing tweet from package.json', () => {
    const missingDetails: Partial<IPackageDetails> = assign({}, packageDetails);
    missingDetails.announcements = undefined;
    // @ts-ignore
    fs.readJson.mockResolvedValue(missingDetails);

    return expect(readPackageDetails('rootFolder')).rejects.toThrowErrorMatchingSnapshot();
  });
});
