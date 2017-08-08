const modepress = require( "modepress-api" );

/**
 * Create a basic controller
 */
class MainController extends modepress.Controller {

    constructor( client ) {
        super( null );
    }

    async initialize( app, db ) {

        const api = '/api';

        await Promise.all( [

            super.initialize( app, db ),

            new modepress.controllers.auth( {
                rootPath: api,
                accountRedirectURL: '/message',
                activateAccountUrl: '/auth/activate-account',
                passwordResetURL: '/reset-password'
            } ).initialize( app, db ),

            new modepress.controllers.user( {
                rootPath: api
            } ).initialize( app, db ),

            new modepress.controllers.comments( {
                rootPath: api
            } ).initialize( app, db ),

            new modepress.controllers.posts( {
                rootPath: api
            } ).initialize( app, db ),

            new modepress.controllers.stats( {
                rootPath: ''
            } ).initialize( app, db ),

            new modepress.controllers.file( {
                rootPath: ''
            } ).initialize( app, db ),

            new modepress.controllers.bucket( {
                rootPath: ''
            } ).initialize( app, db )

        ] );

        return this;
    }
}

exports.default = MainController;
