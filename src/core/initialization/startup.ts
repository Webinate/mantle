import { IConfig } from '../../types/config/i-config';
import { IDatabase } from '../../types/config/properties/i-database';
import { IClient } from '../../types/config/properties/i-client';
import { readFileSync, existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { error, info, clear, initializeLogger } from '../../utils/logger';
import * as yargs from 'yargs';
import { Server as MongoServer, Db } from 'mongodb';
import { Server } from '../server';
import { ConsoleManager } from '../../console/console-manager';
import { prepare } from './db-preparation';
import ModelFactory from '../model-factory';
import ControllerFactory from '../controller-factory';
import * as merge from 'deepmerge';
import RemoteFactory from '../remotes/remote-factory';

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
        else config[i] = merge(config[i], args[i]);

    return config;
  } catch (err) {
    error(`Could not parse the config file - make sure its valid JSON: ${err}`);
    process.exit();
  }

  return null;
}

/**
 * Traverses a directory and each of its folders to find any mantle.json config files
 */
export async function discoverClients(config: IConfig) {
  if (!config.clientsFolder) throw new Error('The property clientsFolder is not present in the config file');

  if (!existsSync(config.clientsFolder))
    throw new Error('Cannot resolve clientsFolder property. Make sure the folder exists and is accessible');

  const directories = readdirSync(config.clientsFolder, { encoding: 'utf8' });

  const clientDefinitions: (IClient & { path: string })[] = [];
  for (const dir of directories) {
    let localDir = (config.clientsFolder + dir).replace(/\/\//, '/');
    if (existsSync(`${localDir}/mantle.json`)) {
      try {
        const client = JSON.parse(readFileSync(`${localDir}/mantle.json`).toString());
        client.path = resolve(localDir);
        clientDefinitions.push(client);
      } catch (err) {
        throw new Error(`Could not parse mantle JSON in '${localDir}'`);
      }
    }
  }

  return clientDefinitions;
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
  const mongoServer = new MongoServer(dbProps.host, dbProps.port, {
    servername: dbProps.name
  });
  const mongoDB = new Db(dbProps.name, mongoServer, { w: 1 });
  const db = await mongoDB.open();

  ModelFactory.initialize(config, db);
  ControllerFactory.initialize(config, db);
  await RemoteFactory.initialize(config, db);
  await ModelFactory.addBaseModelFactories();
  await ControllerFactory.addDefaults();

  info(`Successfully connected to '${dbProps.name}' at ${dbProps.host}:${dbProps.port}`);
  info(`Starting up HTTP servers...`);

  // Create each of your servers here
  const promises: Array<Promise<any>> = [];

  await prepare(db, config);
  const clients = await discoverClients(config);

  const servers: Server[] = [];

  // First create the servers
  for (const client of clients) {
    if (typeof client.server !== 'string' && client.enabled === true) {
      servers.push(new Server(client, client.path));
    }
  }

  // Now go through the add on clients and add the controllers
  // to any existing servers defined in the client
  for (const client of clients) {
    if (!client.enabled) continue;

    let server: Server | undefined;
    let clientServer = client.server;

    if (typeof clientServer === 'string') server = servers.find(s => s.client.name === clientServer);
    else server = servers.find(s => s.client.name === client.name);

    if (!server) {
      error(`Could not find an existing server with the name ${client.server}`);
      process.exit();
    }

    server!.parseClient(client);
  }

  for (const server of servers) promises.push(server.initialize(db));

  // Load each of the servers
  await Promise.all(promises);

  info(`Server instances loaded...`);

  // Create the console manager
  if (!args.runningTests) new ConsoleManager().initialize();
}

if (!args.runningTests) {
  // Start the server initialization
  initialize().catch((err: Error) => {
    error(err.message).then(() => process.exit());
  });
}
