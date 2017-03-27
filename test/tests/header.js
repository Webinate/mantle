let test = require( 'unit.js' );
let fs = require( 'fs' );
let yargs = require( "yargs" );
let args = yargs.argv;

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
        this.serverConfig = this.config.servers[ parseInt( args.server ) ];
        this.agent = test.httpAgent( "http://" + this.serverConfig.host + ":" + this.serverConfig.portHTTP );
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
     * Initialize the manager
     */
    async initialize() {
        try {
            const config = this.config;
            const resp = await this.post( '/auth/login', { username: config.adminUser.username, password: config.adminUser.password } );
            this.cookies.admin = resp.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];
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