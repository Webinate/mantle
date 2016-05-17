var test = require('unit.js');
var header = require('./header.js').singleton();
var numComments = 0;
var lastPost = null;

/**
 * Tests all comment related endpoints
 */
describe('Testing all comment related endpoints', function() {

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
            .post('/api/posts/123456789012345678901234/comments/123456789012345678901234').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
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

    it('Can create a temp post', function(done) {
        header.modepressAgent
            .post('/api/posts/create-post').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .send( {
                title: "Simple Test",
                slug: "--simple--test--",
                content: "Hello world"
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
            .send( { content: "Hello world! <script type='text/javascript'>alert(\"BOOO\")</script>" } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.string(res.body.message).is("'content' has html code that is not allowed")
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

    it('Can delete the temp post', function(done) {


        header.modepressAgent
            .delete('/api/posts/remove-post/' + lastPost._id).set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .set('Cookie', header.adminCookie)
            .end(function(err, res) {
                test.string(res.body.message).is("Post has been successfully removed")
                done();
            });
    })

});