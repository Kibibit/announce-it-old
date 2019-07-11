import { assign, cloneDeep } from 'lodash';

import { KbAnnounceIt } from './announce-it';
import { IPackageDetails } from './read-package-details';

const TwitterMocks = () => {
  const defaultMock = (...args: any) => Promise.resolve();

  let getMock = defaultMock;
  let postMock = defaultMock;

  return {
    mock: {
      get: () => getMock(),
      post: () => postMock()
    },
    reset: (userDefinedMocks: any = {}) => {
      getMock = userDefinedMocks.get || getMock;
      postMock = userDefinedMocks.post || postMock;
    }
  };
};

const twitterMocks = TwitterMocks();

jest.mock('twitter-lite', () => () => twitterMocks.mock);

describe('KbAnnounceIt', () => {
  it('should throw error when missing options', () => {
    expect.assertions(5);

    // @ts-ignore
    expect(() => new KbAnnounceIt()).toThrowErrorMatchingSnapshot();

    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST'
    })).toThrowErrorMatchingSnapshot();

    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenKey: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST'
    })).toThrowErrorMatchingSnapshot();

    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerSecret: 'TEST'
    })).toThrowErrorMatchingSnapshot();
    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST'
    })).toThrowErrorMatchingSnapshot();

  });

  it('should create instance when given correct parameters', () => {
    const announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST',
      branch: 'TEST'
    });

    expect(announceIt).toBeDefined();
    expect(announceIt).toMatchSnapshot();
  });
});

describe('kbAnnounceIt.announceRelease', () => {
  const packageDetails: IPackageDetails = {
    name: 'test-repo',
    description: 'test-description',
    author: 'test-author',
    homepage: 'test-homepage',
    repository: {
      type: 'test-repo-type',
      url: 'test-repo-url'
    },
    version: '0.0.0',
    announcements: {
      tweet: 'test-template'
    },
    release: {
      branches: [ 'TEST' ]
    }
  };

  let announceIt: KbAnnounceIt;

  beforeEach(() => {
    announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST',
      branch: 'TEST'
    });
  });

  it('should post to twitter when stable release', () => {
    return expect(announceIt.announceRelease(packageDetails)).resolves.toMatchSnapshot();
  });

  it('should throw an error when unstable release and not mentioned in packageDetails', () => {
    const testPackageDetails = cloneDeep(packageDetails);
    announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST',
      branch: 'unstable'
    });

    return expect(announceIt.announceRelease(testPackageDetails)).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should throw an error when unstable release and mentioned in packageDetails as unstable', () => {
    const testPackageDetails = cloneDeep(packageDetails);
    testPackageDetails.release.branches = [{
      name: 'unstable',
      prerelease: true
    }];
    announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST',
      branch: 'unstable'
    });


    return expect(announceIt.announceRelease(testPackageDetails)).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should post to twitter when unstable release and mentioned in packageDetails as stable', () => {
    const testPackageDetails = cloneDeep(packageDetails);
    testPackageDetails.release.branches = [{
      name: 'unstable',
      prerelease: false
    }];
    announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST',
      branch: 'unstable'
    });


    return expect(announceIt.announceRelease(testPackageDetails)).resolves.toMatchSnapshot();
  });

  it('should post to twitter when unstable release and mentioned in packageDetails', () => {
    const testPackageDetails = cloneDeep(packageDetails);
    testPackageDetails.version = '0.0.0-next.1';
    testPackageDetails.announcements.includeUnstable = true;

    return expect(announceIt.announceRelease(testPackageDetails)).resolves.toMatchSnapshot();
  });

  it('should throw error when twitter get credentials throws an error', async () => {
    twitterMocks.reset({ get: (...args: any) => Promise.reject(new Error('Twitter Get Error')) });

    // TODO: FEATURE: create a basic KbError class
    return expect(announceIt.announceRelease(packageDetails)).rejects
      .toThrowErrorMatchingSnapshot();
  });

  it('should throw error when twitter post tweet throws an error', async () => {
    expect.assertions(1);

    twitterMocks.reset({
      post: (...args: any) => Promise.reject(new Error('Twitter Post Error')),
      get: (...args: any) => Promise.resolve()
    });

    return expect(announceIt.announceRelease(packageDetails)).rejects
      .toThrowErrorMatchingSnapshot();
  });
});

describe('kbAnnounceIt.generateTweet', () => {
  const packageDetails: IPackageDetails = {
    name: 'test-repo',
    description: 'test-description',
    author: 'test-author',
    homepage: 'test-homepage',
    repository: {
      type: 'test-repo-type',
      url: 'test-repo-url'
    },
    version: '0.0.0',
    announcements: {
      tweet: 'test-template'
    },
    release: {
      branches: [ 'TEST' ]
    }
  };

  let announceIt: KbAnnounceIt;

  beforeEach(() => {
    announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST',
      branch: 'TEST'
    });
  });

  it('should throw error on non object input', () => {
    // @ts-ignore
    expect(() => announceIt.generateTweet()).toThrowErrorMatchingSnapshot();
  });

  it('should throw error on missing package details input', () => {
    const testPackageDetails: any = assign({}, packageDetails);
    testPackageDetails.name = null;

    expect(() => announceIt.generateTweet(testPackageDetails)).toThrowErrorMatchingSnapshot();
  });

  it('should throw error when using missing variables in template', async () => {
    const testPackageDetails = packageDetails;
    testPackageDetails.announcements.tweet = 'This should <%= blow %> an error';
    expect(() => announceIt.generateTweet(packageDetails)).toThrowErrorMatchingSnapshot();

  });
});
