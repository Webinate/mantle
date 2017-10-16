const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '3. Login failures', function() {

  before( async () => {
    await auth.load();
  } )

  it( 'it should show the login widget', async () => {
    assert( await auth.$( '.login-form' ) );
  } );


  it( 'it should not allow non-alphanumeric usernames', async () => {
    await auth.username( 'MRIDONTEXISTEVER123!' );
    await auth.password( 'THISISFAKE' );
    await auth.clickLogin();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'Please only use alpha numeric characters for your username' );
  } );

  it( 'it should not allow non user logins', async () => {
    await auth.username( 'MRIDONTEXISTEVER123' );
    await auth.password( 'THISISFAKE' );
    await auth.clickLogin();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'The username or password is incorrect.' );
  } );

  it( 'it should not allow a wrong password', async () => {
    await auth.username( auth.config.adminUser.username );
    await auth.password( 'THISISFAKE' );
    await auth.clickLogin();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'The username or password is incorrect.' )
  } );

  it( 'it should not allow a wrong password - using an email for username', async () => {
    await auth.username( auth.config.adminUser.email );
    await auth.password( 'THISISFAKE' );
    await auth.clickLogin();
    await auth.doneLoading();
    assert.equal( await auth.error(), 'The username or password is incorrect.' )
  } );

  it( 'it should not allow you to go to /dashboard when not logged in', async () => {
    await auth.to( '/dashboard' );
    await auth.waitFor( '.login-form' );
    assert.equal( await auth.pathname(), '/login' );
  } );

  it( 'it should allow you to go to /register when not logged in', async () => {
    await auth.to( '/register' );
    await auth.waitFor( '.register-form' );
  } );
} );