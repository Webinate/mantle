'use strict';

module.exports = {
  up: async function( db, next ) {
    try {
      const volumes = await db.collection( 'volumes' );
      volumes.update( {}, { $set: { type: 'google' } } );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  },

  down: async function( db, next ) {
    next()
  }
};