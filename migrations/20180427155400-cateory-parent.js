'use strict';

module.exports = {

  up: async function( db, next ) {
    try {
      const categoriesCollection = await db.collection( 'categories' );
      const categories = await categoriesCollection.find( {} ).toArray();
      const promises = [];

      for ( const category of categories ) {
        const parent = categories.find( ( c, index ) => c._id.equals( category.parent ) );
        promises.push( categoriesCollection.update( { _id: category._id }, { $set: { parent: parent ? parent._id : null } } ) );
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
      const categoriesCollection = await db.collection( 'categories' );
      const categories = await categoriesCollection.find( {} ).toArray();
      const promises = [];

      for ( const category of categories ) {
        promises.push( categoriesCollection.update( { _id: category._id }, { $set: { parent: category.parent ? category.parent.toString() : '' } } ) );
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