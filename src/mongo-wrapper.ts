import * as mongodb from "mongodb";

export class MongoWrapper {
	/**
	 * Connects to the mongo database
	 * @param host The host URI
	 * @param port The port number
	 * @param opts Any additional options
	 */
    static connect( host: string, port: number, database: string, opts?: mongodb.ServerOptions ): Promise<mongodb.Db> {
        return new Promise<mongodb.Db>( function( resolve, reject ) {
            if ( !host )
                return reject( new Error( "Please provide a 'host' field in your configuration" ) );
            if ( !port )
                return reject( new Error( "Please provide a 'port' field in your configuration" ) );
            if ( !database )
                return reject( new Error( "Please provide a 'databaseName' field in your configuration" ) );

            var mongoServer: mongodb.Server = new mongodb.Server( host, port, opts );
            var mongoDB: mongodb.Db = new mongodb.Db( database, mongoServer, { w: 1 });
            mongoDB.open( function( err: Error, db: mongodb.Db ) {
                if ( err || !db )
                    reject( err );
                else
                    resolve( db );
            });
        });
    }

	/**
	 * Connects to the mongo database
	 * @param host The host URI
	 * @param port The port number
	 * @param opts Any additional options
	 */
    static find( host: string, port: number, opts?: mongodb.ServerOptions ): Promise<mongodb.Db> {
        return new Promise<mongodb.Db>( function( resolve, reject ) {
            var mongoServer: mongodb.Server = new mongodb.Server( host, port, opts );
            var mongoDB: mongodb.Db = new mongodb.Db( "animate", mongoServer, { w: 1 });
            mongoDB.open( function( err: Error, db: mongodb.Db ) {
                if ( err || !db )
                    reject( err );
                else
                    resolve( db );
            });
        });
    }
}
