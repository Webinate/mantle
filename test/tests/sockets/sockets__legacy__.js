// TODO: THIS FILE NEEDS TO BE REMOVED!

const header = require( './header.js' );
const test = require( 'unit.js' );
const ws = require( 'ws' );

let adminCookie = '';
let georgeCookie = '';
let george2Cookie = '';
let activation = '';
let fileId = '';
let publicURL = '';
let wsClient;
const manager = header.TestManager.get;
const filePath = './test/media/file.png';

// A map of all web socket events
const socketEvents = {
  login: null,
  logout: null,
  activated: null,
  removed: null,
  fileUploaded: null,
  fileRemoved: null,
  bucketUploaded: null,
  bucketRemoved: null,
  metaRequest: null,
};

const numWSCalls = {
  login: 0,
  logout: 0,
  activated: 0,
  removed: 0,
  fileUploaded: 0,
  fileRemoved: 0,
  bucketUploaded: 0,
  bucketRemoved: 0,
  metaRequest: 0,
};

/**
 * This function catches all events from the web socket and stores them for later inspection
 */
function onWsEvent( data ) {

  const token = JSON.parse( data );

  if ( !token.type )
    throw new Error( "type does not exist on socket token" );

  switch ( token.type ) {
    case 'Login':
      socketEvents.login = token;
      numWSCalls.login++;
      break;
    case 'Logout':
      socketEvents.logout = token;
      numWSCalls.logout++;
      break;
    case 'Activated':
      socketEvents.activated = token;
      numWSCalls.activated++;
      break;
    case 'Removed':
      socketEvents.removed = token;
      numWSCalls.removed++;
      break;
    case 'FileUploaded':
      socketEvents.fileUploaded = token;
      numWSCalls.fileUploaded++;
      break;
    case 'FileRemoved':
      socketEvents.fileRemoved = token;
      numWSCalls.fileRemoved++;
      break;
    case 'BucketUploaded':
      socketEvents.bucketUploaded = token;
      numWSCalls.bucketUploaded++;
      break;
    case 'BucketRemoved':
      socketEvents.bucketRemoved = token;
      numWSCalls.bucketRemoved++;
      break;
    case 'MetaRequest':
      socketEvents.metaRequest = token;
      numWSCalls.metaRequest++;
      break;
  }
}

/** Empty listener to ensure the client isn't garbage collected */
function onSocketMessage( data, flags ) {
}

describe( 'Testing WS connectivity', function() {

  it( 'should not connect when the origin is not approved', function( done ) {

    const socketUrl = "ws://localhost:" + manager.config.websocket.port;
    wsClient = new ws( socketUrl, { headers: { origin: "badhost" } } );

    // Opens a stream to the users socket events
    wsClient.on( 'close', function() {
      wsClient.close();
      return done();
    } );
  } )

  it( 'connected to the users socket API', function( done ) {

    const socketUrl = "ws://localhost:" + manager.config.websocket.port;
    const options = { headers: { origin: "localhost" } };
    options.headers[ 'users-api-key' ] = manager.config.websocket.socketApiKey;

    wsClient = new ws( socketUrl, options );

    // Opens a stream to the users socket events
    wsClient.on( 'open', function() {
      wsClient.on( 'message', onSocketMessage );
      return done();
    } );

    // Report if there are any errors
    wsClient.on( 'error', function( err ) {
      return done( err );
    } );
  } )
} )

describe( 'Hook WS API events', function() {

  it( 'hooked all relevant events to (onWsEvent) event handler', function( done ) {
    wsClient.on( 'message', onWsEvent );
    done();
  } );
} );

