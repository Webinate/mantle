'use strict';

module.exports = {

  up: async function( db, next ) {
    try {
      const templatesCollection = await db.collection( 'templates' );

      const newTemplates = [ {
        name: 'Simple Post',
        description: 'A simple page layout with a single column',
        defaultZone: 'main',
        zones: [ 'main' ]
      }, {
        name: 'Double Column',
        description: 'A two column page layout',
        defaultZone: 'left',
        zones: [ 'left', 'right' ]
      } ];

      // Remove all templates
      await templatesCollection.remove( {} );

      // Now add each of the templates
      for ( const template of newTemplates )
        await templatesCollection.insertOne( template );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  },

  down: async function( db, next ) {
    try {
      await db.collection( 'templates' ).remove( {} );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  }
};