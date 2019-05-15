#!/usr/bin/env node
import findRoot from 'find-root';
import { every, isString } from 'lodash';

import { KbAnnounceIt } from './announce-it';
import { readPackageDetails } from './read-package-details';

export class AnnounceItCli {
  areEnvVariablesDefined(env: NodeJS.ProcessEnv): Promise<void> {
    const envVariables = [
      'CONSUMER_KEY',
      'CONSUMER_SECRET',
      'ACCESS_TOKEN_KEY',
      'ACCESS_TOKEN_SECRET'
    ];

    const areEnvVariablesDefined = every(envVariables, (varName) => {
      return isString(env[ varName ]);
    });

    if (!areEnvVariablesDefined) {
      return Promise.reject(new Error(`These Environment variables are required: ${ envVariables.join(' ') }`));
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
          consumerKey: env.CONSUMER_KEY as string,
          consumerSecret: env.CONSUMER_SECRET as string,
          accessTokenKey: env.ACCESS_TOKEN_KEY as string,
          accessTokenSecret: env.ACCESS_TOKEN_SECRET as string
        });

        return announceIt.announceRelease(packageDetails);
      });
  }
}
