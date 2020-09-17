import * as assert from 'assert';
import ControllerFactory from '../../../src/core/controller-factory';
import { randomString } from '../utils';
import header from '../header';
import { ADD_DOC_ELEMENT } from '../../../src/graphql/client/requests/documents';
import { AddElementInput, ElementType, Element } from '../../../src/index';
import { IUserEntry } from '../../../src/types/models/i-user-entry';
import { IPost } from '../../../src/types/models/i-post';

let post: IPost<'server'>, user1: IUserEntry<'server'>;

const blocks: {
  source: string;
  replacedWith: null | { [testType: string]: string };
}[] = [
  { source: '<ul><li></li></ul>', replacedWith: null },
  { source: '<ol><li></li></ol>', replacedWith: null },
  { source: '<figure><img src=\\"\\" /></figure>', replacedWith: null },
  { source: '<img src=\\"\\" />', replacedWith: null },
  { source: '<pre></pre>', replacedWith: null },
  { source: '<div></div>', replacedWith: null },
  { source: '<script src=\\"bad\\" />', replacedWith: null },
  {
    source: '<table><thead><th></th></thead><tbody><tr><td></td></tr></tbody></table>',
    replacedWith: null
  },
  { source: '<caption></caption>', replacedWith: null },
  { source: '<video></video>', replacedWith: null },
  { source: '<iframe src></iframe>', replacedWith: null },
  { source: '<h1></h1>', replacedWith: null },
  { source: '<h2></h2>', replacedWith: null },
  { source: '<h3></h3>', replacedWith: null },
  { source: '<h4></h4>', replacedWith: null },
  { source: '<h5></h5>', replacedWith: null }
];

const inlines = [
  '<span>Regular text</span>',
  '<br />',
  '<hr />',
  '<strong>bold</strong>',
  '<strike>bold</strike>',
  '<em>bold</em>',
  '<i>allowed</i>',
  '<blockquote></blockquote>',
  '<u>bold</u>',
  '<a href=\\"https://other.com\\">bold</a>'
];

const testConfig: {
  type: ElementType;
  pre: string;
  post: string;
  allowed: string[];
  disallowed: { source: string; replacedWith: null | { [testType: string]: string } }[];
}[] = [
  { type: 'paragraph', pre: '<p>', post: '</p>', allowed: [...inlines], disallowed: [...blocks] },
  {
    type: 'code',
    pre: '<pre>',
    post: '</pre>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 4)
  },
  {
    type: 'list',
    pre: '<ul>',
    post: '</ul>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 0 && i !== 1)
  },
  {
    type: 'header1',
    pre: '<h1>',
    post: '</h1>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 11)
  },
  {
    type: 'header2',
    pre: '<h2>',
    post: '</h2>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 12)
  },
  {
    type: 'header3',
    pre: '<h3>',
    post: '</h3>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 13)
  },
  {
    type: 'header4',
    pre: '<h4>',
    post: '</h4>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 14)
  },
  {
    type: 'header5',
    pre: '<h5>',
    post: '</h5>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 15)
  },
  {
    type: 'header6',
    pre: '<h6>',
    post: '</h6>',
    allowed: [...inlines],
    disallowed: [...blocks].filter((v, i) => i !== 16)
  }
];

describe('Testing the validation of document element html: ', function() {
  this.timeout(600000);

  before(async function() {
    const posts = ControllerFactory.get('posts');
    const users = ControllerFactory.get('users');
    user1 = (await users.getUser({ username: 'user1' })) as IUserEntry<'server'>;

    // Create post
    post = await posts.create({
      author: user1!._id,
      slug: randomString(),
      title: 'Temp Post',
      public: true
    });
  });

  after(async function() {
    const posts = ControllerFactory.get('posts');
    await posts.removePost(post._id);
  });

  testConfig.forEach(test => {
    describe(`Tests for [${test.type}]: `, function() {
      describe(`Allowed: `, function() {
        test.allowed.forEach(innerHtml => {
          it(`did allowed ${innerHtml}`, async function() {
            const { data: element } = await header.admin.graphql<Element>(ADD_DOC_ELEMENT, {
              docId: post.document,
              token: <AddElementInput>{
                html: `${test.pre}${innerHtml}${test.post}`,
                type: test.type,
                zone: 'main'
              }
            });

            assert(element._id);
          });
        });
      });

      describe(`Disallowed: `, function() {
        test.disallowed.forEach(disallowedTest => {
          it(`did not allow ${disallowedTest.source}`, async function() {
            const { data: element } = await header.admin.graphql<Element>(ADD_DOC_ELEMENT, {
              docId: post.document,
              token: <AddElementInput>{
                html: `${test.pre}${disallowedTest.source}${test.post}`,
                type: test.type,
                zone: 'main'
              }
            });

            assert(element._id);

            // Essentially we are checking that the disallowed html is stripped, and therefore we should only have
            // the wrapper
            if (disallowedTest.replacedWith && disallowedTest.replacedWith[test.type])
              assert.equal(element.html, disallowedTest.replacedWith[test.type]);
            else assert.equal(element.html, `${test.pre}${test.post}`);
          });
        });
      });
    });
  });
});
