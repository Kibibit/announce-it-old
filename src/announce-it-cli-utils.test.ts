import fs from 'fs-extra';
import { assign } from 'lodash';

import { AnnounceItCli } from './announce-it-cli-utils';
import { IPackageDetails } from './read-package-details';

jest.mock('find-root', () => (folder: string) => {
  if (folder === 'test-failure') {
    throw new Error('failure (test mock)');
  }

  return 'project-root';
});

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

describe('AnnounceItCli', () => {
  const announceItCli = new AnnounceItCli();

  describe('areVariablesDefined', () => {
    it('should resolve if all required variables exists', () => {
      return expect(announceItCli.areVariablesDefined({
        CONSUMER_KEY: 'CONSUMER_KEY',
        CONSUMER_SECRET: 'CONSUMER_SECRET',
        ACCESS_TOKEN_KEY: 'ACCESS_TOKEN_KEY',
        ACCESS_TOKEN_SECRET: 'ACCESS_TOKEN_SECRET',
        branch: 'TEST'
      })).resolves.toMatchSnapshot();
    });
    it('should reject if at least 1 required variable is missing', () => {
      return expect(announceItCli.areVariablesDefined({
        CONSUMER_KEY: 'CONSUMER_KEY',
        CONSUMER_SECRET: 'CONSUMER_SECRET',
        ACCESS_TOKEN_SECRET: 'ACCESS_TOKEN_SECRET'
      }))
        .rejects.toThrowErrorMatchingSnapshot()
        .then(() => expect(announceItCli.areVariablesDefined({}))
          .rejects.toThrowErrorMatchingSnapshot());
    });
  });

  describe('findRoot', () => {
    it('should return the project root folder if ran inside npm project', () => {
      return expect(announceItCli.findRoot('test-folder')).resolves.toMatchSnapshot();
    });
    it('should throw error if not inside npm project', () => {
      return expect(announceItCli.findRoot('test-failure')).rejects.toThrowErrorMatchingSnapshot();
    });
  });

  describe('runAnnounceItCli', () => {
    it.todo('should run the entire flow on correct input');
    it.todo('should throw error on incorrect input');
  });
});
