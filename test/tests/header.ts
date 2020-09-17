import * as yargs from 'yargs';
import Agent from './agent';
import loadConfig from './load-config';
import { REMOVE_USER, ADD_USER } from '../../src/graphql/client/requests/users';
import { LOGIN } from '../../src/graphql/client/requests/auth';
import { IConfig } from '../../src/types/config/i-config';
let args = yargs.argv;
import { UserPrivilege, AuthResponse, User } from '../../src/index';
import { IAdminUser } from '../../src/types/config/properties/i-admin';

export class Header {
  public config: IConfig;
  public users: { [name: string]: Agent };
  public host = 'http://localhost:8000';

  get guest() {
    return this.users['guest'];
  }
  get admin() {
    return this.users['admin'];
  }
  get user1() {
    return this.users['user1'];
  }
  get user2() {
    return this.users['user2'];
  }
  get user3() {
    return this.users['user3'];
  }

  /**
   * Used to create a agent to test with
   * @param url The host
   * @param options Options for the agent
   */
  createAgent(url: string, options: { cookie?: string; username?: string; password?: string; email?: string } = {}) {
    return new Agent(url, options.cookie, options.username, options.password, options.email);
  }

  /**
   * Creates new user without the need of activating the account. Will first delete any user with that name that
   * that already exists in the database.
   * @param username The new user username (Must be unique)
   * @param password The new user's password
   * @param email The new user's email
   * @param priviledge The user's privilege type
   */
  async createUser(username: string, password: string, email: string, priviledge: UserPrivilege = 'regular') {
    // Remove the user if they already exist
    let response = await this.admin.graphql<boolean>(REMOVE_USER, { username });
    if (
      response.errors &&
      response.errors.find(err => err.message !== 'Could not find any users with those credentials')
    )
      throw new Error(response.errors[0].message);

    // Now create the user using the admin account
    let addUserResponse = await this.admin.graphql<User>(ADD_USER, {
      token: {
        username: username,
        password: password,
        email: email,
        privileges: priviledge
      }
    });

    if (addUserResponse.errors) throw new Error(addUserResponse.errors[0].message);

    // User created, but not logged in
    const newAgent = new Agent(this.host, null, username, password, email);
    let loginResponse = await newAgent.graphql(LOGIN, { token: { username: username, password: password } });

    if (loginResponse.errors) throw new Error(loginResponse.errors[0].message);

    newAgent.updateCookie(loginResponse.response);
    this.users[username] = newAgent;
    return newAgent;
  }

  /**
   * Removes a user from the system
   * @param username The username of the user we are removing
   */
  async removeUser(username: string) {
    // Remove the user if they already exist
    let response = await this.admin.graphql(REMOVE_USER, { username });
    if (response.errors) throw new Error(response.errors[0].message);
  }

  /**
   * Initialize the manager
   */
  async initialize() {
    try {
      const config = loadConfig(args.config);
      const host = this.host;
      const initAgent = new Agent(host);

      // const serverConfig = config.servers[ parseInt( args.server ) ];
      const resp = await initAgent.graphql<AuthResponse>(LOGIN, {
        token: {
          username: (config.adminUser as IAdminUser).username,
          password: (config.adminUser as IAdminUser).password
        }
      });
      if (resp.errors) throw new Error(resp.errors[0].message);
      const adminCookie = resp.response.headers.get('set-cookie').split(';')[0];

      // Set the functions we want to expose
      this.config = config;

      this.users = {
        guest: new Agent(host),
        admin: new Agent(
          host,
          adminCookie,
          (config.adminUser as IAdminUser).username,
          (config.adminUser as IAdminUser).password,
          (config.adminUser as IAdminUser).email
        ),
        user1: null as any,
        user2: null as any,
        user3: null as any
      };

      await this.createUser('user1', 'password', 'user1@test.com');
      await this.createUser('user2', 'password', 'user2@test.com');
      await this.createUser('user3', 'password', 'user3@test.com', 'admin');
    } catch (exp) {
      console.log(exp.stack);
      process.exit();
    }
  }

  public makeid() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}

const header = new Header();
export default header;
