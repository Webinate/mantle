// import * as assert from 'assert';
// import { ITemplate, Page } from '../../../src';
// import header from '../header';

// let templates: ITemplate<'expanded'>[];

// describe('Testing fetching of templates: ', function() {
//   it('did fetch all default templates', async function() {
//     const resp = await header.guest.getJson<Page<ITemplate<'expanded'>>>(`/api/templates`);
//     assert(resp.count > 0);
//     assert(resp.limit === -1);
//     templates = resp.data;

//     // Check first template
//     assert.deepEqual(templates[0].name, 'Simple Post');
//     assert.deepEqual(templates[0].description, 'A simple page layout with a single column');
//     assert.deepEqual(templates[0].defaultZone, 'main');
//     assert.deepEqual(templates[0].zones.length, 1);
//     assert.deepEqual(templates[0].zones[0], 'main');

//     // Check second template
//     assert.deepEqual(templates[1].name, 'Double Column');
//     assert.deepEqual(templates[1].description, 'A two column page layout');
//     assert.deepEqual(templates[1].defaultZone, 'left');
//     assert.deepEqual(templates[1].zones.length, 2);
//     assert.deepEqual(templates[1].zones[0], 'left');
//     assert.deepEqual(templates[1].zones[1], 'right');
//   });

//   it('did fetch a single template', async function() {
//     const resp = await header.guest.getJson<ITemplate<'client'>>(`/api/templates/${templates[0]._id}`);
//     assert.deepEqual(resp.name, templates[0].name);
//     assert.deepEqual(resp.description, templates[0].description);
//     assert.deepEqual(resp.defaultZone, templates[0].defaultZone);
//     assert.deepEqual(resp.zones.length, templates[0].zones.length);
//     assert.deepEqual(resp.zones[0], templates[0].zones[0]);
//   });
// });
