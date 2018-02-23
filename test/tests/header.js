let test = require( 'unit.js' );
let fs = require( 'fs' );
let yargs = require( "yargs" );
const fetch = require( "node-fetch" );
const Agent = require( './agent' ).default;
const loadConfig = require( './load-config' ).default;
let args = yargs.argv;

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
  const newAgent = new Agent( "http://localhost:8000", null, username, password, email );
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
 * Initialize the manager
 */
async function initialize() {
  try {
    const config = loadConfig( args.config );

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
      guest: new Agent( "http://localhost:8000" ),
      admin: new Agent( "http://localhost:8000", adminCookie, config.adminUser.username, config.adminUser.password, config.adminUser.email ),
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