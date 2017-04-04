let test = require( 'unit.js' );
let fs = require( 'fs' );
let yargs = require( "yargs" );
let args = yargs.argv;

let admin;

class Agent {
    constructor( agent, cookie ) {
        this.agent = agent;
        this.cookie = cookie;
        this.setDefaults();
    }

    setDefaults() {
        this.code = 200;
        this.accepts = 'application/json';
        this.contentType = /json/;
    }

    code( val ) {
        this.code = val;
        return this;
    }

    accepts( val ) {
        this.accepts = val;
        return this;
    }

    contentType( val ) {
        this.contentType = val;
        return this;
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

            req.set( 'Accept', this.accepts );
            req.expect( this.code )
            req.expect( 'Content-Type', this.contentType )
            if (data)
                req.send( data )

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

    async createAgent(  ) {

    }

    /**
     * Initialize the manager
     */
    async initialize() {
        try {
            const config = this.config;
            const resp = await this.post( '/auth/login', { username: config.adminUser.username, password: config.adminUser.password } );
            this.cookies.admin = resp.headers[ "set-cookie" ][ 0 ].split( ";" )[ 0 ];

            const serverConfig = this.config.servers[ parseInt( args.server ) ];
            admin = new Agent( test.httpAgent( "http://" + serverConfig.host + ":" + serverConfig.portHTTP ), this.cookies.admin );
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
exports.admin = admin;