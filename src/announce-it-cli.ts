import nconf from 'nconf';

import { AnnounceItCli } from './announce-it-cli-utils';

export async function run(): Promise<string> {
  nconf.argv()
    .env();

  const announceItCli = new AnnounceItCli();

  const parameters = nconf.get();
  const cwd = process.cwd();

  return announceItCli.areVariablesDefined(parameters)
    .then(() => announceItCli.findRoot(cwd))
    .then((root) => announceItCli.runAnnounceItCli(root, parameters))
    .catch((error: Error) => {
      console.error('ERROR: Something went wrong');
      console.error(error);

      throw error;
    });
}
