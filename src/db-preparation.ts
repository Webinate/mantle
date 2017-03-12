import * as mongodb from 'mongodb';
import * as def from 'webinate-users';
import { UserManager } from './users';
import { BucketManager } from './bucket-manager';

/**
 * Prepares the database and any dependencies of the collections
 */
export async function prepare( db: mongodb.Db, config: def.IConfig ) {

    const usersCollection = await db.createCollection( config.userCollection );
    const sessionsCollection = await db.createCollection( config.sessionCollection );
    const statsCollection = await db.createCollection( config.google.bucket.statsCollection );
    const bucketsCollection = await db.createCollection( config.google.bucket.bucketsCollection );
    const filesCollection = await db.createCollection( config.google.bucket.filesCollection );

    await Promise.all( [
        usersCollection.createIndex( 'username' ),
        usersCollection.createIndex( 'createdOn' ),
        usersCollection.createIndex( 'lastLoggedIn' ),
        bucketsCollection.createIndex( 'name' ),
        bucketsCollection.createIndex( 'user' ),
        bucketsCollection.createIndex( 'created' ),
        bucketsCollection.createIndex( 'memoryUsed' ),
        filesCollection.createIndex( 'name' ),
        filesCollection.createIndex( 'user' ),
        filesCollection.createIndex( 'created' ),
        filesCollection.createIndex( 'size' ),
        filesCollection.createIndex( 'mimeType' ),
        filesCollection.createIndex( 'numDownloads' )
    ] );

    // Create the user manager
    UserManager.create( usersCollection, sessionsCollection, config );
    await UserManager.get.initialize();
    BucketManager.create( bucketsCollection, filesCollection, statsCollection, config );
}