describe( 'Testing WS API calls', function() {

  it( 'Cannot set meta data for unkown user', function( done ) {
    const onMessge = function( data ) {
      const response = JSON.parse( data );
      wsClient.removeListener( 'message', onMessge );
      test.string( response.error ).is( "Could not find user george3" )
      done();
    }

    wsClient.on( 'message', onMessge );
    wsClient.send( JSON.stringify( { type: "MetaRequest", val: { sister: "sam", brother: "mat" }, username: "george3" } ) );
  } );

  it( 'Can set meta data for user george', function( done ) {
    const onMessge = function( data ) {
      const response = JSON.parse( data );
      wsClient.removeListener( 'message', onMessge );
      test.string( response.val.sister ).is( "sam" )
      test.string( response.val.brother ).is( "mat" )
      done();
    }

    wsClient.on( 'message', onMessge );
    wsClient.send( JSON.stringify( { type: "MetaRequest", val: { sister: "sam", brother: "mat" }, username: "george" } ) );
  } );

  it( 'Can get meta data for user george', function( done ) {
    const onMessge = function( data ) {
      const response = JSON.parse( data );
      wsClient.removeListener( 'message', onMessge );
      test.string( response.val.sister ).is( "sam" )
      test.string( response.val.brother ).is( "mat" )
      done();
    }

    wsClient.on( 'message', onMessge );
    wsClient.send( JSON.stringify( { type: "MetaRequest", username: "george" } ) );
  } );

  it( 'Can set the meta property "brother" for user george', function( done ) {
    const onMessge = function( data ) {
      const response = JSON.parse( data );
      wsClient.removeListener( 'message', onMessge );
      test.string( response.val ).is( "George's brother" )
      done();
    }

    wsClient.on( 'message', onMessge );
    wsClient.send( JSON.stringify( { type: "MetaRequest", property: "brother", val: "George's brother", username: "george" } ) );
  } );

  it( 'Can get the meta property "brother" for user george', function( done ) {
    const onMessge = function( data ) {
      const response = JSON.parse( data );
      wsClient.removeListener( 'message', onMessge );
      test.string( response.val ).is( "George's brother" )
      done();
    }

    wsClient.on( 'message', onMessge );
    wsClient.send( JSON.stringify( { type: "MetaRequest", property: "brother", username: "george" } ) );
  } );
} )

describe( 'Test WS API events are valid', function() {

  it( 'has valid user event properties', function( done ) {
    test.object( socketEvents.login ).hasProperty( 'username' );
    test.object( socketEvents.logout ).hasProperty( 'username' );
    test.object( socketEvents.activated ).hasProperty( 'username' );
    done();
  } );

  it( 'has valid fileAdded event properties', function( done ) {
    test.object( socketEvents.fileUploaded ).hasProperty( 'username' );
    test.object( socketEvents.fileUploaded ).hasProperty( 'file' );
    done();
  } );

  it( 'has valid fileRemoved event properties', function( done ) {
    test.object( socketEvents.fileRemoved ).hasProperty( 'file' );
    done();
  } );

  it( 'has valid bucket added event properties', function( done ) {

    test.object( socketEvents.bucketUploaded ).hasProperty( 'username' );
    test.object( socketEvents.bucketUploaded ).hasProperty( 'bucket' );
    test.string( socketEvents.bucketUploaded.bucket.name );
    test.string( socketEvents.bucketUploaded.bucket.identifier );
    test.string( socketEvents.bucketUploaded.bucket.user );
    test.number( socketEvents.bucketUploaded.bucket.created );
    test.number( socketEvents.bucketUploaded.bucket.memoryUsed );
    test.string( socketEvents.bucketUploaded.bucket._id );
    done();
  } );

  it( 'has valid bucket removed event properties', function( done ) {
    test.object( socketEvents.bucketRemoved ).hasProperty( 'bucket' );
    test.string( socketEvents.bucketRemoved.bucket.name );
    test.string( socketEvents.bucketRemoved.bucket.identifier );
    test.string( socketEvents.bucketRemoved.bucket.user );
    test.number( socketEvents.bucketRemoved.bucket.created );
    test.number( socketEvents.bucketRemoved.bucket.memoryUsed );
    test.string( socketEvents.bucketRemoved.bucket._id );
    done();
  } );

  it( 'has the correct number of events registered', function( done ) {
    test.number( numWSCalls.login ).is( 6 );
    test.number( numWSCalls.logout ).is( 3 );
    test.number( numWSCalls.activated ).is( 2 );
    test.number( numWSCalls.bucketRemoved ).is( 4 );
    test.number( numWSCalls.bucketUploaded ).is( 4 );
    test.number( numWSCalls.fileRemoved ).is( 5 );
    test.number( numWSCalls.fileUploaded ).is( 4 );
    test.number( numWSCalls.metaRequest ).is( 5 );
    test.number( numWSCalls.removed ).is( 2 );
    done();
  } );
} )

describe( 'Cleaning up socket', function() {

  it( 'closed the sockets', function( done ) {

    if ( wsClient ) {
      wsClient.removeListener( 'message', onSocketMessage );
      wsClient.close();
      wsClient = null;
      wsClient2 = null;
    }
    done();
  } )
} )
