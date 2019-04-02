#!/usr/bin/env node
import dotenv from 'dotenv';
import findRoot from 'find-root';
import { every, isString } from 'lodash';
import manakin from 'manakin';

import { KbAnnounceIt } from './announce-it';
import { readPackageDetails } from './read-package-details';

// add console colors
// tslint:disable-next-line
manakin.global;

const env = process.env;

const envVariables = [
  'CONSUMER_KEY',
  'CONSUMER_SECRET',
  'ACCESS_TOKEN_KEY',
  'ACCESS_TOKEN_SECRET'
];

const areEnvVariablesDefined = every(envVariables, (varName) => {
  return isString(process.env[ varName ]);
});

if (!areEnvVariablesDefined) {

  console.error('ERROR: These Environemnt variables are required:');
  console.error(`  ${ envVariables.join(' ') }`);
  process.exit(1);
}

dotenv.config();
const root = findRoot(process.cwd());

const announceIt = new KbAnnounceIt({
  consumerKey: env.CONSUMER_KEY as string,
  consumerSecret: env.CONSUMER_SECRET as string,
  accessTokenKey: env.ACCESS_TOKEN_KEY as string,
  accessTokenSecret: env.ACCESS_TOKEN_SECRET as string
});

readPackageDetails(root)
  .then((packageDetails) => announceIt.announceRelease(packageDetails))
  .catch((error: Error) => {
    console.error('ERROR: Something went wrong');
    console.error(error);

    throw error;
  });
