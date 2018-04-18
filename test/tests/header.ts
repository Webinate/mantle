import * as test from 'unit.js';
import * as fs from 'fs';
import * as yargs from "yargs";
import fetch from "node-fetch";
import Agent from './agent';
import loadConfig from './load-config';
import { IAdminUser } from '../../src';
import { IConfig } from '../../src';
let args = yargs.argv;

export class Header {
  public config: IConfig;
  public users: { [ name: string ]: Agent };

  /**
   * Used to create a agent to test with
   * @param url The host
   * @param options Options for the agent
   */
  createAgent( url: string, options: { cookie?: string, username?: string, password?: string, email?: string } = {} ) {
    return new Agent( url, options.cookie, options.username, options.password, options.email );
  }

  /**
   * Creates new user without the need of activating the account. Will first delete any user with that name that
   * that already exists in the database.
   * @param username The new user username (Must be unique)
   * @param password The new user's password
   * @param email The new user's email
   * @param priviledge The user's privilege type
   */
  async createUser( username: string, password: string, email: string, priviledge: number = 3 ) {

    // Remove the user if they already exist
    let response = await this.users.admin.delete( `/api/users/${username}` );

    // Now create the user using the admin account
    response = await this.users.admin.post( `/api/users`, { username: username, password: password, email: email, privileges: priviledge } );

    if ( response.status !== 200 )
      throw new Error( response.body.toString() );

    // User created, but not logged in
    const newAgent = new Agent( "http://localhost:8000", null, username, password, email );
    response = await newAgent.post( `/api/auth/login`, { username: username, password: password } );

    if ( response.status !== 200 )
      throw new Error( response.body.toString() );

    newAgent.updateCookie( response );
    this.users[ username ] = newAgent;
    return newAgent;
  }

  /**
   * Removes a user from the system
   * @param username The username of the user we are removing
   */
  async removeUser( username: string ) {

    // Remove the user if they already exist
    let response = await this.users.admin.delete( `/api/users/${username}` );

    if ( response.status > 300 )
      throw new Error( response.statusText );
  }

  /**
   * Initialize the manager
   */
  async initialize() {
    try {
      const config = loadConfig( args.config );
      const host = "http://localhost:8000";
      const initAgent = new Agent( host );

      // const serverConfig = config.servers[ parseInt( args.server ) ];
      const resp = await initAgent.post( '/api/auth/login', { username: ( config.adminUser as IAdminUser ).username, password: ( config.adminUser as IAdminUser ).password } );
      const adminCookie = resp.headers.get( "set-cookie" ).split( ";" )[ 0 ];

      // Set the functions we want to expose
      this.config = config;

      this.users = {
        guest: new Agent( "http://localhost:8000" ),
        admin: new Agent( "http://localhost:8000", adminCookie, ( config.adminUser as IAdminUser ).username, ( config.adminUser as IAdminUser ).password, ( config.adminUser as IAdminUser ).email ),
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
}

const header = new Header();
export default header;