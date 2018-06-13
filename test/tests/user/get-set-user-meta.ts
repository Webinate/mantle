import * as assert from 'assert';
import { } from 'mocha';
import Agent from '../agent';
import header from '../header';
import { IConfig, IAdminUser, Page } from '../../../src';

describe( 'Getting and setting user meta data', function() {

  it( 'admin did set user meta data object', async function() {
    const resp = await header.admin.post( `/api/users/${( header.config.adminUser as IAdminUser ).username}/meta`, { value: { sister: "sam", brother: "mat" } } );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'admin did get user meta value "sister"', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).username}/meta/sister` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json, "sam" )
  } )

  it( 'admin did get user meta value "brother"', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).username}/meta/brother` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json, "mat" )
  } )

  it( 'admin did update user meta "brother" to john', async function() {
    const resp = await header.admin.post( `/api/users/${( header.config.adminUser as IAdminUser ).username}/meta/brother`, { value: "john" } );
    assert.deepEqual( resp.status, 200 );
  } )

  it( 'admin did get user meta "brother" and its john', async function() {
    const resp = await header.admin.get( `/api/users/${( header.config.adminUser as IAdminUser ).username}/meta/brother` );
    assert.deepEqual( resp.status, 200 );
    const json = await resp.json();
    assert.deepEqual( json, "john" )
  } )

  it( 'admin did set clear meta data', async function() {
    const resp = await header.admin.post( `/api/users/${( header.config.adminUser as IAdminUser ).username}/meta`, {} );
    assert.deepEqual( resp.status, 200 );
  } )
} )