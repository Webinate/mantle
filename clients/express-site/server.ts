import ControllerFactory from '../../src/core/controller-factory';
import { Router } from '../../src/routers/router';
import * as express from 'express';
import { Db } from 'mongodb';

class Server extends Router {
  constructor() {
    super();
  }

  /**
   * Called by mantle once the server is initialized
   * @param {express.Express} app The Express app
   * @param {mongoDb.Db} db The mongo database instance
   */
  async initialize(app: express.Express, db: Db) {
    const router = express.Router();
    router.get('*', async (req, res, next) => {
      const users = await ControllerFactory.get('users').getUsers();
      const html = `
    <html>
      <header>
        <link rel="stylesheet" href="./style.css">
      </header>

      <body>
        <div class="container">
          <h1>Welcome to Mantle</h1>
          <p>This example demonstrates a basic express site</p>
          <p>There appears to be [${users ? users.data.length : 0}] users registered on this instance of mantle</p>
          <p><img src="./mantle-logo-textured.png" alt="Mantle Logo"></p>
        </div>
      </body>
    </html>
    `;

      res.send(html);
    });

    app.use('/', router);
    return this;
  }
}

exports.default = Server;
