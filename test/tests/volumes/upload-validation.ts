import * as assert from 'assert';
import { } from 'mocha';
import fs from 'fs';
import header from '../header';
import * as FormData from 'form-data';

const filePath = './test/media/file.png';

describe( 'Testing volume upload validation: ', function() {

  it( 'regular user did not create a volume for another user', async function() {
    const form = new FormData();
    form.append( '"�$^&&', fs.readFileSync( filePath ) );
    const resp = await header.user1.post( "/volumes/upload", form, form.getHeaders() );
  } )
} )