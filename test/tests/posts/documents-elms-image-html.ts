import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IVolume, IFileEntry } from '../../../src';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { IImageElement } from '../../../src/types/models/i-draft-elements';
import { ElementType } from '../../../src/core/enums';
import { ADD_DOC_ELEMENT, GET_DOCUMENT, UPDATE_DOC_ELEMENT } from '../../../src/graphql/client/requests/documents';
import { AddElementInput, UpdateElementInput } from '../../../src/graphql/models/element-type';
import { REMOVE_FILE } from '../../../src/graphql/client/requests/file';
import { ADD_VOLUME } from '../../../src/graphql/client/requests/volume';
import { AddVolumeInput } from '../../../src/graphql/models/volume-type';

let post: IPost<'server'>,
  volume: IVolume<'expanded'>,
  imageElm: IImageElement<'expanded'>,
  file: IFileEntry<'expanded'>;

describe('Testing the rendered html of image elements: ', function() {
  this.timeout(600000);

  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    const user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'server'>;

    // Create post and comments
    post = await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });

    const resp = await header.admin.graphql<IVolume<'expanded'>>(ADD_VOLUME, {
      token: new AddVolumeInput({
        name: randomString()
      })
    });

    volume = resp.data;
    assert.ok(volume);
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);

    await ControllerFactory.get('volumes').remove({ _id: volume._id });
  });

  it('did upload a single file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append('good-file', fs.createReadStream(filePath));
    const resp = await header.admin.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files = await resp.json<IFileEntry<'expanded'>[]>();
    assert.equal(files.length, 1);
    file = files[0];
  });

  it('did add an image element and render a figure html', async function() {
    const { data: element } = await header.admin.graphql<IImageElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      token: new AddElementInput({
        type: ElementType.image,
        zone: 'zone-a',
        image: file._id
      })
    });

    imageElm = element;
    assert.deepEqual(element.html, `<figure><img src="${file.publicURL}" /></figure>`);
    assert.deepEqual(element.image._id, file._id);
  });

  it('did get the image html from a doc request', async function() {
    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    assert.equal(doc.elements[1].html, `<figure><img src="${file.publicURL}" /></figure>`);
  });

  it('did remove the file from the server', async function() {
    const { data: fileRemoved } = await header.admin.graphql<boolean>(REMOVE_FILE, { id: file._id });
    assert.deepEqual(fileRemoved, true);
  });

  it('did get the render missing image html after image removed', async function() {
    const resp = await header.admin.graphql<IDocument<'expanded'>>(GET_DOCUMENT, { id: post.document });
    const doc = resp.data;
    assert.equal(doc.elements[1].html, `<figure>Image not found</figure>`);
  });

  it('did upload a another file', async function() {
    const form = new FormData();
    const filePath = './test/media/file.png';
    form.append('good-file', fs.createReadStream(filePath));
    const resp = await header.admin.post(`/files/volumes/${volume._id}/upload`, form, form.getHeaders());
    assert.equal(resp.status, 200);
    const files = await resp.json<IFileEntry<'expanded'>[]>();
    assert.equal(files.length, 1);
    file = files[0];
  });

  it('did update image the element with a new file', async function() {
    const { data: image } = await header.admin.graphql<IImageElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      docId: post.document,
      token: new UpdateElementInput({
        _id: imageElm._id,
        image: file._id
      })
    });

    assert.deepEqual(image.html, `<figure><img src="${file.publicURL}" /></figure>`);
  });

  it('did update the image element with style properties', async function() {
    const { data: image } = await header.admin.graphql<IImageElement<'expanded'>>(UPDATE_DOC_ELEMENT, {
      docId: post.document,
      token: new UpdateElementInput({
        _id: imageElm._id,
        style: { width: '50%', float: 'left' }
      })
    });

    assert.deepEqual(image.style.width, '50%');
    assert.deepEqual(image.style.float, 'left');
    assert.deepEqual(image.html, `<figure style="width:50%;float:left"><img src="${file.publicURL}" /></figure>`);
  });

  it('did add a new image element with style properties', async function() {
    const { data: img } = await header.admin.graphql<IImageElement<'expanded'>>(ADD_DOC_ELEMENT, {
      docId: post.document,
      token: new AddElementInput({
        type: ElementType.image,
        zone: 'zone-a',
        style: { width: '50%', float: 'left' },
        image: file._id
      })
    });

    assert.deepEqual(img.style.width, '50%');
    assert.deepEqual(img.style.float, 'left');
    assert.deepEqual(img.html, `<figure style="width:50%;float:left"><img src="${file.publicURL}" /></figure>`);
  });
});
