import * as express from 'express';
import { Controller } from '../../../src';
import { IAuthReq, IClient } from '../../../src';
import { Db } from 'mongodb';

export default class Server extends Controller {
  constructor(client: IClient) {
    super(null);
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
          <div>Please go to localhost:9001</div>
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
