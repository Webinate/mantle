import * as express from 'express';
import { Router } from '../../../src/routers/router';
import { IClient } from '../../../src/types/config/properties/i-client';
import { IAuthReq } from '../../../src/types/tokens/i-auth-request';
import { Db } from 'mongodb';

export default class Server extends Router {
  constructor(client: IClient) {
    super();
  }

  /**
   * Renders an html page showing the number of users in
   * this mantle instance
   */
  async onRender(req: IAuthReq, res: express.Response, next: Function) {
    const html = `
    <html>
      <header>
        <link rel="stylesheet" href="./style.css">
      </header>

      <body>
        <div class="container">
          <h1>Mantle supports Graphiql</h1>
          <div>Please go to <a href="http://localhost:9001/graphql">localhost:9001/graphql</a></div>
        </div>
      </body>
    </html>
    `;

    res.send(html);
  }

  /**
   * Called by mantle once the server is initialized
   * @param {express.Express} app The Express app
   * @param {mongoDb.Db} db The mongo database instance
   */
  async initialize(app: express.Express, db: Db) {
    const router = express.Router();
    router.get('*', [this.onRender.bind(this)]);
    app.use('/', router);
    return this;
  }
}
