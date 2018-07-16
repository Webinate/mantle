'use strict';

module.exports = {

  up: async function( db, next ) {
    try {
      await db.collection( 'buckets' ).rename('volumes');
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  },

  down: async function( db, next ) {
    try {
      await db.collection( 'volumes' ).rename('buckets');
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  }
};