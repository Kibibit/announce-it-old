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
  },
  release: {
    branches: [ 'TEST' ]
  }
};

jest.mock('fs-extra');
const fsMocked = fs as jest.Mocked<any>;

describe('readPackageDetails', () => {
  it('should return the package details', () => {
    fsMocked.readJson.mockResolvedValue(packageDetails);
    return expect(readPackageDetails('rootFolder')).resolves.toMatchSnapshot();
  });

  it('should throw error if reading package.json failed', () => {
    fsMocked.readJson.mockRejectedValue(new Error('failed reading json file'));
    return expect(readPackageDetails('rootFolder')).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw error if missing tweet from package.json', () => {
    const missingDetails: Partial<IPackageDetails> = assign({}, packageDetails);
    missingDetails.announcements = undefined;
    fsMocked.readJson.mockResolvedValue(missingDetails);

    return expect(readPackageDetails('rootFolder')).rejects.toThrowErrorMatchingSnapshot();
  });
});
