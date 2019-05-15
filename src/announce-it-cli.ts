#!/usr/bin/env node
import manakin from 'manakin';

import { AnnounceItCli } from './announce-it-cli-utils';

// add console colors
// tslint:disable-next-line
manakin.global;

const announceItCli = new AnnounceItCli();

announceItCli.areEnvVariablesDefined(process.env)
  .then(() => announceItCli.findRoot(process.cwd()))
  .then((root) => announceItCli.runAnnounceItCli(root, process.env))
  .catch((error: Error) => {
    console.error('ERROR: Something went wrong');
    console.error(error);

    throw error;
  });
