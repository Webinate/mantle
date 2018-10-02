import * as assert from 'assert';
import { } from 'mocha';
import { IPost, IUserEntry } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';

let post: IPost<'client'>,
  newUser: IUserEntry<'client'>;

describe( 'Testing deletion of user is nullified on posts: ', function() {

  before( async function() {
    const posts = ControllerFactory.get( 'posts' );
    const users = ControllerFactory.get( 'users' );

    await header.createUser( 'user3', 'password', 'user3@test.com', 2 );
    newUser = await users.getUser( { username: 'user3' } );

    // Create post and comments
    post = await posts.create( {
      author: newUser._id,
      content: 'This is a temp post',
      slug: randomString(),
      title: 'Temp Post',
      public: true
    } );
  } )

  after( async function() {
    const posts = ControllerFactory.get( 'posts' );
    await posts.removePost( post._id );
  } )

  it( 'can get a post with the created user', async function() {
    const resp = await header.user1.get( `/api/posts/${post._id}` );
    assert.deepEqual( resp.status, 200 );
    const postToTest = await resp.json<IPost<'client'>>();
    assert.deepEqual( ( postToTest.author as IUserEntry<'client'> )._id, newUser._id );
  } )

  it( 'can delete the new user', async function() {
    const resp = await header.admin.delete( `/api/users/${newUser.username}` );
    assert.deepEqual( resp.status, 204 );
  } )

  it( 'did nullify the user from the post', async function() {
    const resp = await header.user1.get( `/api/posts/${post._id}` );
    assert.deepEqual( resp.status, 200 );
    const postToTest = await resp.json<IPost<'client'>>();
    assert.deepEqual( postToTest.author, null );
  } )
} )