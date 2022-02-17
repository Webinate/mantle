import * as assert from 'assert';
import header from '../header';
import { GET_TEMPLATES, GET_TEMPLATE } from '../../client/requests/templates';
import { Template, PaginatedTemplateResponse } from '../../../src/index';

let templates: Template[];

describe('Testing fetching of templates: ', function() {
  it('did fetch all default templates', async function() {
    const { data } = await header.guest.graphql<PaginatedTemplateResponse>(GET_TEMPLATES);
    assert(data.count > 0);
    assert(data.limit === -1);
    templates = data.data;

    // Check first template
    assert.deepEqual(templates[0].name, 'Simple Post');
    assert.deepEqual(templates[0].description, 'A simple page layout with a single column');
    assert.deepEqual(templates[0].defaultZone, 'main');
    assert.deepEqual(templates[0].zones.length, 1);
    assert.deepEqual(templates[0].zones[0], 'main');

    // Check second template
    assert.deepEqual(templates[1].name, 'Double Column');
    assert.deepEqual(templates[1].description, 'A two column page layout');
    assert.deepEqual(templates[1].defaultZone, 'left');
    assert.deepEqual(templates[1].zones.length, 2);
    assert.deepEqual(templates[1].zones[0], 'left');
    assert.deepEqual(templates[1].zones[1], 'right');
  });

  it('did fetch a single template', async function() {
    const { data } = await header.guest.graphql<Template>(GET_TEMPLATE, { id: templates[0]._id });
    assert.deepEqual(data.name, templates[0].name);
    assert.deepEqual(data.description, templates[0].description);
    assert.deepEqual(data.defaultZone, templates[0].defaultZone);
    assert.deepEqual(data.zones.length, templates[0].zones.length);
    assert.deepEqual(data.zones[0], templates[0].zones[0]);
  });
});
