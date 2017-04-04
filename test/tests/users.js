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


describe( 'Testing user API functions', function() {

    // describe( 'Checking basic authentication', function() {
    //     it( 'should not be logged in', function( done ) {
    //         manager.get( '/auth/authenticated', null )
    //             .then( res => {
    //                 test.bool( res.body.error ).isNotTrue()
    //                 test.bool( res.body.authenticated ).isNotTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 20000 )
    // } )

    // describe( 'Checking login with admin user', function() {

    //     it( 'did not log in with empty credentials', function( done ) {
    //         manager.post( '/auth/login', { username: "", password: "" }, null )
    //             .then( res => {
    //                 test.bool( res.body.error ).isTrue()
    //                 test.bool( res.body.authenticated ).isNotTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 done();
    //             } ).catch( err => done( err ) );
    //     } ).timeout( 20000 )

    //     it( 'did not log in with bad credentials', function( done ) {
    //         manager.post( '/auth/login', { username: "$%^\}{}\"&*[]@~�&$", password: "$%^&*�&@#`{}/\"�%\"$" }, null )
    //             .then( res => {
    //                 test.bool( res.body.error ).isTrue()
    //                 test.bool( res.body.authenticated ).isNotTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 20000 )

    //     it( 'did not log in with false credentials', function( done ) {
    //         manager.post( '/auth/login', { username: "GeorgeTheTwat", password: "FakePass" }, null )
    //             .then( res => {
    //                 test.bool( res.body.error ).isTrue()
    //                 test.bool( res.body.authenticated ).isNotTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 20000 )

    //     it( 'did not log in with a valid username but invalid password', function( done ) {
    //         manager.post( '/auth/login', { username: manager.config.adminUser.username, password: "FakePass" }, null )
    //             .then( res => {
    //                 test.bool( res.body.error ).isTrue()
    //                 test.bool( res.body.authenticated ).isNotTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 25000 )

    //     it( 'did log in with a valid username & valid password', function( done ) {
    //         manager.post( '/auth/login', { username: manager.config.adminUser.username, password: manager.config.adminUser.password }, null )
    //             .then( res => {
    //                 manager.updateCookieToken( 'admin', res );
    //                 test.bool( res.body.error ).isNotTrue()
    //                 test.bool( res.body.authenticated ).isTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 25000 )
    // } )

    // describe( 'Checking authentication with cookie', function() {
    //     it( 'should be logged in with hidden user details', function( done ) {
    //         manager.get( '/auth/authenticated' )
    //             .then( res => {
    //                 test.bool( res.body.error ).isNotTrue()
    //                 test.bool( res.body.authenticated ).isTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 test.object( res.body ).hasProperty( "user" )
    //                 test.string( res.body.user._id )
    //                 test.value( res.body.user.email ).isUndefined()
    //                 test.number( res.body.user.lastLoggedIn ).isNotNaN()
    //                 test.number( res.body.user.createdOn ).isNotNaN()
    //                 test.value( res.body.user.password ).isUndefined()
    //                 test.value( res.body.user.registerKey ).isUndefined()
    //                 test.value( res.body.user.sessionId ).isUndefined()
    //                 test.string( res.body.user.username ).is( manager.config.adminUser.username )
    //                 test.number( res.body.user.privileges ).is( 1 )
    //                 test.value( res.body.user.passwordTag ).isUndefined()
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 20000 )

    //     it( 'should be logged in with visible user details', function( done ) {
    //         manager.get( '/auth/authenticated?verbose=true' )
    //             .then( res => {
    //                 test.bool( res.body.error ).isNotTrue()
    //                 test.bool( res.body.authenticated ).isTrue()
    //                 test.object( res.body ).hasProperty( "message" )
    //                 test.object( res.body ).hasProperty( "user" )
    //                 test.string( res.body.user._id )
    //                 test.string( res.body.user.email ).is( manager.config.adminUser.email )
    //                 test.number( res.body.user.lastLoggedIn ).isNotNaN()
    //                 test.number( res.body.user.createdOn ).isNotNaN()
    //                 test.value( res.body.user.password )
    //                 test.value( res.body.user.registerKey )
    //                 test.value( res.body.user.sessionId )
    //                 test.string( res.body.user.username ).is( manager.config.adminUser.username )
    //                 test.number( res.body.user.privileges ).is( 1 )
    //                 test.value( res.body.user.passwordTag )
    //                 done();
    //             } ).catch( err => done( err ) );

    //     } ).timeout( 20000 )
    // } )

    describe( 'Getting user data with admin cookie', function() {
        // it( 'should get admin user without details', function( done ) {
        //     manager.get( `/users/${manager.config.adminUser.username}` )
        //         .then( res => {
        //             test.bool( res.body.error ).isNotTrue()
        //             test.object( res.body ).hasProperty( "message" )
        //             test.object( res.body ).hasProperty( "data" )
        //             test.string( res.body.data._id )
        //             test.value( res.body.data.email ).isUndefined()
        //             test.number( res.body.data.lastLoggedIn ).isNotNaN()
        //             test.value( res.body.data.password ).isUndefined()
        //             test.value( res.body.data.registerKey ).isUndefined()
        //             test.value( res.body.data.sessionId ).isUndefined()
        //             test.string( res.body.data.username ).is( manager.config.adminUser.username )
        //             test.number( res.body.data.privileges ).is( 1 )
        //             test.value( res.body.data.passwordTag ).isUndefined()
        //             done();
        //         } ).catch( err => done( err ) );

        // } ).timeout( 20000 )

        // it( 'should get admin user with details', function( done ) {
        //     manager.get( `/users/${manager.config.adminUser.username}?verbose=true` )
        //         .then( res => {
        //             test.bool( res.body.error ).isNotTrue()
        //             test.object( res.body ).hasProperty( "message" )
        //             test.object( res.body ).hasProperty( "data" )
        //             test.string( res.body.data._id )
        //             test.string( res.body.data.email ).is( manager.config.adminUser.email )
        //             test.number( res.body.data.lastLoggedIn ).isNotNaN()
        //             test.value( res.body.data.password )
        //             test.value( res.body.data.registerKey )
        //             test.value( res.body.data.sessionId )
        //             test.string( res.body.data.username ).is( manager.config.adminUser.username )
        //             test.number( res.body.data.privileges ).is( 1 )
        //             test.value( res.body.data.passwordTag )
        //             done();
        //         } ).catch( err => done( err ) );

        // } ).timeout( 20000 )

        // it( 'should get admin user by email without details', function( done ) {
        //     manager.get( `/users/${manager.config.adminUser.email}` )
        //         .then( res => {
        //             test.bool( res.body.error ).isNotTrue()
        //             test.object( res.body ).hasProperty( "message" )
        //             test.object( res.body ).hasProperty( "data" )
        //             test.string( res.body.data._id )
        //             test.value( res.body.data.email ).isUndefined()
        //             test.number( res.body.data.lastLoggedIn ).isNotNaN()
        //             test.value( res.body.data.password ).isUndefined()
        //             test.value( res.body.data.registerKey ).isUndefined()
        //             test.value( res.body.data.sessionId ).isUndefined()
        //             test.string( res.body.data.username ).is( manager.config.adminUser.username )
        //             test.number( res.body.data.privileges ).is( 1 )
        //             test.value( res.body.data.passwordTag ).isUndefined()
        //             done();
        //         } ).catch( err => done( err ) );

        // } ).timeout( 20000 )

        // it( 'should get admin user by email with details', function( done ) {
        //     manager.get( `/users/${manager.config.adminUser.email}?verbose=true` )
        //         .then( res => {
        //             test.bool( res.body.error ).isNotTrue()
        //             test.object( res.body ).hasProperty( "message" )
        //             test.object( res.body ).hasProperty( "data" )
        //             test.string( res.body.data._id )
        //             test.string( res.body.data.email ).is( manager.config.adminUser.email )
        //             test.number( res.body.data.lastLoggedIn ).isNotNaN()
        //             test.value( res.body.data.password )
        //             test.value( res.body.data.registerKey )
        //             test.value( res.body.data.sessionId )
        //             test.value( res.body.data.passwordTag )
        //             test.string( res.body.data.username ).is( manager.config.adminUser.username )
        //             test.number( res.body.data.privileges ).is( 1 )
        //             done();
        //         } ).catch( err => done( err ) );

        // } ).timeout( 20000 )

        it( 'did set user meta data of myself', function( done ) {
            manager.post( `/users/${manager.config.adminUser.username}/meta`, { value: { sister: "sam", brother: "mat" } } )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "User's data has been updated" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did get user meta "sister"', function( done ) {
            manager.get( `/users/${manager.config.adminUser.username}/meta/sister` )
                .then( res => {
                    test.string( res.body ).is( "sam" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did get user meta "brother"', function( done ) {
            manager.get( `/users/${manager.config.adminUser.username}/meta/brother` )
                .then( res => {
                    test.string( res.body ).is( "mat" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did update user meta "brother" to john', function( done ) {
            manager.post( `/users/${manager.config.adminUser.username}/meta/brother`, { value: "john" } )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Value 'brother' has been updated" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did get user meta "brother" and its john', function( done ) {
            manager.get( `/users/${manager.config.adminUser.username}/meta/brother` )
                .then( res => {
                    test.string( res.body ).is( "john" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did set clear all user data', function( done ) {
            manager.post( `/users/${manager.config.adminUser.username}/meta`, {} )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "User's data has been updated" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )

    describe( 'Logging out', function() {
        it( 'should log out', function( done ) {
            manager.get( `/auth/logout` )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.object( res.body ).hasProperty( "message" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )

    describe( 'Checking authentication with stale session', function() {
        it( 'should veryify logged out', function( done ) {
            manager.get( `/auth/authenticated` )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.bool( res.body.authenticated ).isNotTrue()
                    test.object( res.body ).hasProperty( "message" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )

    describe( 'When not logged in', function() {
        // it( 'should get no user with username', function( done ) {
        //     manager.get( `/users/${manager.config.adminUser.username}` )
        //         .then( res => {
        //             test.object( res.body ).hasProperty( "message" )
        //             test.bool( res.body.error ).isTrue()
        //             test.string( res.body.message ).is( "You must be logged in to make this request" )
        //             done();
        //         } ).catch( err => done( err ) );

        // } ).timeout( 20000 )

        // it( 'should get no user with email or verbose', function( done ) {
        //     manager.get( `/users/${manager.config.adminUser.email}?verbose=true` )
        //         .then( res => {
        //             test.object( res.body ).hasProperty( "message" )
        //             test.bool( res.body.error ).isTrue()
        //             test.string( res.body.message ).is( "You must be logged in to make this request" )
        //             done();
        //         } ).catch( err => done( err ) );

        // } ).timeout( 20000 )

        it( 'should get no sessions', function( done ) {
            manager.get( `/sessions` )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" )
                    test.bool( res.body.error ).isTrue()
                    test.string( res.body.message ).is( "You must be logged in to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not be able to create a new user', function( done ) {
            manager.post( `/users`, { username: "George", password: "Password", email: "george@webinate.net", privileges: 1 } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You must be logged in to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not be able to get user meta data', function( done ) {
            manager.get( `/users/${manager.config.adminUser.username}/meta/datum` )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You must be logged in to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

    } )

    describe( 'Registering as a new user', function() {
        it( 'should not register with blank credentials', function( done ) {
            manager.post( `/auth/register`, { username: "", password: "" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Please enter a valid username" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not register with existing username', function( done ) {
            manager.post( `/auth/register`, { username: manager.config.adminUser.username, password: "FakePass" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "That username or email is already in use; please choose another or login." )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not register with blank username', function( done ) {
            manager.post( `/auth/register`, { username: "", password: "FakePass" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Please enter a valid username" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not register with blank password', function( done ) {
            manager.post( `/auth/register`, { username: "sdfsdsdfsdfdf", password: "" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Password cannot be null or empty" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not register with bad characters', function( done ) {
            manager.post( `/auth/register`, { username: "!\"�$%^^&&*()-=~#}{}", password: "!\"./<>;�$$%^&*()_+" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Please only use alpha numeric characters for your username" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not register with valid information but no email', function( done ) {
            manager.post( `/auth/register`, { username: "George", password: "Password" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Email cannot be null or empty" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'should not register with valid information but invalid email', function( done ) {
            manager.post( `/auth/register`, { username: "George", password: "Password", email: "bad_email" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Please use a valid email address" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )

    describe( 'Create a new user when logged in as admin', function() {

        it( 'did log in with an admin username & valid password', function( done ) {
            manager.post( `/auth/login`, { username: manager.config.adminUser.username, password: manager.config.adminUser.password }, null )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.bool( res.body.authenticated ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    manager.updateCookieToken( 'admin', res );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )



        it( 'did not create a new user without a username', function( done ) {
            manager.post( `/auth/register`, { username: "", password: "" }, null )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Please enter a valid username" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user without a password', function( done ) {
            manager.post( `/users`, { username: "george", password: "", email: "thisisatest@test.com" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Password cannot be empty" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user with invalid characters', function( done ) {
            manager.post( `/users`, { username: "!\"�$%^&*()", password: "password" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Username must be alphanumeric" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user without email', function( done ) {
            manager.post( `/users`, { username: "george", password: "password" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Email cannot be empty" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user with invalid email', function( done ) {
            manager.post( `/users`, { username: "george", password: "password", email: "matmat" } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Email must be valid" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user with invalid privilege', function( done ) {
            manager.post( `/users`, { username: "george", password: "password", email: "matmat@yahoo.com", privileges: 4 } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Privilege type is unrecognised" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user with an existing username', function( done ) {
            manager.post( `/users`, { username: manager.config.adminUser.username, password: "password", email: "matmat@yahoo.com", privileges: 2 } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "A user with that name or email already exists" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user with an existing email', function( done ) {
            manager.post( `/users`, { username: "george", password: "password", email: manager.config.adminUser.email, privileges: 2 } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "A user with that name or email already exists" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create user george with super admin privileges', function( done ) {
            manager.post( `/users`, { username: "george", password: "password", email: "thisisatest@test.com", privileges: 1 } )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You cannot create a user with super admin permissions" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did create regular user george with valid details', function( done ) {
            manager.post( `/users`, { username: "george", password: "password", email: "thisisatest@test.com", privileges: 3 } )
                .then( res => {
                    test.string( res.body.message ).is( "User george has been created" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 16000 )

        it( 'should get george when searching all registered users', function( done ) {
            manager.get( `/users?search=george`, null )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Found 1 users" )
                    test.bool( res.body.error ).isFalse()
                    test.value( res.body.data[ 0 ].password ).isUndefined()
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did create another regular user george2 with valid details', function( done ) {
            manager.post( `/users`, { username: "george2", password: "password", email: "thisisatest2@test.com", privileges: 3 } )
                .then( res => {
                    test.string( res.body.message ).is( "User george2 has been created" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 16000 )

        it( 'did create an activation key for george', function( done ) {
            manager.get( `/users/george?verbose=true` )
                .then( res => {
                    test.object( res.body.data ).hasProperty( "registerKey" )
                    activation = res.body.data.registerKey
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did activate george2 through the admin', function( done ) {
            manager.put( `/auth/george2/approve-activation`, {} )
                .then( res => {
                    test.bool( res.body.error ).isFalse()
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'admin did logout', function( done ) {
            manager.get( `/auth/logout` )
                .then( res => {
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )

    describe( 'Checking user login with activation code present', function() {

        it( 'did not log in with an activation code present', function( done ) {
            manager.post( `/auth/login`, { username: "george", password: "password" }, null )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.bool( res.body.authenticated ).isFalse()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "Please authorise your account by clicking on the link that was sent to your email" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not resend an activation with an invalid user', function( done ) {
            manager.get( `/auth/NONUSER5/resend-activation`, null )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "No user exists with the specified details" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did resend an activation email with a valid user', function( done ) {
            manager.get( `/auth/george/resend-activation`, null )
                .then( res => {
                    test.bool( res.body.error ).isFalse()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "An activation link has been sent, please check your email for further instructions" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 16000 )

        it( 'did not activate with an invalid username', function( done ) {
            manager.get( `/auth/activate-account?user=NONUSER`, null, 302 )
                .then( res => {
                    test.string( res.headers[ "location" ] ).contains( "error" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not activate with an valid username and no key', function( done ) {
            manager.get( `/auth/activate-account?user=george`, null, 302 )
                .then( res => {
                    test.string( res.headers[ "location" ] ).contains( "error" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not activate with an valid username and invalid key', function( done ) {
            manager.get( `/auth/activate-account?user=george&key=123`, null, 302 )
                .then( res => {
                    test.string( res.headers[ "location" ] ).contains( "error" )

                    // We need to get the new key - so we log in as admin, get the user details and then log out again
                    // Login as admin
                    return manager.post( `/auth/login`, { username: manager.config.adminUser.username, password: manager.config.adminUser.password } );

                } ).then( function( res ) {
                    manager.updateCookieToken( 'admin', res );
                    return manager.get( `/users/george?verbose=true` );

                } ).then( function( res ) {
                    activation = res.body.data.registerKey;
                    done();

                } ).catch( err => done( err ) );

        } ).timeout( 30000 )

        it( 'did activate with a valid username and key', function( done ) {
            manager.get( `/auth/activate-account?user=george&key=${activation}`, null, 302 )
                .then( res => {
                    test.string( res.headers[ "location" ] ).contains( "success" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did log in with valid details and an activated account', function( done ) {
            manager.post( `/auth/login`, { username: "george", password: "password" }, null )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.bool( res.body.authenticated ).isNotFalse()
                    test.object( res.body ).hasProperty( "message" )
                    manager.updateCookieToken( 'george', res );
                    done();
                } ).catch( err => done( err ) );

        } )
    } ).timeout( 20000 )

    describe( 'Getting/Setting data when a regular user', function() {

        it( 'did not get details of the admin user (no permission)', function( done ) {
            manager.get( `/users/${manager.config.adminUser.username}?verbose=true`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You don't have permission to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not get sessions (no permission)', function( done ) {
            manager.get( `/sessions`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You don't have permission to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not remove the admin user (no permission)', function( done ) {
            manager.delete( `/users/${manager.config.adminUser.username}`, null, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You don't have permission to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not approve activation (no permission)', function( done ) {
            manager.put( `/auth/${manager.config.adminUser.username}/approve-activation`, null, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You don't have permission to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a new user (no permission)', function( done ) {
            manager.post( `/users`, null, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "You don't have permission to make this request" )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did get user data of myself', function( done ) {
            manager.get( `/users/george?verbose=true`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    test.object( res.body ).hasProperty( "message" )
                    test.object( res.body ).hasProperty( "data" )
                    test.string( res.body.data._id )
                    test.string( res.body.data.email ).is( "thisisatest@test.com" )
                    test.number( res.body.data.lastLoggedIn ).isNotNaN()
                    test.value( res.body.data.password )
                    test.value( res.body.data.registerKey )
                    test.value( res.body.data.sessionId )
                    test.value( res.body.data.passwordTag )
                    test.string( res.body.data.username ).is( "george" )
                    test.number( res.body.data.privileges ).is( 3 )
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )
} )

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

describe( 'Checking media API', function() {

    describe( 'Getting/Setting data when a Regular user', function() {

        it( 'did not get stats for admin', function( done ) {
            manager.get( `/stats/users/${manager.config.adminUser.username}/get-stats`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not get buckets for admin', function( done ) {
            manager.get( `/buckets/user/${manager.config.adminUser.username}`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create stats for admin', function( done ) {
            manager.post( `/stats/create-stats/${manager.config.adminUser.username}`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage calls for admin', function( done ) {
            manager.put( `/stats/storage-calls/${manager.config.adminUser.username}/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage memory for admin', function( done ) {
            manager.put( `/stats/storage-memory/${manager.config.adminUser.username}/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage allocated calls for admin', function( done ) {
            manager.put( `/stats/storage-allocated-calls/${manager.config.adminUser.username}/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage allocated memory for admin', function( done ) {
            manager.put( `/stats/storage-allocated-memory/${manager.config.adminUser.username}/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage calls for itself', function( done ) {
            manager.put( `/stats/storage-calls/george/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage memory for itself', function( done ) {
            manager.put( `/stats/storage-memory/george/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage allocated calls for itself', function( done ) {
            manager.put( `/stats/storage-allocated-calls/george/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create storage allocated memory for itself', function( done ) {
            manager.put( `/stats/storage-allocated-memory/george/90000`, {}, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did get stats for itself', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.string( res.body.message ).is( "Successfully retrieved george's stats" );
                    test.bool( res.body.error ).isNotTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "data" );
                    test.object( res.body.data ).hasProperty( "_id" );
                    test.string( res.body.data.user ).is( "george" );
                    test.number( res.body.data.apiCallsAllocated ).is( 20000 );
                    test.number( res.body.data.memoryAllocated ).is( 500000000 );
                    test.number( res.body.data.apiCallsUsed ).is( 1 );
                    test.number( res.body.data.memoryUsed ).is( 0 );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did get buckets for itself', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue();
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "data" );
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not get files for another user\'s bucket', function( done ) {
            manager.get( `/files/users/${manager.config.adminUser.username}/buckets/BAD_ENTRY`, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not get files for a non existant bucket', function( done ) {
            manager.get( `/files/users/george/buckets/test`, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Could not find the bucket 'test'" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a bucket for another user', function( done ) {
            manager.post( `/buckets/user/${manager.config.adminUser.username} + "/test`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "You don't have permission to make this request" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a bucket with bad characters', function( done ) {
            manager.post( `/buckets/user/george/�BAD!CHARS`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Please only use safe characters" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did create a new bucket called dinosaurs', function( done ) {
            manager.post( `/buckets/user/george/dinosaurs`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Bucket 'dinosaurs' created" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not create a bucket with the same name as an existing one', function( done ) {
            manager.post( `/buckets/user/george/dinosaurs`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "A Bucket with the name 'dinosaurs' has already been registered" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );
        } )

        it( 'did create a bucket with a different name', function( done ) {
            manager.post( `/buckets/user/george/dinosaurs2`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Bucket 'dinosaurs2' created" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not delete any buckets when the name is wrong', function( done ) {
            manager.delete( `/buckets/dinosaurs3,dinosaurs4`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Removed [0] buckets" );
                    test.array( res.body.data ).isEmpty();
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );
        } )

        it( 'did get the 2 buckets for george', function( done ) {
            manager.get( `/buckets/user/george`, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Found [3] buckets" );
                    test.array( res.body.data ).hasLength( 3 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not upload a file to a bucket that does not exist', function( done ) {
            manager.agent
                .post( "/buckets/dinosaurs3/upload" ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .attach( '"�$^&&', filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "tokens" );
                    test.string( res.body.message ).is( "No bucket exists with the name 'dinosaurs3'" );
                    test.array( res.body.tokens ).hasLength( 0 );
                    test.bool( res.body.error ).isTrue();
                    done()
                } );
        } ).timeout( 20000 )

        it( 'did upload a file to dinosaurs', function( done ) {
            manager.agent
                .post( "/buckets/dinosaurs/upload" ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .attach( 'small-image', filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "tokens" );
                    test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                    test.array( res.body.tokens ).hasLength( 1 );
                    test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                    test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                    test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                    test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                    test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } );
        } ).timeout( 20000 )

        it( 'did not upload a file when the meta was invalid', function( done ) {
            manager.agent
                .post( "/buckets/dinosaurs/upload" ).set( 'content-type', 'application/x-www-form-urlencoded' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .field( 'meta', 'BAD META' )
                .attach( 'small-image', filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "tokens" );
                    test.string( res.body.message ).is( "Error: Meta data is not a valid JSON: SyntaxError: Unexpected token B in JSON at position 0" );
                    test.array( res.body.tokens ).hasLength( 0 );
                    test.bool( res.body.error ).isTrue();
                    done();
                } );
        } ).timeout( 20000 )

        it( 'did not upload a file when the meta was invalid', function( done ) {
            manager.agent
                .post( "/buckets/dinosaurs/upload" ).set( 'content-type', 'application/x-www-form-urlencoded' ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .field( 'meta', '{ "meta" : "good" }' )
                .attach( 'small-image', filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "tokens" );
                    test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                    test.array( res.body.tokens ).hasLength( 1 );
                    test.bool( res.body.error ).isFalse();
                    done();
                } );
        } ).timeout( 20000 )

        it( 'fetched the files of the dinosaur bucket', function( done ) {
            manager.agent
                .get( "/files/users/george/buckets/dinosaurs" ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .attach( 'small-image', filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );
                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "data" );
                    test.string( res.body.message ).is( "Found [2] files" );
                    test.array( res.body.data ).hasLength( 2 );
                    test.number( res.body.data[ 0 ].numDownloads ).is( 0 );
                    test.number( res.body.data[ 0 ].size ).is( 226 );
                    test.string( res.body.data[ 0 ].mimeType ).is( "image/png" );
                    test.string( res.body.data[ 0 ].user ).is( "george" );
                    test.object( res.body.data[ 0 ] ).hasProperty( "publicURL" );
                    test.bool( res.body.data[ 0 ].isPublic ).isTrue();
                    test.object( res.body.data[ 0 ] ).hasProperty( "identifier" );
                    test.object( res.body.data[ 0 ] ).hasProperty( "bucketId" );
                    test.object( res.body.data[ 0 ] ).hasProperty( "created" );
                    test.string( res.body.data[ 0 ].bucketName ).is( "dinosaurs" );
                    test.object( res.body.data[ 0 ] ).hasProperty( "_id" );

                    // Check the second files meta
                    test.object( res.body.data[ 1 ] ).hasProperty( "meta" );
                    test.string( res.body.data[ 1 ].meta.meta ).is( "good" );

                    fileId = res.body.data[ 0 ].identifier;
                    publicURL = res.body.data[ 0 ].publicURL;
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } );
        } ).timeout( 20000 )

        it( 'did not make a non-file public', function( done ) {
            manager.put( `/files/123/make-public`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "File '123' does not exist" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } )

        it( 'did not make a non-file private', function( done ) {
            manager.put( `/files/123/make-private`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" )
                    test.string( res.body.message ).is( "File '123' does not exist" )
                    test.bool( res.body.error ).isTrue()
                    done()
                } ).catch( err => done( err ) );
        } )

        it( 'did make a file public', function( done ) {
            manager.put( `/files/${fileId}/make-public`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "File is now public" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did download the file off the bucket', function( done ) {
            test.httpAgent( publicURL )
                .get( "" ).expect( 200 ).expect( 'content-type', /image/ )
                .end( function( err, res ) {
                    if ( err ) return done( err );
                    done();
                } );
        } )

        it( 'did make a file private', function( done ) {
            manager.put( `/files/${fileId}/make-private`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "File is now private" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'updated its stats accordingly', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.number( res.body.data.apiCallsUsed ).is( 9 );
                    test.number( res.body.data.memoryUsed ).is( 226 * 2 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did upload another file to dinosaurs2', function( done ) {
            manager.agent
                .post( "/buckets/dinosaurs2/upload" ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .attach( 'small-image',filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );

                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "tokens" );
                    test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                    test.array( res.body.tokens ).hasLength( 1 );
                    test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                    test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                    test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                    test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                    test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } );
        } ).timeout( 20000 )

        it( 'updated its stats with the 2nd upload accordingly', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.number( res.body.data.apiCallsUsed ).is( 10 );
                    test.number( res.body.data.memoryUsed ).is( 226 * 3 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not download a file with an invalid id anonomously', function( done ) {
            manager.get( `/files/123/download`, null, 404 )
                .then( res => {
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did download an image file with a valid id anonomously', function( done ) {
            manager.agent
                .get( "/files/" + fileId + "/download" ).expect( 200 ).expect( 'Content-Type', /image/ ).expect( 'Content-Length', "226" )
                .end( function( err, res ) {
                    //if (err) return done(err);
                    done();
                } );
        } ).timeout( 20000 )

        it( 'did update the api calls to 5', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.number( res.body.data.apiCallsUsed ).is( 11 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did upload another file to dinosaurs2', function( done ) {
            manager.agent
                .post( "/buckets/dinosaurs2/upload" ).set( 'Accept', 'application/json' ).expect( 200 ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', manager.cookies.george )
                .attach( 'small-image', filePath )
                .end( function( err, res ) {
                    if ( err ) return done( err );

                    test.object( res.body ).hasProperty( "message" );
                    test.object( res.body ).hasProperty( "tokens" );
                    test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                    test.array( res.body.tokens ).hasLength( 1 );
                    test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                    test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                    test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                    test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                    test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } );

        } ).timeout( 20000 )

        it( 'fetched the uploaded file Id of the dinosaur2 bucket', function( done ) {
            manager.get( `/files/users/george/buckets/dinosaurs2`, 'george' )
                .then( res => {
                    test.bool( res.body.error ).isNotTrue()
                    fileId = res.body.data[ 1 ].identifier;
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not rename an incorrect file to testy', function( done ) {
            manager.put( `/files/123/rename-file`, { name: "testy" }, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "File '123' does not exist" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not rename a correct file with an empty name', function( done ) {
            manager.put( `/files/${fileId}/rename-file`, { name: "" }, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Please specify the new name of the file" );
                    test.bool( res.body.error ).isTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did rename a correct file to testy', function( done ) {
            manager.put( `/files/${fileId}/rename-file`, { name: "testy" }, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Renamed file to 'testy'" );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not remove a file from dinosaurs2 with a bad id', function( done ) {
            manager.delete( `/files/123`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Removed [0] files" );
                    test.array( res.body.data ).hasLength( 0 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did remove a file from dinosaurs2 with a valid id', function( done ) {
            manager.delete( `/files/${fileId}`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Removed [1] files" );
                    test.array( res.body.data ).hasLength( 1 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'updated its stats to reflect a file was deleted', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.number( res.body.data.apiCallsUsed ).is( 14 );
                    test.number( res.body.data.memoryUsed ).is( 226 * 3 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did not remove a bucket with a bad name', function( done ) {
            manager.delete( `/buckets/123`, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Removed [0] buckets" );
                    test.array( res.body.data ).hasLength( 0 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'did remove the bucket dinosaurs2', function( done ) {
            manager.delete( `/buckets/dinosaurs2`, {}, 'george' )
                .then( res => {
                    test.object( res.body ).hasProperty( "message" );
                    test.string( res.body.message ).is( "Removed [1] buckets" );
                    test.array( res.body.data ).hasLength( 1 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )

        it( 'updated its stats that both a file and bucket were deleted', function( done ) {
            manager.get( `/stats/users/george/get-stats`, 'george' )
                .then( res => {
                    test.number( res.body.data.apiCallsUsed ).is( 16 );
                    test.number( res.body.data.memoryUsed ).is( 226 * 2 );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )

    describe( 'Checking permission data for another regular user', function() {

        it( 'did log in with valid details for george2', function( done ) {
            manager.post( `/auth/login`, { username: "george2", password: "password" }, null )
                .then( res => {
                    test.bool( res.body.authenticated ).isNotFalse();
                    test.object( res.body ).hasProperty( "message" );
                    manager.updateCookieToken( "george2", res );
                    test.bool( res.body.error ).isNotTrue();
                    done();
                } ).catch( err => done( err ) );

        } ).timeout( 20000 )
    } )
} )

describe( 'Cleaning up', function() {

    it( 'We did log in as admin', function( done ) {
        manager.post( `/auth/login`, { username: manager.config.adminUser.username, password: manager.config.adminUser.password } )
            .then( res => {
                manager.updateCookieToken( 'admin', res );
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'did remove any users called george', function( done ) {
        manager.delete( `/users/george`, {} )
            .then( res => {
                test.string( res.body.message ).is( "User george has been removed" );
                done();
            } ).catch( err => done( err ) );
    } ).timeout( 25000 )

    it( 'did remove any users called george2', function( done ) {
        manager.delete( `/users/george2`, {} )
            .then( res => {
                test.string( res.body.message ).is( "User george2 has been removed" );
                done();
            } ).catch( err => done( err ) );
    } ).timeout( 25000 )
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
