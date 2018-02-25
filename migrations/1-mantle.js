'use strict';

module.exports.id = "mantle";

module.exports.up = async function (done) {
  // use this.db for MongoDB communication, and this.log() for logging
  this.log(`Starting migration`)

  const usersCollection = await this.db.collection('users');
  const postsCollection = await this.db.collection('posts');
  const users = await usersCollection.find({});
  const posts = await postsCollection.find({});

  for ( const post of posts )
    for ( const user of users ) {

    }

  await users.count({})
  await posts.count({})

  this.log(`There are ${numUsers} users`)

  done( new Error("DO NOT WORK!") );
};

module.exports.down = async function (done) {
  // use this.db for MongoDB communication, and this.log() for logging
  done();
};