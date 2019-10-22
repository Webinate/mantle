import * as assert from 'assert';
import header from '../../header';
import { Page, IVolume } from '../../../../src';
import { CREATE_VOLUME, REMOVE_VOLUME, GET_VOLUME, GET_VOLUMES } from '../queries/volumes';

let volume: string;

describe('[GQL] Testing volume deletion', function() {
  it('regular user did create a volume dinosaurs', async function() {
    const { data: json } = await header.user1.graphql<IVolume<'expanded'>>(CREATE_VOLUME, {
      token: { name: 'dinosaurs' } as IVolume<'client'>
    });
    assert(json._id);
    volume = json._id;
  });

  it('regular user did not delete a volume that does not exist', async function() {
    const { errors } = await header.user1.graphql<IVolume<'expanded'>>(REMOVE_VOLUME, {
      id: '123456789012345678901234'
    });

    assert.deepEqual(errors[0].message, 'A volume with that ID does not exist');
  });

  it('regular user did not delete a volume that does not have a valid id', async function() {
    const { errors } = await header.user1.graphql<IVolume<'expanded'>>(REMOVE_VOLUME, {
      id: 'badID'
    });

    assert.deepEqual(
      errors[0].message,
      'Variable "$id" got invalid value "badID"; Expected type ObjectId; ObjectId must be a single String of 24 hex characters'
    );
  });

  it('regular user has 1 volume', async function() {
    const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {});
    assert(json.data.length === 1);
  });

  it('regular user did remove the volumes dinosaurs', async function() {
    const { data: postDeleted } = await header.user1.graphql<boolean>(REMOVE_VOLUME, {
      id: volume
    });

    assert.deepEqual(postDeleted, true);
  });

  it('regular user has 0 volume', async function() {
    const { data: json } = await header.user1.graphql<Page<IVolume<'expanded'>>>(GET_VOLUMES, {});
    assert(json.data.length === 0);
  });
});
