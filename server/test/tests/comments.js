var test = require('unit.js');
var header = require('./header.js').singleton();
var numComments = 0;

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
            .post('/api/comments/target').set('Accept', 'application/json').expect(200).expect('Content-Type', /json/)
            .send( {  } )
            .end(function(err, res) {
                if (err)
                    return done(err);

                test.bool(res.body.error).isTrue()
                    .string(res.body.message).is("You must be logged in to make this request")

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

                test.bool(res.body.error).isNotTrue()
                    .number(res.body.count)

                    .bool(numComments == res.body.count).isTrue();
                done();
            });
    })

});