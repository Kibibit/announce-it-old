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
    expect(() => new KbAnnounceIt()).toThrow(Error);

    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST'
    })).toThrow(Error);

    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenKey: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST'
    })).toThrow(Error);

    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerSecret: 'TEST'
    })).toThrow(Error);
    // @ts-ignore
    expect(() => new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST'
    })).toThrow(Error);

  });

  it('should create instance when given correct parameters', () => {
    const announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST'
    });

    expect(announceIt).toBeDefined();
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
    }
  };

  let announceIt: KbAnnounceIt;

  beforeEach(() => {
    announceIt = new KbAnnounceIt({
      accessTokenKey: 'TEST',
      accessTokenSecret: 'TEST',
      consumerKey: 'TEST',
      consumerSecret: 'TEST'
    });
  });

  it('should post to twitter when stable release', () => {
    return announceIt.announceRelease(packageDetails)
    .then((tweet) => expect(tweet).toMatch('test-template'));
  });

  it('should throw an error when unstable release and not mentioned in packageDetails', () => {
    const testPackageDetails = cloneDeep(packageDetails);
    testPackageDetails.version = '0.0.0-next.1';

    return announceIt.announceRelease(testPackageDetails)
      .catch((tweet) => expect(tweet).toMatch('Not a stable release'));
  });

  it('should post to twitter when unstable release and mentioned in packageDetails', () => {
    const testPackageDetails = cloneDeep(packageDetails);
    testPackageDetails.version = '0.0.0-next.1';
    testPackageDetails.announcements.includeUnstable = true;

    return announceIt.announceRelease(testPackageDetails)
      .then((tweet) => expect(tweet).toMatch('test-template'));
  });

  it('should throw error on missing package details input', () => {
    const testPackageDetails: any = assign({}, packageDetails);
    testPackageDetails.name = null;

    expect(() => announceIt.announceRelease(testPackageDetails)).toThrow(Error);
  });

  it('should throw error when twitter get credentials throws an error', async () => {
    expect.assertions(1);

    twitterMocks.reset({ get: (...args: any) => Promise.reject('Twitter Get Error') });

    try {
      await announceIt.announceRelease(packageDetails);
    } catch (e) {
      // TODO: FEATURE: create a basic KbError class
      expect(e).toMatch('Twitter Get Error');
    }
  });

  it('should throw error when twitter post tweet throws an error', async () => {
    expect.assertions(1);

    twitterMocks.reset({
      post: (...args: any) => Promise.reject('Twitter Post Error'),
      get: (...args: any) => Promise.resolve()
     });

    try {
      await announceIt.announceRelease(packageDetails);
    } catch (e) {
      expect(e).toMatch('Twitter Post Error');
    }
  });

  it('should throw error when using missing variables in template', async () => {
    const testPackageDetails = packageDetails;
    testPackageDetails.announcements.tweet = 'This should <%= blow %> an error';
    expect(() => announceIt.generateTweet(packageDetails)).toThrow(Error);

  });
});
