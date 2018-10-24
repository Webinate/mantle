import { Controller, serializers } from "../../src/index";

/**
 * Create a basic controller
 */
export default class MainController extends Controller {

  constructor( client ) {
    super( null );
  }

  async initialize( app, db ) {

    const api = '/api';

    await Promise.all( [

      super.initialize( app, db ),

      new serializers.auth( {
        rootPath: api,
        accountRedirectURL: '/message',
        activateAccountUrl: '/auth/activate-account',
        passwordResetURL: '/reset-password'
      } ).initialize( app, db ),

      new serializers.user( {
        rootPath: api
      } ).initialize( app, db ),

      new serializers.comments( {
        rootPath: api
      } ).initialize( app, db ),

      new serializers.posts( {
        rootPath: api
      } ).initialize( app, db ),

      // new serializers.stats( {
      //   rootPath: ''
      // } ).initialize( app, db ),

      new serializers.file( {
        rootPath: '',
        cacheLifetime: 60000
      } ).initialize( app, db ),

      new serializers.volume( {
        rootPath: ''
      } ).initialize( app, db ),

      new serializers.categories( {
        rootPath: api
      } ).initialize( app, db ),

      new serializers.templates( {
        rootPath: api
      } ).initialize( app, db ),

      new serializers.documents( {
        rootPath: api
      } ).initialize( app, db )

    ] );

    return this;
  }
}