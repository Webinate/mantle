const AuthPage = require( '../pages/auth.js' );
const assert = require( 'assert' );
let auth = new AuthPage();

describe( '2. Test register validation', function() {

  before( async () => {
    await auth.load( false );
  } )


  it( 'it should show the register form', async () => {
    assert( await auth.$( '.register-form' ) );
  } );


  it( 'it should not allow empty registration input', async () => {

    assert.equal( await auth.username(), '' );
    assert.equal( await auth.password(), '' );
    assert.equal( await auth.password2(), '' );
    assert.equal( await auth.usernameError(), null );
    assert.equal( await auth.emailError(), null );
    assert.equal( await auth.passwordError(), null );
    assert.equal( await auth.password2Error(), null );

    await auth.clickRegister();

    assert.equal( await auth.usernameError(), 'Please specify a username' );
    assert.equal( await auth.passwordError(), 'Please specify a password' );
    assert.equal( await auth.emailError(), 'Please specify an email' );
    assert.equal( await auth.password2Error(), null );

    // Select user and type something and the error must vanish
    await auth.username( 'some-username' );
    assert.equal( await auth.usernameError(), null );

    // Select password and type something and the error must vanish
    await auth.password( 'somepassword' );
    assert.equal( await auth.passwordError(), null );
    assert.equal( await auth.password2Error(), 'Passwords do not match' );

    await auth.password2( 'somepassword' );
    assert.equal( await auth.password2Error(), null );

    await auth.email( 'test@test.com' );
    assert.equal( await auth.emailError(), null );

    //If we clear the fields, the errors should return
    await auth.password( '' );
    await auth.password2( '' );
    await auth.username( '' );
    await auth.email( '' );
    assert.equal( await auth.passwordError(), 'Please specify a password' );
    assert.equal( await auth.usernameError(), 'Please specify a username' );
    assert.equal( await auth.emailError(), 'Please specify an email' );
    assert.equal( await auth.password2Error(), null );
  } );
} );