let test = require( 'unit.js' );
let fs = require( 'fs' );
let yargs = require( "yargs" );
let args = yargs.argv;

/**
 * Represents an agent that can make calls to the backend
 */
class Agent {
    constructor( cookie, username, password, email ) {
        this.agent = test.httpAgent( "http://" + exports.serverConfig.host + ":" + exports.serverConfig.portHTTP );
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

    setContentType(val) {
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
        return new Promise(( resolve, reject ) => {
            let req = null;
            if (type === 'post')
                req = this.agent.post( url );
            else if (type === 'delete')
                req = this.agent.delete( url );
            else if (type === 'put')
                req = this.agent.put( url );
            else
                req = this.agent.get( url );

            req.set( 'Accept', this._accepts );

            if ( this._setContentType )
                req.set( 'Accept', this._setContentType );

            if (this._code)
                req.expect( this._code )

            if (this._contentType)
                req.expect( 'Content-Type', this._contentType );

            if (data)
                req.send( data )

            if (this._fields)
                for ( let i in this._fields )
                    req.field( i, this._fields[i] )

            if (this._filePath)
                req.attach( this._fileName, this._filePath )

            if (this._contentLength)
                req.expect( 'Content-Length', this._contentLength )

            if ( this.cookie )
                req.set( 'Cookie', this.cookie )

            req.end(( err, res ) => {
                if ( err )
                    return reject( err );

                this.setDefaults()
                return ( resolve( res ) );
            } );
        });
    }

    post(url, data) {
        return this.go(url, data, 'post');
    }

    delete(url, data) {
        return this.go(url, data, 'delete');
    }

    put(url, data) {
        return this.go(url, data, 'put');
    }

    get(url, data) {
        return this.go(url );
    }
}

/**
 * A class for managing the tests
 */
class TestManager {

    /**
     * Creates an instance of the test manager
     */
    constructor() {
        TestManager._singleton = this;
        this.initialized = false;
        this.cookies = {
            admin: ''
        };

        this.config = JSON.parse( fs.readFileSync( args.config ) );
        const serverConfig = this.config.servers[ parseInt( args.server ) ];
        this.agent = test.httpAgent( "http://" + serverConfig.host + ":" + serverConfig.portHTTP );
    }

    post( url, json, who = 'admin', code = 200 ) {
        return new Promise(( resolve, reject ) => {
            this.agent.post( url )
                .set( 'Accept', 'application/json' )
                .expect( code ).expect( 'Content-Type', /json/ )
                .send( json )
                .set( 'Cookie', this.cookies[ who ] || '' )
                .end(( err, res ) => {
                    if ( err )
                        return reject( err );

                    return ( resolve( res ) );
                } );
        } );
    }

    put( url, json, who = 'admin', code = 200 ) {
        return new Promise(( resolve, reject ) => {
            this.agent.put( url )
                .set( 'Accept', 'application/json' )
                .expect( code ).expect( 'Content-Type', /json/ )
                .send( json )
                .set( 'Cookie', this.cookies[ who ] || '' )
                .end(( err, res ) => {
                    if ( err )
                        return reject( err );

                    return ( resolve( res ) );
                } );
        } );
    }

    delete( url, json, who = 'admin', code = 200 ) {
        return new Promise(( resolve, reject ) => {
            this.agent.delete( url )
                .set( 'Accept', 'application/json' )
                .expect( code ).expect( 'Content-Type', /json/ )
                .send( json )
                .set( 'Cookie', this.cookies[ who ] || '' )
                .end(( err, res ) => {
                    if ( err )
                        return reject( err );

                    return ( resolve( res ) );
                } );
        } );
    }

    get( url, who = 'admin', code = 200 ) {
        return new Promise(( resolve, reject ) => {
            this.agent.get( url )
                .set( 'Accept', 'application/json' )
                .expect( code ).expect( 'Content-Type', /json/ )
                .set( 'Cookie', this.cookies[ who ] || '' )
                .end(( err, res ) => {
                    if ( err )
                        return reject( err );

                    return ( resolve( res ) );
                } );
        } );
    }

    updateCookieToken( who, resp ) {
        this.cookies[ who ] = resp.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];
    }

    /**
     * Creates new user without the need of activating the account. Will first delete any user with that name that
     * that already exists in the database.
     * @param {string} username The new user username (Must be unique)
     * @param {string} password The new user's password
     * @param {string} email The new user's email
     * @param {string} priviledge The user's privilege type
     */
    async createUser( username, password, email, priviledge = 3 ) {

        // Remove the user if they already exist
        let response = await exports.users.admin.delete( `/users/${username}` );

        // Now create the user using the admin account
        response = await exports.users.admin.post( `/users`, { username: username, password: password, email: email, privileges: priviledge } );

        if ( response.body.error )
            throw new Error( response.body.message );

        // User created, but not logged in
        const newAgent = new Agent( null, username, password, email );
        response = await newAgent.post( `/auth/login`, { username: username, password: password } );

        if ( response.body.error )
            throw new Error( response.body.message );

        newAgent.updateCookie(response);
        exports.users[username] = newAgent;
    }

    /**
     * Removes a user from the system
     * @param {string} username The username of the user we are removing
     */
    async removeUser( username ) {

        // Remove the user if they already exist
        let response = await exports.users.admin.delete( `/users/${username}` );

        if ( response.body.error )
            throw new Error( response.body.message );
    }

    /**
     * Initialize the manager
     */
    async initialize() {
        try {
            const config = this.config;
            const serverConfig = this.config.servers[ parseInt( args.server ) ];

            const resp = await this.post( '/auth/login', { username: config.adminUser.username, password: config.adminUser.password } );
            const adminCookie = resp.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];;
            this.cookies.admin = adminCookie;

            // Set the functions we want to expose
            exports.config = config;
            exports.serverConfig = serverConfig;
            exports.createUser = this.createUser;
            exports.removeUser = this.removeUser;
            exports.users = {
                guest: new Agent(),
                admin: new Agent( this.cookies.admin, config.adminUser.username, config.adminUser.password, config.adminUser.email ),
                user1: null,
                user2: null
            };

            await this.createUser( 'user1', 'password', 'user1@test.com' );
            await this.createUser( 'user2', 'password', 'user2@test.com' );

        }
        catch ( exp ) {
            console.log( exp.toString() )
            process.exit();
        }
    }

    /**
     * Gets the test manager intance
     */
    static get get() {
        if ( !TestManager._singleton )
            new TestManager();

        return TestManager._singleton;
    }
};

exports.TestManager = TestManager;