let test = require( 'unit.js' );
let fs = require( 'fs' );
let yargs = require( "yargs" );
let args = yargs.argv;

/**
 * Represents an agent that can make calls to the backend
 */
class Agent {
  constructor( cookie, username, password, email, url ) {
    this.agent = test.httpAgent( url || ( "http://localhost:8000" ) );
    this.cookie = cookie;
    this.username = username;
    this.password = password;
    this.email = email;
    this.setDefaults();
  }

  /**
   * Sets the default properties
   */
  setDefaults() {
    this._code = 200;
    this._accepts = 'application/json';
    this._contentType = /json/;
    this._filePath = null;
    this._fileName = null;
    this._expects = '';
    this._fields = null;
    this._contentLength = null;
  }

  code( val ) {
    this._code = val;
    return this;
  }

  accepts( val ) {
    this._accepts = val;
    return this;
  }

  fields( val ) {
    this._fields = val;
    return this;
  }

  attach( name, filePath ) {
    this._fileName = name;
    this._filePath = filePath;
    return this;
  }

  contentType( val ) {
    this._contentType = val;
    return this;
  }

  setContentType( val ) {
    this._setContentType = val;
    return this;
  }

  contentLength( val ) {
    this._contentLength = val;
    return this;
  }

  /**
   * Updates the cookie of the agent
   * @param {string} response
   */
  updateCookie( response ) {
    this.cookie = response.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];
  }

  go( url, data, type ) {
    return new Promise( ( resolve, reject ) => {
      let req = null;
      if ( type === 'post' )
        req = this.agent.post( url );
      else if ( type === 'delete' )
        req = this.agent.delete( url );
      else if ( type === 'put' )
        req = this.agent.put( url );
      else
        req = this.agent.get( url );

      // req.set( 'Accept', this._accepts );

      if ( this._setContentType )
        req.set( 'Accept', this._setContentType );

      if ( this._code )
        req.expect( this._code )

      if ( this._contentType )
        req.expect( 'Content-Type', this._contentType );

      if ( data )
        req.send( data )

      if ( this._fields )
        for ( let i in this._fields )
          req.field( i, this._fields[ i ] )

      if ( this._filePath )
        req.attach( this._fileName, this._filePath )

      if ( this._contentLength )
        req.expect( 'Content-Length', this._contentLength )

      if ( this.cookie )
        req.set( 'Cookie', this.cookie )

      req.end( ( err, res ) => {
        this.setDefaults()

        if ( err )
          return reject( err );

        return ( resolve( res ) );
      } );
    } );
  }

  post( url, data ) {
    return this.go( url, data, 'post' );
  }

  delete( url, data ) {
    return this.go( url, data, 'delete' );
  }

  put( url, data ) {
    return this.go( url, data, 'put' );
  }

  get( url, data ) {
    return this.go( url );
  }
}

/**
 * Used to create a agent to test with
 * @param {string} url The host
 * @param {string} options Options for the agent
 */
function createAgent( url, options = {} ) {
  return new Agent( options.cookie, options.username, options.password, options.email, url );
}

/**
 * Posts a request to the server
 * @param {string} url The url of the post
 * @param {string} json The data to send
 * @param {string} host The host url
 */
function post( url, json, host ) {
  return new Promise( ( resolve, reject ) => {
    const agent = test.httpAgent( host );
    agent.post( url )
      .set( 'Accept', 'application/json' )
      .expect( 200 ).expect( 'Content-Type', /json/ )
      .send( json )
      .end( ( err, res ) => {
        if ( err )
          return reject( err );

        return ( resolve( res ) );
      } );
  } );
}

/**
 * Creates new user without the need of activating the account. Will first delete any user with that name that
 * that already exists in the database.
 * @param {string} username The new user username (Must be unique)
 * @param {string} password The new user's password
 * @param {string} email The new user's email
 * @param {string} priviledge The user's privilege type
 */
async function createUser( username, password, email, priviledge = 3 ) {

  // Remove the user if they already exist
  let response = await exports.users.admin
    .code( null )
    .delete( `/api/users/${username}` );

  // Now create the user using the admin account
  response = await exports.users.admin
    .code( 200 )
    .post( `/api/users`, { username: username, password: password, email: email, privileges: priviledge } );

  if ( response.body.error )
    throw new Error( response.body.message );

  // User created, but not logged in
  const newAgent = new Agent( null, username, password, email );
  response = await newAgent.post( `/api/auth/login`, { username: username, password: password } );

  if ( response.body.error )
    throw new Error( response.body.message );

  newAgent.updateCookie( response );
  exports.users[ username ] = newAgent;
  return newAgent;
}

/**
 * Removes a user from the system
 * @param {string} username The username of the user we are removing
 */
async function removeUser( username ) {

  // Remove the user if they already exist
  let response = await exports.users.admin.delete( `/api/users/${username}` );

  if ( response.body.error )
    throw new Error( response.body.message );
}

/**
 * Loads any of the sensitive props in the config json
 */
function loadSensitiveProps( config ) {
  function loadProp( parentProp, prop, path ) {
    if ( typeof ( path ) === 'string' ) {
      if ( !fs.existsSync( path ) )
        throw new Error( `Property file '${path}' cannot be found` );
      else
        parentProp[ prop ] = JSON.parse( fs.readFileSync( path, 'utf8' ) );
    }
  }

  // Load and merge any sensitive json files
  loadProp( config, 'adminUser', config.adminUser );
  loadProp( config.remotes, 'google', config.remotes.google );
  loadProp( config.remotes, 'local', config.remotes.local );
  loadProp( config.mail, 'options', config.mail.options );
  loadProp( config, 'database', config.database );
}

/**
 * Initialize the manager
 */
async function initialize() {
  try {
    const config = JSON.parse( fs.readFileSync( args.config ) );
    loadSensitiveProps( config );

    // const serverConfig = config.servers[ parseInt( args.server ) ];
    const host = "http://localhost:8000";
    const resp = await post( '/api/auth/login', { username: config.adminUser.username, password: config.adminUser.password }, host );
    const adminCookie = resp.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];;


    // Set the functions we want to expose
    exports.config = config;
    // exports.serverConfig = serverConfig;
    exports.createUser = createUser;
    exports.removeUser = removeUser;
    exports.createAgent = createAgent;
    exports.users = {
      guest: new Agent(),
      admin: new Agent( adminCookie, config.adminUser.username, config.adminUser.password, config.adminUser.email ),
      user1: null,
      user2: null
    };

    await createUser( 'user1', 'password', 'user1@test.com' );
    await createUser( 'user2', 'password', 'user2@test.com' );

  }
  catch ( exp ) {
    console.log( exp.toString() )
    process.exit();
  }
}

exports.initialize = initialize;