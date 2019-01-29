'use strict';

module.exports = {

  up: async function( db, next ) {
    try {
      const collection = await db.collection( 'buckets' );
      if ( collection )
        collection.rename( 'volumes' );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  },

  down: async function( db, next ) {
    try {
      const collection = await db.collection( 'volumes' );

      if ( collection )
        collection.rename( 'buckets' );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  }
};