const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '1. Test login validation', function() {

  before( async () => {
    await auth.load();
  } )


  it( 'it should show the login widget', async () => {
    assert( await auth.$( '.login-form' ) );
  } );


  it( 'it should not allow empty user input', async () => {

    assert.equal( await auth.username(), '' );
    assert.equal( await auth.password(), '' );
    assert.equal( await auth.usernameError(), null );
    assert.equal( await auth.passwordError(), null );

    await auth.clickLogin();

    assert.equal( await auth.usernameError(), 'Please specify a username' );
    assert.equal( await auth.passwordError(), 'Please specify a password' );

    // Select user and type something and the error must vanish
    await auth.username( 'some-username' );
    assert.equal( await auth.usernameError(), null );

    // Select password and type something and the error must vanish
    await auth.password( 'somepassword' );
    assert.equal( await auth.passwordError(), null );

    //If we clear the fields, the errors should return
    await auth.password( '' );
    await auth.username( '' );
    assert.equal( await auth.passwordError(), 'Please specify a password' );
    assert.equal( await auth.usernameError(), 'Please specify a username' );
  } );


  it( 'it should switch from login to register and back', async () => {

    // Make sure we're on login
    assert( await auth.$( '.login-form' ) );
    assert( ( await auth.pathname() ).endsWith( '/login' ) )

    // Go to register
    await auth.clickCreateAccount();
    auth.waitFor( '.register-form' );
    assert( ( await auth.pathname() ).endsWith( '/register' ) );

    // Go back to login
    await auth.clickToLogin();
    auth.waitFor( '.login-form' );
    assert( ( await auth.pathname() ).endsWith( '/login' ) );
  } )


  it( 'it should not allow empty user input for sending activation', async () => {
    assert.equal( await auth.username(), '' );
    assert.equal( await auth.usernameError(), null );

    await auth.clickResendActivation();
    assert.equal( await auth.usernameError(), 'Please specify a username' );
  } );

  it( 'it should not allow empty user input for sending a password reset', async () => {
    await auth.page.reload();
    assert.equal( await auth.username(), '' );
    assert.equal( await auth.usernameError(), null );

    await auth.clickResetPassword();
    assert.equal( await auth.usernameError(), 'Please specify a username' );
  } );
} );