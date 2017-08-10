const test = require( 'unit.js' );
let guest, admin, config, user1,
  testUserName = 'fancyUser123',
  testUserEmail = 'fancyUser123@fancy.com';

describe( 'Testing creating a user', function() {

  before( function() {
    const header = require( '../header.js' );
    guest = header.users.guest;
    admin = header.users.admin;
    user1 = header.users.user1;
    config = header.config;
  } )

  it( `did remove any existing user called ${testUserName}`, function( done ) {
    admin
      .code( null )
      .delete( `/api/users/${testUserName}` )
      .then( res => {
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user without a username', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: "", password: "" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "Username cannot be empty" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user without a password', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: testUserName, password: "", email: testUserEmail } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "Password cannot be empty" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user with invalid characters', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: "!\"�$%^&*()", password: "password" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "Username must be alphanumeric" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user without email', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: testUserName, password: "password" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "Email cannot be empty" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user with invalid email', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: testUserName, password: "password", email: "gahgah" } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "Email must be valid" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user with invalid privilege', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 4 } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "Privilege type is unrecognised" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user with an existing username', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: admin.username, password: "password", email: testUserEmail, privileges: 2 } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "A user with that name or email already exists" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user with an existing email', function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: testUserName, password: "password", email: admin.email, privileges: 2 } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "A user with that name or email already exists" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( `did not create user ${testUserName} with super admin privileges`, function( done ) {
    admin
      .code( 500 )
      .post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 1 } )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "You cannot create a user with super admin permissions" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create a new user as a regular user', function( done ) {
    user1
      .code( 500 )
      .post( `/api/users` )
      .then( res => {
        test.object( res.body ).hasProperty( "message" )
        test.string( res.body.message ).is( "You don't have permission to make this request" )
        done();
      } ).catch( err => done( err ) );
  } )

  it( `did create regular user ${testUserName} with valid details`, function( done ) {
    admin.post( `/api/users`, { username: testUserName, password: "password", email: testUserEmail, privileges: 3 } )
      .then( res => {
        test.string( res.body.message ).is( `User ${testUserName} has been created` )
        userId = res.body.data._id;
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did not create an activation key for george', function( done ) {
    admin.get( `/api/users/${testUserName}?verbose=true` )
      .then( res => {
        test.object( res.body.data ).hasProperty( "registerKey" )
        test.string( res.body.data.registerKey ).is( "" );
        done();
      } ).catch( err => done( err ) );
  } )

  it( 'did cleanup the created user', function( done ) {
    admin.delete( `/api/users/${testUserName}` )
      .then( res => {
        test.string( res.body.message ).is( `User ${testUserName} has been removed` )
        done();
      } ).catch( err => done( err ) );
  } )
} )