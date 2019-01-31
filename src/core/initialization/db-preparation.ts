import { IConfig } from '../../types/config/i-config';
import { Db } from 'mongodb';
import { CommsController } from '../../socket-api/comms-controller';
import { Collections } from '../enums';

/**
 * Prepares the database and any dependencies of the collections
 */
export async function prepare( db: Db, config: IConfig ) {

  await Promise.all( Object.keys( Collections ).map( ( k: keyof ( typeof Collections ) ) => db.createCollection( Collections[ k ] ) ) );

  // Create the comms controller
  let comms = new CommsController( config! );
  await comms.initialize( db );
}