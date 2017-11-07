let test = require( 'unit.js' );
let fs = require( 'fs' );
let yargs = require( "yargs" );
const fetch = require( "node-fetch" );
const formData = require( 'form-data' );
let args = yargs.argv;

/**
 * Represents an agent that can make calls to the backend
 */
class Agent {
  constructor( host, cookie, username, password, email ) {
    this.host = host || "http://localhost:8000";
    this.cookie = cookie;
    this.username = username;
    this.password = password;
    this.email = email;
  }

  async get( url, type = 'application/json', options = {} ) {
    const headers = {};
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${this.host}${url}`, Object.assign( {}, { headers: headers }, options ) );
  }

  async put( url, data, type = 'application/json' ) {
    const headers = {};
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${this.host}${url}`, {
      method: 'PUT',
      headers: headers,
      body: type === 'application/json' ? JSON.stringify( data ) : data
    } );
  }

  async post( url, data, type = 'application/json', optionalHeaders = {} ) {
    const headers = Object.assign( {}, optionalHeaders );
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;



    return await fetch( `${this.host}${url}`, {
      method: 'POST',
      headers: headers,
      body: type === 'application/json' ? JSON.stringify( data ) : data
    } );
  }

  async delete( url, data, type = 'application/json' ) {
    const headers = {};
    if ( type )
      headers[ 'Content-Type' ] = type;
    if ( this.cookie )
      headers[ 'Cookie' ] = this.cookie;

    return await fetch( `${this.host}${url}`, {
      method: 'DELETE',
      headers: headers
    } );
  }

  /**
   * Updates the cookie of the agent
   * @param {string} response
   */
  updateCookie( response ) {
    this.cookie = response.headers.get( "set-cookie" ).split( ";" )[ 0 ];
  }
}

/**
 * Used to create a agent to test with
 * @param {string} url The host
 * @param {string} options Options for the agent
 */
function createAgent( url, options = {} ) {
  return new Agent( url, options.cookie, options.username, options.password, options.email );
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
  let response = await exports.users.admin.delete( `/api/users/${username}` );

  // Now create the user using the admin account
  response = await exports.users.admin.post( `/api/users`, { username: username, password: password, email: email, privileges: priviledge } );

  if ( response.status !== 200 )
    throw new Error( response.body );

  // User created, but not logged in
  const newAgent = new Agent( null, null, username, password, email );
  response = await newAgent.post( `/api/auth/login`, { username: username, password: password } );

  if ( response.status !== 200 )
    throw new Error( response.body );

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

    const host = "http://localhost:8000";
    const initAgent = new Agent( host );

    // const serverConfig = config.servers[ parseInt( args.server ) ];
    const resp = await initAgent.post( '/api/auth/login', { username: config.adminUser.username, password: config.adminUser.password } );
    const adminCookie = resp.headers.get( "set-cookie" ).split( ";" )[ 0 ];


    // Set the functions we want to expose
    exports.config = config;
    // exports.serverConfig = serverConfig;
    exports.createUser = createUser;
    exports.removeUser = removeUser;
    exports.createAgent = createAgent;
    exports.users = {
      guest: new Agent(),
      admin: new Agent( null, adminCookie, config.adminUser.username, config.adminUser.password, config.adminUser.email ),
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