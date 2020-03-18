import * as fs from 'fs';
import * as yargs from 'yargs';
import 'reflect-metadata';
import {} from 'mocha';

const args = yargs.argv;

if (!args.config || !fs.existsSync(args.config)) {
  console.log('Please specify a mantle --config file to use in the command line');
  process.exit();
}

if (args.server === undefined || isNaN(parseInt(args.server))) {
  console.log(
    'Please specify a --server index in the cmd arguments to test. This index refers to the array item in the mantle config.servers array'
  );
  process.exit();
}

import * as startup from '../src/core/initialization/startup';
import header from './tests/header';

// Start the first test to initialize everything
describe('Initializing tests', function() {
  before(async function() {
    this.timeout(20000);

    try {
      // Initialize the server
      await startup.initialize();

      // Initialize the test suites
      await header.initialize();
    } catch (err) {
      console.error(err);
      process.exit();
    }

    return true;
  });

  it('should be initialized', function(done) {
    return done();
  });
});
