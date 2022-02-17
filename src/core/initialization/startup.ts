import { IConfig } from '../../types/config/i-config';
import { IDatabase } from '../../types/config/properties/i-database';
import { readFileSync, existsSync } from 'fs';
import { dirname } from 'path';
import { error, info, clear, initializeLogger } from '../../utils/logger';
import * as yargs from 'yargs';
import { MongoClient } from 'mongodb';
import { Server } from '../server';
import { prepare } from './db-preparation';
import ControllerFactory from '../controller-factory';
import RemoteFactory from '../remotes/remote-factory';
import { writeSchemaToFile } from '../graphql-schema';
import { mergeDeep } from '../../utils/utils';

const args: any = yargs.argv;

function loadSensitiveProps(config: IConfig, rootPath: string) {
  function loadProp(parentProp: any, prop: string, path: string) {
    if (typeof path === 'string') {
      if (!existsSync(rootPath + '/' + path))
        throw new Error(`Property file '${rootPath + '/' + path}' cannot be found`);
      else parentProp[prop] = JSON.parse(readFileSync(rootPath + '/' + path, 'utf8'));
    }
  }

  // Load and merge any sensitive json files
  loadProp(config, 'adminUser', config.adminUser as string);
  loadProp(config.remotes, 'google', config.remotes.google as string);
  loadProp(config.remotes, 'local', config.remotes.local as string);
  loadProp(config.mail, 'options', config.mail.options as string);
  loadProp(config, 'database', config.database as string);
}

/**
 * Loads the config file
 */
function loadConfig(): IConfig | null {
  let config: IConfig;

  // If no logging - remove all transports
  if (args.logging && args.logging.toLowerCase().trim() === 'false') {
    clear();
  }

  // Make sure the config path argument is there
  if (!args.config || args.config.trim() === '') {
    error(
      'No config file specified. Please start mantle with the config path in the argument list. Eg: node main.js --config="./config.js"'
    );
    process.exit();
  }

  // Make sure the file exists
  if (!existsSync(args.config)) {
    error(`Could not locate the config file at '${args.config}'`);
    process.exit();
  }

  try {
    // Try load and parse the config
    config = JSON.parse(readFileSync(args.config, 'utf8'));

    loadSensitiveProps(config, dirname(args.config));

    // Override any of the config settings with the yargs if they exist
    for (const i in args)
      if (config.hasOwnProperty(i))
        if (typeof args[i] === 'string') config[i] = args[i];
        else config[i] = mergeDeep(config[i], args[i]);

    return config;
  } catch (err) {
    error(`Could not parse the config file - make sure its valid JSON: ${err}`);
    process.exit();
  }
}

/**
 * initialization function to prep DB and servers
 */
export async function initialize() {
  initializeLogger();
  const config = loadConfig()!;

  info(`Attempting to connect to mongodb...`);

  if (!config.database) throw new Error('No database object defined in the config file');

  const dbProps = config.database as IDatabase;
  const mongoServer = new MongoClient(dbProps.host, {
    localPort: dbProps.port,
    servername: dbProps.name
  });

  await mongoServer.connect();

  const db = await mongoServer.db(dbProps.name);

  ControllerFactory.initialize(config, db);
  await RemoteFactory.initialize(config, db);
  await ControllerFactory.addDefaults();

  info(`Successfully connected to '${dbProps.name}' at ${dbProps.host}:${dbProps.port}`);
  info(`Starting up HTTP servers...`);

  await prepare(db, config);

  // Load each of the servers
  const server: Server = new Server(config);
  await server.initialize(db);

  info(`Mantle Server started...`);
}

if (args.writeSchema) {
  console.log('Writing schema file to schema.graphql');
  writeSchemaToFile('./schema.graphql')
    .then(() => {
      process.exit();
    })
    .catch((err: Error) => {
      error(err.message).then(() => process.exit());
    });
}

if (!args.runningTests) {
  initialize().catch((err: Error) => {
    error(err.message).then(() => process.exit());
  });
}
