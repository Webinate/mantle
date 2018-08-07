'use strict';

module.exports = {

  up: async function (db, next) {
    try {
      const usersCollection = await db.collection('users');
      const volumesCollection = await db.collection('volumes');
      const filesCollection = await db.collection('files');
      const users = await usersCollection.find({}).toArray();
      const volumes = await volumesCollection.find({}).toArray();
      const files = await filesCollection.find({}).toArray();
      const promises = [];

      for ( const volume of volumes ) {
        const user = users.find( ( user ) => user.username === volume.user );
        promises.push( volumesCollection.update({ _id: volume._id }, { $set: { user: user ? user._id : users[0]._id } }) );
      }

      for ( const file of files ) {
        const user = users.find( ( user ) => user.username === file.user );
        promises.push( volumesCollection.update({ _id: post._id }, { $set: { user: user ? user._id : users[0]._id } }) );
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
      const volumesCollection = await db.collection('volumes');
      const filesCollection = await db.collection('files');
      const users = await usersCollection.find({}).toArray();
      const volumes = volumesCollection.find({}).toArray();
      const files = filesCollection.find({}).toArray();
      const promises = [];

      for ( const volume of volumes ) {
        const user = users.find( ( user ) => volume.user.equals( user._id ) );
        promises.volumesCollection.update( { _id: volume._id }, { $set: { user: user.username } } );
      }

      for ( const file of files ) {
        const user = users.find( ( user ) => file.user.equals( user._id ) );
        promises.volumesCollection.update({ _id: post._id }, { $set: { user: user.username } } );
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