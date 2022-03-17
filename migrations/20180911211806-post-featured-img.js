'use strict';

module.exports =  {

  up: async function (db, next) {
    try {
      const filesCollection = await db.collection('files');
      const postsCollection = await db.collection('posts');
      const files = await filesCollection.find({}).toArray();
      const posts = await postsCollection.find({}).toArray();
      const promises = [];

      for ( const post of posts ) {
        const file = files.find( ( file ) => file.publicURL === post.featuredImage );
        promises.push( postsCollection.update({ _id: post._id }, { $set: { featuredImage: file ? file._id : null } }) );
      }

      await Promise.all( promises );
    }
    catch (err) {
      console.error(`An error ocurred. Error Stack: ${err.stack}`)
      return next(err)
    }

    next()
  },

  down: async function (db, next) {
    try {
      const filesCollection = await db.collection('files');
      const postsCollection = await db.collection('posts');
      const files = await filesCollection.find({}).toArray();
      const posts = await postsCollection.find({}).toArray();
      const promises = [];

      for ( const post of posts ) {
        const file = files.find( ( file ) => post.featuredImage ? post.featuredImage.equals( file._id ) : false );
        promises.push( postsCollection.update({ _id: post._id }, { $set: { featuredImage: file ? file.publicURL : '' } }) );
      }

      await Promise.all(promises);
    }
    catch (err) {
      console.error(`An error ocurred. Error Stack: ${err.stack}`)
      return next(err)
    }

    next()
  }
};