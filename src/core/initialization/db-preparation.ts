import { IConfig } from 'modepress';
import { Db } from 'mongodb';
import { UsersController } from '../../controllers/users';
import { SessionsController } from '../../controllers/sessions';
import { BucketsController } from '../../controllers/buckets';
import { CommsController } from '../../socket-api/comms-controller'

/**
 * Prepares the database and any dependencies of the collections
 */
export async function prepare( db: Db, config: IConfig ) {

  const usersCollection = await db.createCollection( config.collections.userCollection );
  const sessionsCollection = await db.createCollection( config.collections.sessionCollection );
  const statsCollection = await db.createCollection( config.collections.statsCollection );
  const bucketsCollection = await db.createCollection( config.collections.bucketsCollection );
  const filesCollection = await db.createCollection( config.collections.filesCollection );

  // Create the managers
  SessionsController.create( sessionsCollection, usersCollection, config.sessionSettings );
  UsersController.create( usersCollection, config );
  await UsersController.get.initialize();

  // Create the bucket controller
  BucketsController.create( bucketsCollection, filesCollection, statsCollection, config );

  // Create the comms controller
  let comms = new CommsController( config! );
  await comms.initialize( db );
}