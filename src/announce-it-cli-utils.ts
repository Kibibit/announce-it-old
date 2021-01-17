import findRoot from 'find-root';
import { every, isString } from 'lodash';

import { KbAnnounceIt } from './announce-it';
import { readPackageDetails } from './read-package-details';

export class AnnounceItCli {
  areVariablesDefined(env: NodeJS.ProcessEnv): Promise<void> {
    const variables = [
      'TWITTER_CONSUMER_KEY',
      'TWITTER_CONSUMER_SECRET',
      'TWITTER_ACCESS_TOKEN_KEY',
      'TWITTER_ACCESS_TOKEN_SECRET',
      'branch'
    ];

    const areEnvVariablesDefined = every(variables, (varName) => {
      return isString(env[ varName ]);
    });

    if (!areEnvVariablesDefined) {
      return Promise.reject(
        new Error(`These Variables are required: ${ variables.join(', ') }`)
      );
    }

    return Promise.resolve();
  }

  findRoot(folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const root = findRoot(folder);

        resolve(root);
      } catch (err) {
        reject(new Error(`couldn't find npm project root: ${ err.message || err }`));
      }
    });
  }

  runAnnounceItCli(folder: string, env: NodeJS.ProcessEnv): Promise<string> {
    return this.findRoot(folder)
      .then((root) => readPackageDetails(root))
      .then((packageDetails) => {
        const announceIt = new KbAnnounceIt({
          consumerKey: env.TWITTER_CONSUMER_KEY as string,
          consumerSecret: env.TWITTER_CONSUMER_SECRET as string,
          accessTokenKey: env.TWITTER_ACCESS_TOKEN_KEY as string,
          accessTokenSecret: env.TWITTER_ACCESS_TOKEN_SECRET as string,
          branch: env.branch as string
        });

        return announceIt.announceRelease(packageDetails);
      });
  }
}
