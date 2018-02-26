/**
 * This is the config for mongodb-migrations
 * =========================================
 **/

// Register ts-node, so we can use ts files directly in node
require( "ts-node" ).register( {
  compilerOptions: {
    module: "commonjs",
    rootDir: './test',
    sourceMap: true,
    target: "es2017",
    isolatedModules: true
  },
} );

const loadConfig = require( './test/tests/load-config' ).default;
const config = loadConfig( 'config.json' );

console.log( `Running migrations for DB: mongodb://${config.database.host}:${config.database.port}` )

module.exports = {
  mongodb: {
    // TODO You MUST edit this connection url to your MongoDB database:
    url: `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`,

    // uncomment and edit to specify Mongo client connect options (eg. increase the timeouts)
    // see https://mongodb.github.io/node-mongodb-native/2.2/api/MongoClient.html
    //
    // options: {
    //   connectTimeoutMS: 3600000, // 1 hour
    //   socketTimeoutMS: 3600000, // 1 hour
    // }
  },

  // The migrations dir, can be an relative or absolute path. Only edit this when really necessary.
  migrationsDir: 'migrations',

  // The mongodb collection where the applied changes are stored. Only edit this when really necessary.
  changelogCollectionName: config.database.migrations,
}