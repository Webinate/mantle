import * as assert from 'assert';
import { IPost, IFileEntry, IVolume, IDraftElement, IDraft, IUserEntry } from '../../../src';
import header from '../header';
import ControllerFactory from '../../../src/core/controller-factory';
import { uploadFileToVolume } from '../file';
import { randomString } from '../utils';
import { GET_POST, UPDATE_POST, GET_POST_DRAFTS, REMOVE_POST_DRAFT } from '../../../src/graphql/client/requests/posts';
import { UpdatePostInput } from '../../../src/graphql/models/post-type';
import { UPDATE_DOC_ELEMENT, ADD_DOC_ELEMENT } from '../../../src/graphql/client/requests/documents';
import { UpdateElementInput, AddElementInput } from '../../../src/graphql/models/element-type';
import { ElementType } from '../../../src/core/enums';

let volume: IVolume<'server'>;
let post: IPost<'expanded'>;
let file: IFileEntry<'server'>;
let firstDraft: IDraft<'expanded'>;

let updatedHTML: string, listHTML: string, imgHTML: string, codeHtml: string, drafts: IDraft<'expanded'>[];

describe('[GQL] Testing of posts and drafts', function() {
  before(async function() {
    const users = ControllerFactory.get('users');
    const volumes = ControllerFactory.get('volumes');
    const posts = ControllerFactory.get('posts');

    const user = (await users.getUser({ username: header.admin.username })) as IUserEntry<'server'>;
    volume = (await volumes.create({ name: 'test', user: user._id })) as IVolume<'server'>;
    file = (await uploadFileToVolume('img-a.png', volume, 'File A')) as IFileEntry<'server'>;
    const resp = (await posts.create({
      author: user._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'server'>;

    const { data: expandedPost } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { id: resp._id });
    post = expandedPost;
    assert(post);
  });

  after(async function() {
    const volumes = ControllerFactory.get('volumes');
    const posts = ControllerFactory.get('posts');
    await volumes.remove({ _id: volume._id });
    await posts.removePost(post._id);
  });

  it('can fetch a single post and there is no draft initially', async function() {
    let { data: fetchedPost } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, { id: post._id });

    assert.deepEqual(fetchedPost.latestDraft, null);
    assert.deepEqual(typeof fetchedPost.document._id, 'string');
  });

  it('can publish the post document with elements and latest draft is updated', async function() {
    updatedHTML = '<p>This is something <strong>new</strong> and <u>exciting</u></p>';
    listHTML = '<ul><li>Test 1</li><li>Test 2</li></ul>';
    imgHTML = `<figure><img src="${file.publicURL!}" /></figure>`;

    const updateResp = await header.admin.graphql<IDraftElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      docId: post.document._id,
      token: new UpdateElementInput({
        _id: post.document.elements![0]._id,
        html: updatedHTML
      })
    });

    const { data: newListElement } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document._id,
      token: new AddElementInput({
        type: ElementType.list,
        html: listHTML
      })
    });

    const { data: newImgElement } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document._id,
      token: new AddElementInput({
        type: ElementType.image,
        image: file._id
      })
    });

    assert(updateResp.data._id);
    assert(newListElement._id);
    assert(newImgElement._id);

    const { data: updatedPost } = await header.admin.graphql<IPost<'expanded'>>(UPDATE_POST, {
      token: new UpdatePostInput({
        _id: post._id,
        public: true
      })
    });

    assert.deepEqual(typeof updatedPost.latestDraft!._id, 'string');
    assert.deepEqual(typeof updatedPost.document._id, 'string');
    assert.deepEqual(updatedPost.latestDraft!.html.unassigned, updatedHTML + listHTML + imgHTML);

    firstDraft = updatedPost.latestDraft!;
  });

  it('does create a new draft with more changes', async function() {
    codeHtml = `<pre>Hello world</pre>`;

    const { data: newElement } = await header.admin.graphql<IDraftElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document._id,
      token: new AddElementInput({
        type: ElementType.code,
        html: codeHtml
      })
    });

    const { data: updatedPost } = await header.admin.graphql<IPost<'expanded'>>(UPDATE_POST, {
      token: new UpdatePostInput({
        _id: post._id,
        public: true
      })
    });

    assert(newElement._id);
    assert(updatedPost._id);

    assert.deepEqual(typeof updatedPost.latestDraft!._id, 'string');
    assert.notDeepEqual(typeof updatedPost.latestDraft!._id, firstDraft._id);
    assert.deepEqual(updatedPost.latestDraft!.html.unassigned, updatedHTML + listHTML + imgHTML + codeHtml);
  });

  it('prevents guests from getting post draft lists', async function() {
    const { errors } = await header.guest.graphql<IDraft<'expanded'>[]>(GET_POST_DRAFTS, {
      id: post.document._id
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('prevents getting post draft lists with a bad id', async function() {
    const { errors } = await header.admin.graphql<IDraft<'expanded'>[]>(GET_POST_DRAFTS, {
      id: 'BAD'
    });

    assert.deepEqual(
      errors![0].message,
      'Variable "$id" got invalid value "BAD"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('prevents other users from getting post draft lists', async function() {
    const { errors } = await header.user1.graphql<IDraft<'expanded'>[]>(GET_POST_DRAFTS, {
      id: post._id
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('allows an admin to get post draft lists', async function() {
    const resp = await header.admin.graphql<IDraft<'expanded'>[]>(GET_POST_DRAFTS, {
      id: post._id
    });

    drafts = resp.data;
    assert.deepEqual(drafts.length, 3);
    assert.deepEqual(drafts[1].html.unassigned, updatedHTML + listHTML + imgHTML);
    assert.deepEqual(drafts[2].html.unassigned, updatedHTML + listHTML + imgHTML + codeHtml);
  });

  it('prevents removing a post draft with a bad id', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_POST_DRAFT, { postId: 'BAD', draftId: 'BAD' });

    assert.deepEqual(
      errors![0].message,
      'Variable "$draftId" got invalid value "BAD"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
    assert.deepEqual(
      errors![1].message,
      'Variable "$postId" got invalid value "BAD"; Expected type ObjectId. Argument passed in must be a single String of 12 bytes or a string of 24 hex characters'
    );
  });

  it('prevents removing a post draft with a post that doesnt exist', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_POST_DRAFT, {
      postId: '123456789012345678901234',
      draftId: '123456789012345678901234'
    });

    assert.deepEqual(errors![0].message, 'Post does not exist');
  });

  it('prevents removing a post draft with a draft that does not exist', async function() {
    const { errors } = await header.admin.graphql<boolean>(REMOVE_POST_DRAFT, {
      postId: post._id,
      draftId: '123456789012345678901234'
    });

    assert.deepEqual(errors![0].message, 'Draft does not exist');
  });

  it('prevents removing a post draft with no authentication', async function() {
    const { errors } = await header.guest.graphql<boolean>(REMOVE_POST_DRAFT, {
      postId: post._id,
      draftId: drafts[0]._id
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('prevents removing a post draft without admin rights', async function() {
    const { errors } = await header.user1.graphql<boolean>(REMOVE_POST_DRAFT, {
      postId: post._id,
      draftId: drafts[0]._id
    });

    assert.deepEqual(errors![0].message, `Access denied! You don't have permission for this action!`);
  });

  it('does allow an admin to remove the first draft', async function() {
    const { data: wasRemoved } = await header.admin.graphql<boolean>(REMOVE_POST_DRAFT, {
      postId: post._id,
      draftId: drafts[0]._id
    });

    assert(wasRemoved);

    const { data: newDrafts } = await header.admin.graphql<IDraft<'expanded'>[]>(GET_POST_DRAFTS, {
      id: post._id
    });

    assert.deepEqual(newDrafts.length, 2);
    assert.deepEqual(newDrafts[0].html.unassigned, updatedHTML + listHTML + imgHTML);
    assert.deepEqual(newDrafts[1].html.unassigned, updatedHTML + listHTML + imgHTML + codeHtml);
  });

  it('does allow an admin to the current draft and the post draft is nullified', async function() {
    const { data: wasRemoved } = await header.admin.graphql<boolean>(REMOVE_POST_DRAFT, {
      postId: post._id,
      draftId: drafts[2]._id
    });

    assert(wasRemoved);

    const { data: newDrafts } = await header.admin.graphql<IDraft<'expanded'>[]>(GET_POST_DRAFTS, {
      id: post._id
    });

    assert.deepEqual(newDrafts.length, 1);
    assert.deepEqual(newDrafts[0].html.unassigned, updatedHTML + listHTML + imgHTML);

    // Now check that the post's draft is nullified
    const { data: fetchedPost } = await header.admin.graphql<IPost<'expanded'>>(GET_POST, {
      id: post._id
    });

    assert.deepEqual(fetchedPost.latestDraft, null);
  });
});
