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
const yargs = require( "yargs" );
const args = yargs.argv;

if ( !args[ 'mantle-config' ] ) {
  const err = 'Please specifiy a config file path';
  console.error( err )
  throw new Error( err );
}

const config = loadConfig( args[ 'mantle-config' ] );

console.log( `Running migrations for DB: mongodb://${config.database.host}:${config.database.port}` )

module.exports = {
  host: config.database.host,
  port: config.database.port,
  db: config.database.name,
  collection: config.database.migrations,
  timeout: 200
}