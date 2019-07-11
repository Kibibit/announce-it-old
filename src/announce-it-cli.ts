#!/usr/bin/env node
import manakin from 'manakin';
import nconf from 'nconf';

import { AnnounceItCli } from './announce-it-cli-utils';

// add console colors
// tslint:disable-next-line
manakin.global;

nconf.argv()
  .env();

const announceItCli = new AnnounceItCli();

const variables = nconf.get();
announceItCli.areVariablesDefined(variables)
  .then(() => announceItCli.findRoot(process.cwd()))
  .then((root) => announceItCli.runAnnounceItCli(root, variables))
  .catch((error: Error) => {
    console.error('ERROR: Something went wrong');
    console.error(error);

    throw error;
  });
