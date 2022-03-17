'use strict';

module.exports =  {

  up: async function (db, next) {
    try {
      const usersCollection = await db.collection('users');
      const postsCollection = await db.collection('posts');
      const users = await usersCollection.find({}).toArray();
      const posts = await postsCollection.find({}).toArray();
      const promises = [];

      for ( const post of posts ) {
        const user = users.find( ( user, index ) => user.username === post.author );
        promises.push( postsCollection.update({ _id: post._id }, { $set: { author: user ? user._id : users[0]._id } }) );
      }

      await Promise.all(promises);
    }
    catch (err) {
      console.error(`An error ocurred. Error Stack: ${err.stack}`)
      return next(err)
    }

    next()
  },

  down: async function (db, next) {
    try {
      const usersCollection = await db.collection('users');
      const postsCollection = await db.collection('posts');
      const users = await usersCollection.find({}).toArray();
      const posts = await postsCollection.find({}).toArray();
      const promises = [];

      for ( const post of posts ) {
        const user = users.find( ( user, index ) => post.author.equals( user._id ) );
        promises.push( postsCollection.update({ _id: post._id }, { $set: { author: user.username } }) );
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