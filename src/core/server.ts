import { IConfig } from '../types/config/i-config';
import * as express from 'express';
import * as morgan from 'morgan';
import { Db } from 'mongodb';
import { createServer } from 'http';
import { createServer as createSecureServer } from 'https';
import { existsSync, readFileSync } from 'fs';
import { error, info, enabled as loggingEnabled } from '../utils/logger';
import * as compression from 'compression';
import { AuthRouter, ErrorRouter, CORSRouter, FileRouter, Router } from '../routers';
import { graphqlHTTP } from 'express-graphql';
import { generateSchema } from './graphql-schema';
import { ArgumentValidationError } from 'type-graphql';

export class Server {
  public config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
  }

  async initialize(db: Db): Promise<Server> {
    const server = this.config.server;
    const app = express();
    const schema = await generateSchema();
    const rootPath = server.rootPath || 'api';

    // bind express with graphql
    app.use('/graphql', (req, res) => {
      const enableGraphIQl = this.config.server.enableGraphIQl;
      return graphqlHTTP({
        schema,
        graphiql: enableGraphIQl && enableGraphIQl.toString() === 'true' ? true : false,
        context: { res, req, server },
        customFormatErrorFn: err => {
          if (err.originalError && (err.originalError as ArgumentValidationError).validationErrors) {
            const validationErrors = (err.originalError as ArgumentValidationError).validationErrors;
            const formattedErrors = validationErrors.map(vErr => {
              const errors = Object.keys(vErr.constraints!).map(key => vErr.constraints![key]);
              return {
                message: `Validation error for ${vErr.property}: ${errors.join(', ')}`
              };
            });

            // We just show the first error and do not pass all the possible errors in one go
            return formattedErrors[0];
          } else return err;
        }
      });
    });

    // Create the controllers
    const routers: Router[] = [
      new CORSRouter(server.corsApprovedDomains || []),
      new AuthRouter(rootPath),
      new FileRouter(rootPath),
      new ErrorRouter()
    ];

    // Enable GZIPPING
    app.use(compression());

    // User defined static folders
    if (server.staticAssets) {
      let localStaticFolder = server.staticAssets;
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
          key: privkey!,
          cert: theCert!,
          passphrase: server.ssl.passPhrase,
          ca: caChain
        },
        app
      );
      httpsServer.listen({ port: port, host: server.host || 'localhost' });

      info(`Listening on HTTPS port ${port}`);
    }

    try {
      await Promise.all(routers.map(ctrl => ctrl.initialize(app, db)));
      info(`All routers are now setup successfully`);
      return this;
    } catch (e) {
      throw new Error(`ERROR An error has occurred while setting up the routers: '${e.message}' \r\n'${e.stack}'`);
    }
  }
}
