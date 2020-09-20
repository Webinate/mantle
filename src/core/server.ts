import { IClient, IServer } from '../types/config/properties/i-client';
import * as express from 'express';
import * as morgan from 'morgan';
import { Db } from 'mongodb';
import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import { existsSync, readFileSync } from 'fs';
import { error, info, enabled as loggingEnabled } from '../utils/logger';
import * as compression from 'compression';
import { Router } from '../routers/router';
import { ErrorRouter } from '../routers/error';
import * as graphqlHTTP from 'express-graphql';
import { generateSchema } from './graphql-schema';

export class Server {
  public server: IServer;
  private _controllers: Router[];
  private _path: string;
  public client: IClient;

  constructor(client: IClient, path: string) {
    this.server = client.server as IServer;
    this._controllers = [];
    this._path = path;
    this.client = client;
  }

  /**
   * Goes through each client json discovered in the mantle client folder
   * and attempts to load it
   * @param client The client we are loading
   */
  parseClient(client: IClient & { path: string }) {
    if (!client.controllers) {
      error(`Client '${client.name}' does not have any controllers defined`).then(() => {
        process.exit();
      });

      return;
    }

    for (const ctrl of client.controllers) {
      try {
        const constructor = require(`${client.path}/${ctrl.path!}`).default;
        this._controllers.push(new constructor(client));
      } catch (err) {
        error(
          `Could not load custom controller '${ctrl.path}'. \n\rERROR: ${err.toString()}. \n\rSTACK: ${
            err.stack ? err.stack : ''
          }`
        ).then(() => {
          process.exit();
        });
      }
    }
  }

  async initialize(db: Db): Promise<Server> {
    const controllerPromises: Array<Promise<any>> = [];
    const server = this.server;
    const client = this.client;
    const app = express();
    const schema = await generateSchema();

    // bind express with graphql
    app.use('/graphql', (req, res) => {
      const enableGraphIQl = this.client.enableGraphIQl;
      return graphqlHTTP({
        schema,
        graphiql: enableGraphIQl && enableGraphIQl.toString() === 'true' ? true : false,
        context: { res, req, server, client }
      })(req, res);
    });

    // Create the controllers
    const controllers: Router[] = [...this._controllers, new ErrorRouter()];

    // Enable GZIPPING
    app.use(compression());

    // User defined static folders
    if (server.staticAssets) {
      for (let i = 0, l: number = server.staticAssets.length; i < l; i++) {
        let localStaticFolder = `${this._path}/${server.staticAssets[i]}`;
        if (!existsSync(localStaticFolder)) {
          await error(`Could not resolve local static file path '${localStaticFolder}' for server '${server.host}'`);
          process.exit();
        }

        info(`Adding static resource folder '${localStaticFolder}'`);
        app.use(
          express.static(localStaticFolder, {
            maxAge: server.staticAssetsCache || 2592000000
          })
        );
      }
    }

    // log every request to the console
    if (loggingEnabled()) app.use(morgan('dev'));

    info(`Attempting to start HTTP server...`);

    // Start app with node server.js
    const httpServer = createServer(app);
    httpServer.listen({ port: server.port, host: server.host || 'localhost' });
    info(`Listening on HTTP port ${server.port}`);

    // If we use SSL then start listening for that as well
    if (server.ssl) {
      if (server.ssl.intermediate !== '' && !existsSync(server.ssl.intermediate)) {
        await error(`Could not find ssl.intermediate: '${server.ssl.intermediate}'`);
        process.exit();
      }

      if (server.ssl.cert !== '' && !existsSync(server.ssl.cert)) {
        await error(`Could not find ssl.cert: '${server.ssl.cert}'`);
        process.exit();
      }

      if (server.ssl.root !== '' && !existsSync(server.ssl.root)) {
        await error(`Could not find ssl.root: '${server.ssl.root}'`);
        process.exit();
      }

      if (server.ssl.key !== '' && !existsSync(server.ssl.key)) {
        await error(`Could not find ssl.key: '${server.ssl.key}'`);
        process.exit();
      }

      const caChain = [readFileSync(server.ssl.intermediate), readFileSync(server.ssl.root)];
      const privkey = server.ssl.key ? readFileSync(server.ssl.key) : null;
      const theCert = server.ssl.cert ? readFileSync(server.ssl.cert) : null;
      const port = server.ssl.port ? server.ssl.port : 443;

      info(`Attempting to start SSL server...`);

      const httpsServer = createSecureServer(
        {
          key: privkey,
          cert: theCert,
          passphrase: server.ssl.passPhrase,
          ca: caChain
        },
        app
      );
      httpsServer.listen({ port: port, host: server.host || 'localhost' });

      info(`Listening on HTTPS port ${port}`);
    }

    try {
      // Initialize all the controllers
      for (const ctrl of controllers) {
        controllerPromises.push(ctrl.initialize(app, db));
      }

      // Return a promise once all the controllers are complete
      await Promise.all(controllerPromises);

      info(`All controllers are now setup successfully for ${this.server.host}!`);
      return this;
    } catch (e) {
      throw new Error(
        `ERROR An error has occurred while setting up the controllers for ${this.client.name}: '${e.message}' \r\n'${e.stack}'`
      );
    }
  }
}
