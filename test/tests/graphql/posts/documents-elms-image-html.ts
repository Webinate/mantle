import * as assert from 'assert';
import { IPost, IDocument, IUserEntry, IVolume, IFileEntry } from '../../../../src';
import ControllerFactory from '../../../../src/core/controller-factory';
import { randomString } from '../../utils';
import header from '../../header';
import * as fs from 'fs';
import * as FormData from 'form-data';
import { IImageElement } from '../../../../src/types/models/i-draft-elements';

let post: IPost<'expanded'>,
  document: IDocument<'expanded'>,
  volume: IVolume<'expanded'>,
  imageElm: IImageElement<'expanded'>,
  user1: IUserEntry<'expanded'>,
  file: IFileEntry<'expanded'>;

describe('[GQL] Testing the rendered html of image elements: ', function() {
  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'expanded'>;

    // Create post and comments
    post = (await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    })) as IPost<'expanded'>;

    document = post.document;

    const resp = await header.admin.post(`/volumes`, { name: randomString() });
    const json = await resp.json<IVolume<'expanded'>>();
    assert.deepEqual(resp.status, 200);
    volume = json;
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);

    const resp = await header.admin.delete(`/volumes/${volume._id}`);
    assert.deepEqual(resp.status, 204);
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
    const { data: element } = await header.user1.graphql<IImageElement<'expanded'>>(
      `mutation { addDocElement(id: "${document._id}", token: { image: "${
        file._id
      }", type: ElmImage, zone: "zone-a" }) { _id, html, image { _id } } }`
    );

    imageElm = element;
    assert.deepEqual(element.html, `<figure><img src="${file.publicURL}" /></figure>`);
    assert.deepEqual(element.image._id, file._id);
  });

  it('did get the image html from a doc request', async function() {
    const { data: doc } = await header.admin.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { elements { html } } }`
    );
    assert.equal(doc.elements[1].html, `<figure><img src="${file.publicURL}" /></figure>`);
  });

  it('did remove the file from the server', async function() {
    const { data: fileRemoved } = await header.admin.graphql<boolean>(`mutation { removeFile(id: "${file._id}" ) }`);
    assert.deepEqual(fileRemoved, true);
  });

  it('did get the render missing image html after image removed', async function() {
    const { data: doc } = await header.user1.graphql<IDocument<'expanded'>>(
      `{ getDocument(id: "${document._id}") { elements { html } } }`
    );

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
    const { data: image } = await header.user1.graphql<IImageElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${imageElm._id}", token: { image: "${
        file._id
      }" }) { _id, html, image { _id } } }`
    );

    assert.deepEqual(image.html, `<figure><img src="${file.publicURL}" /></figure>`);
  });

  it('did update the image element with style properties', async function() {
    const { data: image } = await header.admin.graphql<IImageElement<'expanded'>>(
      `mutation { updateDocElement(id: "${document._id}", elementId: "${
        imageElm._id
      }", token: { style: { width: "50%", float: "left" } }) { _id, style, html, image { _id } } }`
    );

    assert.deepEqual(image.style.width, '50%');
    assert.deepEqual(image.style.float, 'left');
    assert.deepEqual(image.html, `<figure style="width:50%;float:left"><img src="${file.publicURL}" /></figure>`);
  });

  it('did add a new image element with style properties', async function() {
    const { data: img } = await header.admin.graphql<IImageElement<'expanded'>>(
      `mutation { addDocElement(id: "${document._id}", token: {
        type: ElmImage,
        zone: "zone-a",
        style: { width: "50%", float: "left" },
        image: "${file._id}" }) { _id, style, html, image { _id } } }`
    );

    assert.deepEqual(img.style.width, '50%');
    assert.deepEqual(img.style.float, 'left');
    assert.deepEqual(img.html, `<figure style="width:50%;float:left"><img src="${file.publicURL}" /></figure>`);
  });
});
