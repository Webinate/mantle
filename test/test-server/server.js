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

      new modepress.serializers.auth( {
        rootPath: api,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password'
      } ).initialize( app, db ),

      new modepress.serializers.user( {
        rootPath: api
      } ).initialize( app, db ),

      new modepress.serializers.comments( {
        rootPath: api
      } ).initialize( app, db ),

      new modepress.serializers.posts( {
        rootPath: api
      } ).initialize( app, db ),

      new modepress.serializers.stats( {
        rootPath: ''
      } ).initialize( app, db ),

      new modepress.serializers.file( {
        rootPath: ''
      } ).initialize( app, db ),

      new modepress.serializers.bucket( {
        rootPath: ''
      } ).initialize( app, db )

    ] );

    return this;
  }
}

exports.default = MainController;
