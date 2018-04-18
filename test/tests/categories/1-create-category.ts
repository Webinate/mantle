import * as assert from 'assert';
import { } from 'mocha';
import { ICategory, IConfig, Page } from 'modepress';
import header from '../header';
import Agent from '../agent';

let guest: Agent, admin: Agent, config: IConfig, numComments: number;

describe( '1. Testing creation of comments', function() {

  before( function() {
    guest = header.users.guest;
    admin = header.users.admin;
    config = header.config;
  } )

  it( 'did not create a category when not logged in', async function() {
    const resp = await guest.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 401 );
  } )
} );