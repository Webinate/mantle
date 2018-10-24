import * as assert from 'assert';
import { } from 'mocha';
import { ITemplate, Page } from '../../../src';
import header from '../header';

let templates: ITemplate<'client'>[];

describe( 'Testing fetching of templates: ', function() {

  it( 'did fetch all templates', async function() {
    const resp = await header.guest.getJson<Page<ITemplate<'client'>>>( `/api/templates` );
    assert( resp.count > 0 );
    assert( resp.limit === -1 );
    templates = resp.data;
    assert.deepEqual( templates[ 0 ].name, 'Simple Post' );
    assert.deepEqual( templates[ 0 ].description, 'A simple post with a single column' );
    assert.deepEqual( templates[ 0 ].defaultZone, 'main' );
    assert.deepEqual( templates[ 0 ].zones.length, 1 );
    assert.deepEqual( templates[ 0 ].zones[ 0 ], 'main' );
  } )

  it( 'did fetch a single template', async function() {
    const resp = await header.guest.getJson<ITemplate<'client'>>( `/api/templates/${templates[ 0 ]._id}` );
    assert.deepEqual( resp.name, templates[ 0 ].name );
    assert.deepEqual( resp.description, templates[ 0 ].description );
    assert.deepEqual( resp.defaultZone, templates[ 0 ].defaultZone );
    assert.deepEqual( resp.zones.length, templates[ 0 ].zones.length );
    assert.deepEqual( resp.zones[ 0 ], templates[ 0 ].zones[ 0 ] );
  } )
} );