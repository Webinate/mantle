const mp = require( '../../src/index' );
const express = require( 'express' );

class Server extends mp.Controller {
  constructor() {
    super();
  }

  /**
   * Renders an html page showing the number of users in
   * this modepress instance
   */
  async onRender( req, res, next ) {
    const users = await mp.UserManager.get.getUsers();
    const html = `
    <html>
      <header>
        <link rel="stylesheet" href="./style.css">
      </header>

      <body>
        <div class="container">
          <h1>Welcome to Mantle</h1>
          <p>This example demonstrates a basic express site</p>
          <p>There appears to be [${users ? users.length : 0}] users registered on this instance of modepress</p>
          <p><img src="./mantle-logo-textured.png" alt="Mantle Logo"></p>
        </div>
      </body>
    </html>
    `;

    res.send( html );
  }

  /**
   * Called by modepress once the server is initialized
   * @param {express.Express} app The Express app
   * @param {mongoDb.Db} db The mongo database instance
   */
  async initialize( app, db ) {

    const router = express.Router();
    router.get( '*', this.onRender.bind( this ) );
    app.use( '/', router );
    return this;
  }
}

exports.default = Server;