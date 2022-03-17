'use strict';

module.exports = {

  up: async function( db, next ) {
    try {
      const usersCollection = await db.collection( 'users' );
      const users = await usersCollection.find( {} ).toArray();
      const promises = [];

      for ( const user of users ) {
        const newPriv = user.privileges === 1 ? 'super' : user.privileges === 2 ? 'admin' : 'regular';
        promises.push( usersCollection.update( { _id: user._id }, { $set: { privileges: newPriv } } ) );
      }

      await Promise.all( promises );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  },

  down: async function( db, next ) {
    try {
      const usersCollection = await db.collection( 'users' );
      const users = await usersCollection.find( {} ).toArray();
      const promises = [];

      for ( const user of users ) {
        const newPriv = user.privileges === 'super' ? 1 : user.privileges === 'admin' ? 2 : 3;
        promises.push( usersCollection.update( { _id: user._id }, { $set: { privileges: newPriv } } ) );
      }

      await Promise.all( promises );
    }
    catch ( err ) {
      console.error( `An error ocurred. Error Stack: ${err.stack}` )
      return next( err )
    }

    next()
  }

};