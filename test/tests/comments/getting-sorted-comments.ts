import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IComment, Page, IAdminUser, IUserEntry } from 'modepress';
import header from 'modepress/test/tests/header';
import { randomString } from '../utils';
import ControllerFactory from 'modepress/src/core/controller-factory';


let post: IPost<'client'>,
  comment1: IComment<'client'>,
  comment2: IComment<'client'>,
  admin: IUserEntry<'client'>;

describe( 'Testing of fetching sorted comments:', function() {

  before( async function() {
    const users = ControllerFactory.get( 'users' );
    const comments = ControllerFactory.get( 'comments' );
    const posts = ControllerFactory.get( 'posts' );
    admin = await users.getUser( { username: ( header.config.adminUser as IAdminUser ).username } ) as IUserEntry<'client'>;
    post = await posts.create( { content: 'Test', title: 'test', author: admin._id, slug: randomString() } );
    comment1 = await comments.create( { post: post._id, author: admin.username, user: admin._id, content: 'AAA' } );
    comment2 = await comments.create( { post: post._id, author: admin.username, user: admin._id, content: 'BBBB' } );

    // Modify comment 1
    comment1 = await comments.update( comment1._id, { content: 'AAAA' } );
  } )

  it( 'gets comments filtered by creation date by default', async function() {
    const resp = await header.admin.get( `/api/comments` );
    assert.deepEqual( resp.status, 200 );
    const comments = await resp.json<Page<IComment<'client'>>>();
    assert.deepEqual( comments.data[ 0 ]._id, comment2._id );
    assert.deepEqual( comments.data[ 1 ]._id, comment1._id );
  } )

  it( 'can filter by date modified (desc)', async function() {
    const resp = await header.admin.get( `/api/comments?sortOrder=desc&sortType=updated` );
    assert.deepEqual( resp.status, 200 );
    const comments = await resp.json<Page<IComment<'client'>>>();
    assert.deepEqual( comments.data[ 0 ]._id, comment1._id );
    assert.deepEqual( comments.data[ 1 ]._id, comment2._id );
  } )

  it( 'can filter by date modified (asc)', async function() {
    const resp = await header.admin.get( `/api/comments?sortOrder=asc&sortType=updated&limit=-1` );
    assert.deepEqual( resp.status, 200 );
    const comments = await resp.json<Page<IComment<'client'>>>();
    assert.deepEqual( comments.data[ comments.data.length - 1 ]._id, comment1._id );
    assert.deepEqual( comments.data[ comments.data.length - 2 ]._id, comment2._id );
  } )

  after( async function() {
    const comments = ControllerFactory.get( 'comments' );
    const posts = ControllerFactory.get( 'posts' );
    await comments.remove( comment1._id );
    await comments.remove( comment2._id );
    await posts.removePost( post._id );
  } )
} )