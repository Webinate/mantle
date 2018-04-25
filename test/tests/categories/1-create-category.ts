import * as assert from 'assert';
import { } from 'mocha';
import { ICategory, IConfig, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';

let guest: Agent, admin: Agent, user1: Agent, config: IConfig, numComments: number;

describe( '1. Testing creation of comments', function() {

  before( function() {
    guest = header.guest;
    admin = header.admin;
    user1 = header.user1;
    config = header.config;
  } )

  it( 'did not create a category when not logged in', async function() {
    const resp = await guest.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 401 );
  } )

  it( 'did not create a category for a regular user', async function() {
    const resp = await user1.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 403 );
  } )

  it( 'did not create a category without a slug', async function() {
    const resp = await admin.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `slug cannot be empty` );
  } )
} );