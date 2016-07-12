var test = require('unit.js');
var header = require('./header.js').singleton();
var numComments = 0;
var lastPost = null;
var comment = null;
var comment2 = null;

/**
 * Tests all comment related endpoints
 */
describe('Testing all comment related endpoints', function() {

    this.timeout(20000);

    it('Fetched all comments', function(done){
        header.modepressAgent
            .get('/api/comments').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.bool(res.body.error).isNotTrue()
                    .number(res.body.count)

                numComments = res.body.count;
                done();
            });
    })

    it('Cannot create a comment when not logged in', function(done) {
        header.modepressAgent
            .post('/api/posts/123456789012345678901234/comments/123456789012345678901234').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .send( {  } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("You must be logged in to make this request")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Cannot create a comment with a badly formatted post id', function(done) {
        header.modepressAgent
            .post('/api/posts/bad/comments/bad').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( {  } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Invalid ID format")
                test.bool(res.body.error).isTrue()

                done();
            });
    })

    it('Cannot create a comment with a badly formatted parent comment id', function(done) {
        header.modepressAgent
            .post('/api/posts/123456789012345678901234/comments/bad').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( {  } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Invalid ID format")
                test.bool(res.body.error).isTrue()

                done();
            });
    })

    it('Cannot create a comment without a post that actually exists', function(done) {
        header.modepressAgent
            .post('/api/posts/123456789012345678901234/comments').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( {  } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("post does not exist")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Cannot create a comment without a post that actually exists', function(done) {
        header.modepressAgent
            .post('/api/posts/123456789012345678901234/comments/123456789012345678901234').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( {  } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("No comment exists with the id 123456789012345678901234")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Can create a temp post', function(done) {
        header.modepressAgent
            .post('/api/posts').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( {
                title: "Simple Test",
                slug: "--simple--test--",
                content: "Hello world __filter__"
            })
            .end(function(err, res) {
                test.string(res.body.data._id)
                lastPost = res.body.data;
                done();
            });
    })

    it('Cannot create a comment on a post that does exist with illegal html', function(done) {
        header.modepressAgent
            .post(`/api/posts/${lastPost._id}/comments`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( { content: "Hello world! __filter__ <script type='text/javascript'>alert(\"BOOO\")</script>" } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("'content' has html code that is not allowed")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Can create a comment on a valid post', function(done) {
        header.modepressAgent
            .post(`/api/posts/${lastPost._id}/comments`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( { content: "Hello world! __filter__", public: false } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                comment = res.body.data;
                test.string(res.body.message).is("New comment created")
                test.string(res.body.data._id)
                test.string(res.body.data.author)
                test.value(res.body.data.parent).isNull()
                test.string(res.body.data.post).is(lastPost._id)
                test.string(res.body.data.content).is("Hello world! __filter__")
                test.array(res.body.data.children).hasLength(0)
                test.bool(res.body.data.public).isFalse()
                test.number(res.body.data.createdOn)
                test.number(res.body.data.lastUpdated)
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Cannot get a comment with an invalid id', function(done) {
        header.modepressAgent
            .get(`/api/comments/BADID`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);
                test.string(res.body.message).is("Invalid ID format")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Cannot get a comment that does not exist', function(done) {
        header.modepressAgent
            .get(`/api/comments/123456789012345678901234`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);
                test.string(res.body.message).is("Could not find comment")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Can get a valid comment by ID', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);
                test.string(res.body.message).is("Found 1 comments")
                test.string(res.body.data._id).is(comment._id)
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Cannot get a private comment without being logged in', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);
                test.string(res.body.message).is("That comment is marked private")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Can create a second public comment on the same post', function(done) {
        header.modepressAgent
            .post(`/api/posts/${lastPost._id}/comments`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( { content: "Hello world 2! __filter__", public: true } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                comment2 = res.body.data;
                test.string(res.body.message).is("New comment created")
                done();
            });
    })

    it('Can get a public comment without being logged in', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment2._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Found 1 comments")
                test.string(res.body.data._id).is(comment2._id)
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get comments by user & there are more than 1', function(done) {
        header.modepressAgent
            .get(`/api/users/${header.uconfig.adminUser.username}/comments`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.number(res.body.count)
                test.bool(res.body.count >= 2).isTrue()
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get comments by user & there should be 2 if we filter by keyword', function(done) {
        header.modepressAgent
            .get(`/api/users/${header.uconfig.adminUser.username}/comments?keyword=__filter__`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.number(res.body.count)
                test.array(res.body.data).hasLength(2)
                test.bool(res.body.count == 2).isTrue()
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get comments by user & should limit whats returned to 1', function(done) {
        header.modepressAgent
            .get(`/api/users/${header.uconfig.adminUser.username}/comments?keyword=__filter__&limit=1`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.number(res.body.count)
                test.array(res.body.data).hasLength(1)
                test.bool(res.body.count == 2).isTrue() // Count is still 2 as
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get comments by user & should limit whats returned to 1 if not admin', function(done) {
        header.modepressAgent
            .get(`/api/users/${header.uconfig.adminUser.username}/comments?keyword=__filter__`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.number(res.body.count)
                test.array(res.body.data).hasLength(1)
                test.bool(res.body.count == 1).isTrue() // Count is still 2 as
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can create a third public comment on the same post, with a parent comment', function(done) {
        header.modepressAgent
            .post(`/api/posts/${lastPost._id}/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( { content: "Hello world 3! __filter__", public: true } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                comment3 = res.body.data;
                test.string(res.body.message).is("New comment created")
                done();
            });
    })

    it('Can create a fourth public comment on the same post, with a parent comment', function(done) {
        header.modepressAgent
            .post(`/api/posts/${lastPost._id}/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( { content: "Hello world 4! __filter__", public: true } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                comment4 = res.body.data;
                test.string(res.body.message).is("New comment created")
                done();
            });
    })

    it('Can get the parent comment and has previously created comment as child', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Found 1 comments")
                test.string(res.body.data._id).is(comment._id)
                test.array(res.body.data.children).contains([comment3._id, comment4._id])
                //test.array(res.body.data.children).contains(comment4._id)
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get a comment with parent & post, and both properties are just ids (not expanded)', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment3._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Found 1 comments")
                test.string(res.body.data._id).is(comment3._id)
                test.string(res.body.data.parent).is(comment._id)
                test.string(res.body.data.post).is(lastPost._id)
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get a comment with parent & post, and both properties are the respective objects (expanded)', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment3._id}?expanded=true`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Found 1 comments")
                test.string(res.body.data._id).is(comment3._id)
                test.string(res.body.data.parent).is(comment._id)
                test.string(res.body.data.post._id).is(lastPost._id)
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('cannot delete a comment with a bad id', function(done){
        header.modepressAgent
            .delete(`/api/comments/abc`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Invalid ID format")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('cannot delete a comment with a valid id but doesn\'t exist', function(done){
        header.modepressAgent
            .delete(`/api/comments/123456789012345678901234`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Could not find a comment with that ID")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('Can delete the fourth comment', function(done) {
        header.modepressAgent
            .delete(`/api/comments/${comment4._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Comment has been successfully removed")
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can get parent comment and comment 4 has been removed', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Found 1 comments")
                test.string(res.body.data._id).is(comment._id)
                test.array(res.body.data.children).contains([comment3._id])
                test.array(res.body.data.children).notContains([comment4._id])
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can delete an existing comment', function(done) {
        header.modepressAgent
            .delete(`/api/comments/${comment._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Comment has been successfully removed")
                test.bool(res.body.error).isFalse()
                done();
            });
    })

    it('Can delete the temp post', function(done) {
        header.modepressAgent
            .delete('/api/posts/' + lastPost._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                test.string(res.body.message).is("Post has been successfully removed")
                done();
            });
    })

    it('Cannot get the second comment as it should have been deleted when the post was', function(done) {
        header.modepressAgent
            .get(`/api/comments/${comment2._id}`).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("Could not find comment")
                test.bool(res.body.error).isTrue()
                done();
            });
    })

    it('should have the same number of comments as before the tests started', function(done){
        header.modepressAgent
            .get('/api/comments').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.number(res.body.count)
                test.bool(numComments == res.body.count).isTrue();
                test.bool(res.body.error).isNotTrue()
                done();
            });
    })



});