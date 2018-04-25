import * as assert from 'assert';
import { } from 'mocha';
import { ICategory, IConfig, Page } from '../../../src';
import header from '../header';
import Agent from '../agent';

let numComments: number;

describe( '1. Testing creation of comments', function() {

  it( 'did not create a category when not logged in', async function() {
    const resp = await header.guest.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 401 );
  } )

  it( 'did not create a category for a regular user', async function() {
    const resp = await header.user1.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 403 );
  } )

  it( 'did not create a category without a slug', async function() {
    const resp = await header.admin.post( `/api/categories`, { title: 'Test' } as ICategory );
    assert.equal( resp.status, 500 );
    assert.equal( resp.statusText, `slug cannot be empty` );
  } )
} );