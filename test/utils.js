const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const path = require( 'path' );
const yargs = require( 'yargs' );
let args = yargs.argv;

/**
 * Loads any of the sensitive props in the config json
 */
function loadSensitiveProps( config, configPath ) {
  function loadProp( parentProp, prop, path ) {
    if ( typeof ( path ) === 'string' ) {
      if ( !fs.existsSync( configPath + '/' + path ) )
        throw new Error( `Property file '${ configPath + '/' + path }' cannot be found` );
      else
        parentProp[ prop ] = JSON.parse( fs.readFileSync( configPath + '/' + path, 'utf8' ) );
    }
  }

  // Load and merge any sensitive json files
  loadProp( config, 'adminUser', config.adminUser );
  loadProp( config.remotes, 'google', config.remotes.google );
  loadProp( config.remotes, 'local', config.remotes.local );
  loadProp( config.mail, 'options', config.mail.options );
  loadProp( config, 'database', config.database );
}

async function initialize() {
  exports.browser = await puppeteer.launch( { headless: false } );
  exports.page = await exports.browser.newPage();
  exports.modepressConfig = JSON.parse( fs.readFileSync( './modepress.json' ) );
  exports.config = JSON.parse( fs.readFileSync( args.config ) );
  exports.host = `${ exports.modepressConfig.server.host }:${ exports.modepressConfig.server.port }`;

  loadSensitiveProps( exports.config, path.dirname( args.config ) )
}

exports.initialize = initialize;
