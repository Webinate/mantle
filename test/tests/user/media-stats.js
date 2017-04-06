const test = require( 'unit.js' );
let guest, admin, config, user1, user2;
const filePath = './test/media/file.png';
let fileId = '';

describe( 'Getting and setting user media stat usage', function() {

    before( function() {
        const header = require( '../header.js' );
        guest = header.users.guest;
        admin = header.users.admin;
        user1 = header.users.user1;
        user2 = header.users.user2;
        config = header.config;
    } )

    it( 'regular user did not get stats for admin', function( done ) {
        user1.get( `/stats/users/${config.adminUser.username}/get-stats` )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not get buckets for admin', function( done ) {
        user1.get( `/buckets/user/${config.adminUser.username}` )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create stats for admin', function( done ) {
        user1.post( `/stats/create-stats/${config.adminUser.username}`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage calls for admin', function( done ) {
        user1.put( `/stats/storage-calls/${config.adminUser.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage memory for admin', function( done ) {
        user1.put( `/stats/storage-memory/${config.adminUser.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage allocated calls for admin', function( done ) {
        user1.put( `/stats/storage-allocated-calls/${config.adminUser.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage allocated memory for admin', function( done ) {
        user1.put( `/stats/storage-allocated-memory/${config.adminUser.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage calls for itself', function( done ) {
        user1.put( `/stats/storage-calls/${user1.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage memory for itself', function( done ) {
        user1.put( `/stats/storage-memory/${user1.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage allocated calls for itself', function( done ) {
        user1.put( `/stats/storage-allocated-calls/${user1.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create storage allocated memory for itself', function( done ) {
        user1.put( `/stats/storage-allocated-memory/${user1.username}/90000`, {} )
            .then( res => {
                test.bool( res.body.error ).isTrue();
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did get stats for itself', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.string( res.body.message ).is( `Successfully retrieved ${user1.username}'s stats` );
                test.bool( res.body.error ).isNotTrue();
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "data" );
                test.object( res.body.data ).hasProperty( "_id" );
                test.string( res.body.data.user ).is( user1.username);
                test.number( res.body.data.apiCallsAllocated ).is( 20000 );
                test.number( res.body.data.memoryAllocated ).is( 500000000 );
                test.number( res.body.data.apiCallsUsed ).is( 1 );
                test.number( res.body.data.memoryUsed ).is( 0 );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did get buckets for itself', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue();
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "data" );
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not get files for another user\'s bucket', function( done ) {
        user1.get( `/files/users/${config.adminUser.username}/buckets/BAD_ENTRY` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not get files for a non existant bucket', function( done ) {
        user1.get( `/files/users/${user1.username}/buckets/test` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Could not find the bucket 'test'" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create a bucket for another user', function( done ) {
        user1.post( `/buckets/user/${config.adminUser.username} + "/test`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "You don't have permission to make this request" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create a bucket with bad characters', function( done ) {
        user1.post( `/buckets/user/${user1.username}/�BAD!CHARS`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Please only use safe characters" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did create a new bucket called dinosaurs', function( done ) {
        user1.post( `/buckets/user/${user1.username}/dinosaurs`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Bucket 'dinosaurs' created" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not create a bucket with the same name as an existing one', function( done ) {
        user1.post( `/buckets/user/${user1.username}/dinosaurs`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "A Bucket with the name 'dinosaurs' has already been registered" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did create a bucket with a different name', function( done ) {
        user1.post( `/buckets/user/${user1.username}/dinosaurs2`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Bucket 'dinosaurs2' created" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not delete any buckets when the name is wrong', function( done ) {
        user1.delete( `/buckets/dinosaurs3,dinosaurs4`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [0] buckets" );
                test.array( res.body.data ).isEmpty();
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did get 2 buckets', function( done ) {
        user1.get( `/buckets/user/${user1.username}` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Found [3] buckets" );
                test.array( res.body.data ).hasLength( 3 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not upload a file to a bucket that does not exist', function( done ) {
        user1.attach( '"�$^&&', filePath )
            .post( "/buckets/dinosaurs3/upload" )
            .then( (res) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "No bucket exists with the name 'dinosaurs3'" );
                test.array( res.body.tokens ).hasLength( 0 );
                test.bool( res.body.error ).isTrue();
                done()
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did upload a file to dinosaurs', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then( (res) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not upload a file when the meta was invalid', function( done ) {
        user1
            .setContentType('application/x-www-form-urlencoded')
            .fields( {'meta': 'BAD META'} )
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Error: Meta data is not a valid JSON: SyntaxError: Unexpected token B in JSON at position 0" );
                test.array( res.body.tokens ).hasLength( 0 );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not upload a file when the meta was invalid', function( done ) {
        user1
            .setContentType('application/x-www-form-urlencoded')
            .fields( {'meta':  '{ "meta" : "good" }'} )
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs/upload" )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.bool( res.body.error ).isFalse();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user fetched the files of the dinosaur bucket', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .get( `/files/users/${user1.username}/buckets/dinosaurs` )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "data" );
                test.string( res.body.message ).is( "Found [2] files" );
                test.array( res.body.data ).hasLength( 2 );
                test.number( res.body.data[ 0 ].numDownloads ).is( 0 );
                test.number( res.body.data[ 0 ].size ).is( 226 );
                test.string( res.body.data[ 0 ].mimeType ).is( "image/png" );
                test.string( res.body.data[ 0 ].user ).is( user1.username );
                test.object( res.body.data[ 0 ] ).hasProperty( "publicURL" );
                test.bool( res.body.data[ 0 ].isPublic ).isTrue();
                test.object( res.body.data[ 0 ] ).hasProperty( "identifier" );
                test.object( res.body.data[ 0 ] ).hasProperty( "bucketId" );
                test.object( res.body.data[ 0 ] ).hasProperty( "created" );
                test.string( res.body.data[ 0 ].bucketName ).is( "dinosaurs" );
                test.object( res.body.data[ 0 ] ).hasProperty( "_id" );

                // Check the second files meta
                test.object( res.body.data[ 1 ] ).hasProperty( "meta" );
                test.string( res.body.data[ 1 ].meta.meta ).is( "good" );

                fileId = res.body.data[ 0 ].identifier;
                publicURL = res.body.data[ 0 ].publicURL;
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did not make a non-file public', function( done ) {
        user1.put( `/files/123/make-public`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "File '123' does not exist" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not make a non-file private', function( done ) {
        user1.put( `/files/123/make-private`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" )
                test.string( res.body.message ).is( "File '123' does not exist" )
                test.bool( res.body.error ).isTrue()
                done()
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did make a file public', function( done ) {
        user1.put( `/files/${fileId}/make-public`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "File is now public" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'did download the file off the bucket', function( done ) {
        test.httpAgent( publicURL )
            .get( "" ).expect( 200 ).expect( 'content-type', /image/ )
            .end( function( err, res ) {
                if ( err ) return done( err );
                done();
            } );
    } )

    it( 'regular user did make a file private', function( done ) {
        user1.put( `/files/${fileId}/make-private`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "File is now private" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user updated its stats accordingly', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 9 );
                test.number( res.body.data.memoryUsed ).is( 226 * 2 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did upload another file to dinosaurs2', function( done ) {
        user1
            .attach( 'small-image',filePath )
            .post( "/buckets/dinosaurs2/upload" )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user updated its stats with the 2nd upload accordingly', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 10 );
                test.number( res.body.data.memoryUsed ).is( 226 * 3 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'guest did not download a file with an invalid id anonomously', function( done ) {
        guest.code(404)
            .get( `/files/123/download`)
            .then( res => {
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'guest did download an image file with a valid id anonomously', function( done ) {
        guest
            .contentLength("226")
            .contentType(/image/)
            .get( "/files/" + fileId + "/download" )
            .then( ( res ) => {
                done();
            } ).catch( err => done( err ) );
    } )

    it( 'regular user did update the api calls to 5', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 11 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did upload another file to dinosaurs2', function( done ) {
        user1
            .attach( 'small-image', filePath )
            .post( "/buckets/dinosaurs2/upload" )
            .then( ( res ) => {
                test.object( res.body ).hasProperty( "message" );
                test.object( res.body ).hasProperty( "tokens" );
                test.string( res.body.message ).is( "Upload complete. [1] Files have been saved." );
                test.array( res.body.tokens ).hasLength( 1 );
                test.string( res.body.tokens[ 0 ].field ).is( "small-image" );
                test.string( res.body.tokens[ 0 ].filename ).is( "file.png" );
                test.bool( res.body.tokens[ 0 ].error ).isNotTrue();
                test.string( res.body.tokens[ 0 ].errorMsg ).is( "" );
                test.object( res.body.tokens[ 0 ] ).hasProperty( "file" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user fetched the uploaded file Id of the dinosaur2 bucket', function( done ) {
        user1.get( `/files/users/${user1.username}/buckets/dinosaurs2` )
            .then( res => {
                test.bool( res.body.error ).isNotTrue()
                fileId = res.body.data[ 1 ].identifier;
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular userdid not rename an incorrect file to testy', function( done ) {
        user1.put( `/files/123/rename-file`, { name: "testy" } )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "File '123' does not exist" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user regular user did not rename a correct file with an empty name', function( done ) {
        user1.put( `/files/${fileId}/rename-file`, { name: "" } )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Please specify the new name of the file" );
                test.bool( res.body.error ).isTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did rename a correct file to testy', function( done ) {
        user1.put( `/files/${fileId}/rename-file`, { name: "testy" } )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Renamed file to 'testy'" );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not remove a file from dinosaurs2 with a bad id', function( done ) {
        user1.delete( `/files/123`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [0] files" );
                test.array( res.body.data ).hasLength( 0 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did remove a file from dinosaurs2 with a valid id', function( done ) {
        user1.delete( `/files/${fileId}`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [1] files" );
                test.array( res.body.data ).hasLength( 1 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user updated its stats to reflect a file was deleted', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 14 );
                test.number( res.body.data.memoryUsed ).is( 226 * 3 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did not remove a bucket with a bad name', function( done ) {
        user1.delete( `/buckets/123` )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [0] buckets" );
                test.array( res.body.data ).hasLength( 0 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user did remove the bucket dinosaurs2', function( done ) {
        user1.delete( `/buckets/dinosaurs2`, {} )
            .then( res => {
                test.object( res.body ).hasProperty( "message" );
                test.string( res.body.message ).is( "Removed [1] buckets" );
                test.array( res.body.data ).hasLength( 1 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )

    it( 'regular user updated its stats that both a file and bucket were deleted', function( done ) {
        user1.get( `/stats/users/${user1.username}/get-stats` )
            .then( res => {
                test.number( res.body.data.apiCallsUsed ).is( 16 );
                test.number( res.body.data.memoryUsed ).is( 226 * 2 );
                test.bool( res.body.error ).isNotTrue();
                done();
            } ).catch( err => done( err ) );

    } )
} )