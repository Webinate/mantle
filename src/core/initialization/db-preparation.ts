import { IConfig } from '../../types/config/i-config';
import { Db } from 'mongodb';
import { CommsController } from '../../socket-api/comms-controller';

/**
 * Prepares the database and any dependencies of the collections
 */
export async function prepare( db: Db, config: IConfig ) {

  await db.createCollection( config.collections.userCollection );
  await db.createCollection( config.collections.sessionCollection );
  await db.createCollection( config.collections.statsCollection );
  await db.createCollection( config.collections.bucketsCollection );
  await db.createCollection( config.collections.filesCollection );
  await db.createCollection( config.collections.foreignKeys );

  // Create the comms controller
  let comms = new CommsController( config! );
  await comms.initialize( db );
}