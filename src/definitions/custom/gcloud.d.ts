// Created by Mathew Henson
// Based on the files here: https://github.com/GoogleCloudPlatform/gcloud-node/tree/master/lib/storage

declare module 'gcloud' {

    import * as fs from 'fs';

    export interface IOWner {
        entity: string;
    }

    export interface IMeta {
        etag: string;
        id: string;
        kind: string;
        location: string;
        metageneration: string;
        name: string;
        owner: IOWner
        projectNumber: string;
        selfLink: string;
        storageClass: string;
        timeCreated: string;
    }

    interface IACLUserController {
        addAllAuthenticatedUsers( callback?: ( err: Error, aclObject: IACL ) => any );
        deleteAllAuthenticatedUsers( callback?: ( err: Error, aclObject: IACL ) => any );
        addAllUsers( callback?: ( err: Error, aclObject: IACL ) => any );
        deleteAllUsers( callback?: ( err: Error, aclObject: IACL ) => any );
        addDomain( domain: string, callback?: ( err: Error, aclObject: IACL ) => any );
        deleteDomain( domain: string, callback?: ( err: Error, aclObject: IACL ) => any );
        addGroup( group: string, callback?: ( err: Error, aclObject: IACL ) => any );
        deleteGroup( group: string, callback?: ( err: Error, aclObject: IACL ) => any );
        addProject( project: string, callback?: ( err: Error, aclObject: IACL ) => any );
        deleteProject( project: string, callback?: ( err: Error, aclObject: IACL ) => any );
        addUser( user: string, callback?: ( err: Error, aclObject: IACL ) => any );
        deleteUser( user: string, callback?: ( err: Error, aclObject: IACL ) => any );
    }

    export interface IACL {
        OWNER_ROLE: string;
        READER_ROLE: string;
        WRITER_ROLE: string;

        default: IACL;
        pathPrefix: string;


        /**
        * An object of convenience methods to add or delete owner ACL permissions for a
        * given entity.
        *
        * The supported methods include:
        *
        myFile.acl.owners.addAllAuthenticatedUsers`
        *   - `myFile.acl.owners.deleteAllAuthenticatedUsers`
        *   - `myFile.acl.owners.addAllUsers`
        *   - `myFile.acl.owners.deleteAllUsers`
        *   - `myFile.acl.owners.addDomain`
        *   - `myFile.acl.owners.deleteDomain`
        *   - `myFile.acl.owners.addGroup`
        *   - `myFile.acl.owners.deleteGroup`
        *   - `myFile.acl.owners.addProject`
        *   - `myFile.acl.owners.deleteProject`
        *   - `myFile.acl.owners.addUser`
        *   - `myFile.acl.owners.deleteUser`
        *
        * @alias acl.owners
        *
        * @return {object}
        *
        * @example
        * var gcs = gcloud.storage({
        *   projectId: 'grape-spaceship-123'
        * });
        *
        * //-
        * // Add a user as an owner of a file.
        * //-
        * var myBucket = gcs.bucket('my-bucket');
        * var myFile = myBucket.file('my-file');
        * myFile.acl.owners.addUser('email@example.com', function(err, aclObject) {});
        *
        * //-
        * // For reference, the above command is the same as running the following.
        * //-
        * myFile.acl.add({
        *   entity: 'user-email@example.com',
        *   role: gcs.acl.OWNER_ROLE
        * }, function(err, aclObject) {});
        */
        owners: IACLUserController;

        /**
        * An object of convenience methods to add or delete reader ACL permissions for
        * a given entity.
        *
        * The supported methods include:
        *
        *   - `myFile.acl.readers.addAllAuthenticatedUsers`
        *   - `myFile.acl.readers.deleteAllAuthenticatedUsers`
        *   - `myFile.acl.readers.addAllUsers`
        *   - `myFile.acl.readers.deleteAllUsers`
        *   - `myFile.acl.readers.addDomain`
        *   - `myFile.acl.readers.deleteDomain`
        *   - `myFile.acl.readers.addGroup`
        *   - `myFile.acl.readers.deleteGroup`
        *   - `myFile.acl.readers.addProject`
        *   - `myFile.acl.readers.deleteProject`
        *   - `myFile.acl.readers.addUser`
        *   - `myFile.acl.readers.deleteUser`
        *
        * @alias acl.readers
        *
        * @return {object}
        *
        * @example
        * //-
        * // Add a user as a reader of a file.
        * //-
        * myFile.acl.readers.addUser('email@example.com', function(err, aclObject) {});
        *
        * //-
        * // For reference, the above command is the same as running the following.
        * //-
        * myFile.acl.add({
        *   entity: 'user-email@example.com',
        *   role: gcs.acl.READER_ROLE
        * }, function(err, aclObject) {});
        */
        readers: IACLUserController;

        /**
        * An object of convenience methods to add or delete writer ACL permissions for
        * a given entity.
        *
        * The supported methods include:
        *
        *   - `myFile.acl.writers.addAllAuthenticatedUsers`
        *   - `myFile.acl.writers.deleteAllAuthenticatedUsers`
        *   - `myFile.acl.writers.addAllUsers`
        *   - `myFile.acl.writers.deleteAllUsers`
        *   - `myFile.acl.writers.addDomain`
        *   - `myFile.acl.writers.deleteDomain`
        *   - `myFile.acl.writers.addGroup`
        *   - `myFile.acl.writers.deleteGroup`
        *   - `myFile.acl.writers.addProject`
        *   - `myFile.acl.writers.deleteProject`
        *   - `myFile.acl.writers.addUser`
        *   - `myFile.acl.writers.deleteUser`
        *
        * @alias acl.writers
        *
        * @return {object}
        *
        * @example
        * //-
        * // Add a user as a writer of a file.
        * //-
        * myFile.acl.writers.addUser('email@example.com', function(err, aclObject) {});
        *
        * //-
        * // For reference, the above command is the same as running the following.
        * //-
        * myFile.acl.add({
        *   entity: 'user-email@example.com',
        *   role: gcs.acl.WRITER_ROLE
        * }, function(err, aclObject) {});
        */
        writers: IACLUserController;

        /**
        * Add access controls on a {module:storage/bucket} or {module:storage/file}.
        *
        * @param {object} options - Configuration object.
        * @param {string} options.entity - Whose permissions will be added.
        * @param {string} options.role - Permissions allowed for the defined entity.
        *     See {module:storage#acl}.
        * @param {int=} options.generation - **File Objects Only** Select a specific
        *     revision of this file (as opposed to the latest version, the default).
        * @param {function} callback - The callback function.
        *
        * @alias acl.add
        *
        * @example
        * myBucket.acl.add({
        *   entity: 'user-useremail@example.com',
        *   role: gcs.acl.OWNER_ROLE
        * }, function(err, aclObject, apiResponse) {});
        *
        * //-
        * // For file ACL operations, you can also specify a `generation` property.
        * // Here is how you would grant ownership permissions to a user on a specific
        * // revision of a file.
        * //-
        * myFile.acl.add({
        *   entity: 'user-useremail@example.com',
        *   role: gcs.acl.OWNER_ROLE,
        *   generation: 1
        * }, function(err, aclObject, apiResponse) {});
        */
        add( options?: { entity?: string; role?: string; generation?: number; }, callback?: ( err: Error, aclObject: IACL, apiResponse: any ) => any );

        /**
        * Delete access controls on a {module:storage/bucket} or {module:storage/file}.
        *
        * @param {object=} options - Configuration object.
        * @param {string} options.entity - Whose permissions will be revoked.
        * @param {int=} options.generation - **File Objects Only** Select a specific
        *     revision of this file (as opposed to the latest version, the default).
        * @param {function} callback - The callback function.
        *
        * @alias acl.delete
        *
        * @example
        * myBucket.acl.delete({
        *   entity: 'user-useremail@example.com'
        * }, function(err, apiResponse) {});
        *
        * //-
        * // For file ACL operations, you can also specify a `generation` property.
        * //-
        * myFile.acl.delete({
        *   entity: 'user-useremail@example.com',
        *   generation: 1
        * }, function(err, apiResponse) {});
        */
        delete( options?: { entity?: string; generation?: number; }, callback?: ( err: Error, apiResponse: any ) => any );

        /**
        * Get access controls on a {module:storage/bucket} or {module:storage/file}. If
        * an entity is omitted, you will receive an array of all applicable access
        * controls.
        *
        * @param {object|function} options - Configuration object. If you want to
        *     receive a list of all access controls, pass the callback function as the
        *     only argument.
        * @param {string=} options.entity - Whose permissions will be fetched.
        * @param {int=} options.generation - **File Objects Only** Select a specific
        *     revision of this file (as opposed to the latest version, the default).
        * @param {function} callback - The callback function.
        *
        * @alias acl.get
        *
        * @example
        * myBucket.acl.get({
        *   entity: 'user-useremail@example.com'
        * }, function(err, aclObject, apiResponse) {});
        *
        * //-
        * // Get all access controls.
        * //-
        * myBucket.acl.get(function(err, aclObjects, apiResponse) {
        *   // aclObjects = [
        *   //   {
        *   //     entity: 'user-useremail@example.com',
        *   //     role: 'owner'
        *   //   }
        *   // ]
        * });
        *
        * //-
        * // For file ACL operations, you can also specify a `generation` property.
        * //-
        * myFile.acl.get({
        *   entity: 'user-useremail@example.com',
        *   generation: 1
        * }, function(err, aclObject, apiResponse) {});
        */
        get( callback?: ( err: Error, aclObject: IACL, apiResponse: any ) => any );
        get( options?: { entity?: string; generation?: number; }, callback?: ( err: Error, aclObject: IACL, apiResponse: any ) => any );

        /**
        * Update access controls on a {module:storage/bucket} or {module:storage/file}.
        *
        * @param {object=} options - Configuration object.
        * @param {string} options.entity - Whose permissions will be updated.
        * @param {string} options.role - Permissions allowed for the defined entity.
        *     See {module:storage#acl}.
        * @param {int=} options.generation - **File Objects Only** Select a specific
        *     revision of this file (as opposed to the latest version, the default).
        * @param {function} callback - The callback function.
        *
        * @alias acl.update
        *
        * @example
        * var gcs = gcloud.storage({
        *   projectId: 'grape-spaceship-123'
        * });
        *
        * myBucket.acl.update({
        *   entity: 'user-useremail@example.com',
        *   role: gcs.acl.WRITER_ROLE
        * }, function(err, apiResponse) {});
        *
        * //-
        * // For file ACL operations, you can also specify a `generation` property.
        * //-
        * myFile.acl.update({
        *   entity: 'user-useremail@example.com',
        *   role: gcs.acl.WRITER_ROLE,
        *   generation: 1
        * }, function(err, apiResponse) {});
        */
        update( options?: { entity?: string; role: string; generation?: number; }, callback?: ( err: Error, apiResponse: any ) => any );
    }

    export interface IFile {
        acl: IACL;
        metadata: any;

        /**
        * Copy this file to another file. By default, this will copy the file to the
        * same bucket, but you can choose to copy it to another Bucket by providing
        * either a Bucket or File object.
        *
        * @throws {Error} If the destination file is not provided.
        *
        * @param {string|module:storage/bucket|module:storage/file} destination -
        *     Destination file.
        * @param {function=} callback - The callback function.
        *
        * @example
        * //-
        * // You can pass in a variety of types for the destination.
        * //
        * // For all of the below examples, assume we are working with the following
        * // Bucket and File objects.
        * //-
        * var bucket = gcs.bucket('my-bucket');
        * var file = bucket.file('my-image.png');
        *
        * //-
        * // If you pass in a string for the destination, the file is copied to its
        * // current bucket, under the new name provided.
        * //-
        * file.copy('my-image-copy.png', function(err, copiedFile, apiResponse) {
        *   // `my-bucket` now contains:
        *   // - 'my-image.png'
        *   // - 'my-image-copy.png'
        *
        *   // `copiedFile` is an instance of a File object that refers to your new
        *   // file.
        * });
        *
        * //-
        * // If you pass in a Bucket object, the file will be copied to that bucket
        * // using the same name.
        * //-
        * var anotherBucket = gcs.bucket('another-bucket');
        * file.copy(anotherBucket, function(err, copiedFile, apiResponse) {
        *   // `my-bucket` still contains:
        *   // - 'my-image.png'
        *   //
        *   // `another-bucket` now contains:
        *   // - 'my-image.png'
        *
        *   // `copiedFile` is an instance of a File object that refers to your new
        *   // file.
        * });
        *
        * //-
        * // If you pass in a File object, you have complete control over the new
        * // bucket and filename.
        * //-
        * var anotherFile = anotherBucket.file('my-awesome-image.png');
        * file.copy(anotherFile, function(err, copiedFile, apiResponse) {
        *   // `my-bucket` still contains:
        *   // - 'my-image.png'
        *   //
        *   // `another-bucket` now contains:
        *   // - 'my-awesome-image.png'
        *
        *   // Note:
        *   // The `copiedFile` parameter is equal to `anotherFile`.
        * });
        */
        copy( destination: string | IBucket | IFile, callback?: ( err: Error, file: IFile, response: any ) => any );

        /**
        * Move this file to another location. By default, this will move the file to
        * the same bucket, but you can choose to move it to another Bucket by providing
        * either a Bucket or File object.
        *
        * **Warning**:
        * There is currently no atomic `move` method in the Google Cloud Storage API,
        * so this method is a composition of {module:storage/file#copy} (to the new
        * location) and {module:storage/file#delete} (from the old location). While
        * unlikely, it is possible that an error returned to your callback could be
        * triggered from either one of these API calls failing, which could leave a
        * duplicate file lingering.
        *
        * @throws {Error} If the destination file is not provided.
        *
        * @param {string|module:storage/bucket|module:storage/file} destination -
        *     Destination file.
        * @param {function=} callback - The callback function.
        *
        * @example
        * //-
        * // You can pass in a variety of types for the destination.
        * //
        * // For all of the below examples, assume we are working with the following
        * // Bucket and File objects.
        * //-
        * var bucket = gcs.bucket('my-bucket');
        * var file = bucket.file('my-image.png');
        *
        * //-
        * // If you pass in a string for the destination, the file is moved to its
        * // current bucket, under the new name provided.
        * //-
        * file.move('my-image-new.png', function(err, destinationFile, apiResponse) {
        *   // `my-bucket` no longer contains:
        *   // - 'my-image.png'
        *   // but contains instead:
        *   // - 'my-image-new.png'
        *
        *   // `destinationFile` is an instance of a File object that refers to your
        *   // new file.
        * });
        *
        * //-
        * // If you pass in a Bucket object, the file will be moved to that bucket
        * // using the same name.
        * //-
        * var anotherBucket = gcs.bucket('another-bucket');
        *
        * file.move(anotherBucket, function(err, destinationFile, apiResponse) {
        *   // `my-bucket` no longer contains:
        *   // - 'my-image.png'
        *   //
        *   // `another-bucket` now contains:
        *   // - 'my-image.png'
        *
        *   // `destinationFile` is an instance of a File object that refers to your
        *   // new file.
        * });
        *
        * //-
        * // If you pass in a File object, you have complete control over the new
        * // bucket and filename.
        * //-
        * var anotherFile = anotherBucket.file('my-awesome-image.png');
        *
        * file.move(anotherFile, function(err, destinationFile, apiResponse) {
        *   // `my-bucket` no longer contains:
        *   // - 'my-image.png'
        *   //
        *   // `another-bucket` now contains:
        *   // - 'my-awesome-image.png'
        *
        *   // Note:
        *   // The `destinationFile` parameter is equal to `anotherFile`.
        * });
        */
        move( destination: string | IBucket | IFile, callback?: ( err: Error, file: IFile, response: any ) => any );

        /**
        * Create a readable stream to read the contents of the remote file. It can be
        * piped to a writable stream or listened to for 'data' events to read a file's
        * contents.
        *
        * In the unlikely event there is a mismatch between what you downloaded and the
        * version in your Bucket, your error handler will receive an error with code
        * 'CONTENT_DOWNLOAD_MISMATCH'. If you receive this error, the best recourse is
        * to try downloading the file again.
        *
        * NOTE: Readable streams will emit the `complete` event when the file is fully
        * downloaded.
        *
        * @param {object=} options - Configuration object.
        * @param {string|boolean} options.validation - Possible values: `'md5'`,
        *     `'crc32c'`, or `false`. By default, data integrity is validated with an
        *     MD5 checksum for maximum reliability, falling back to CRC32c when an MD5
        *     hash wasn't returned from the API. CRC32c will provide better performance
        *     with less reliability. You may also choose to skip validation completely,
        *     however this is **not recommended**.
        * @param {number} options.start - A byte offset to begin the file's download
        *     from. Default is 0. NOTE: Byte ranges are inclusive; that is,
        *     `options.start = 0` and `options.end = 999` represent the first 1000
        *     bytes in a file or object. NOTE: when specifying a byte range, data
        *     integrity is not available.
        * @param {number} options.end - A byte offset to stop reading the file at.
        *     NOTE: Byte ranges are inclusive; that is, `options.start = 0` and
        *     `options.end = 999` represent the first 1000 bytes in a file or object.
        *     NOTE: when specifying a byte range, data integrity is not available.
        *
        * @example
        * //-
        * // <h4>Downloading a File</h4>
        * //
        * // The example below demonstrates how we can reference a remote file, then
        * // pipe its contents to a local file. This is effectively creating a local
        * // backup of your remote data.
        * //-
        * var fs = require('fs');
        * var myBucket = gcs.bucket('my-bucket');
        * var image = myBucket.file('image.png');
        *
        * image.createReadStream()
        *   .pipe(fs.createWriteStream('/Users/stephen/Photos/image.png'))
        *   .on('error', function(err) {})
        *   .on('response', function(response) {
        *     // Server connected and responded with the specified status and headers.
        *    })
        *   .on('complete', function() {
        *     // The file is fully downloaded.
        *   });
        *
        * //-
        * // To limit the downloaded data to only a byte range, pass an options object.
        * //-
        * var logFile = myBucket.file('access_log');
        * logFile.createReadStream({
        *     start: 10000,
        *     end: 20000
        *   })
        *   .pipe(fs.createWriteStream('/Users/stephen/logfile.txt'))
        *   .on('error', function(err) {});
        *
        * //-
        * // To read a tail byte range, specify only `options.end` as a negative
        * // number.
        * //-
        * var logFile = myBucket.file('access_log');
        * logFile.createReadStream({
        *     end: -100
        *   })
        *   .pipe(fs.createWriteStream('/Users/stephen/logfile.txt'))
        *   .on('error', function(err) {});
        */
        createReadStream( options?: {
            validation?: string | boolean,
            start: number,
            end: number
        } ): fs.ReadStream;

        /**
        * Create a writable stream to overwrite the contents of the file in your
        * bucket.
        *
        * A File object can also be used to create files for the first time.
        *
        * NOTE: Writable streams will emit the `complete` event when the file is fully
        * uploaded.
        *
        * @param {object=} options - Configuration object.
        * @param {object=} options.metadata - Set the metadata for this file.
        * @param {boolean=} options.resumable - Force a resumable upload. NOTE: When
        *     working with streams, the file format and size is unknown until it's
        *     completely consumed. Because of this, it's best for you to be explicit
        *     for what makes sense given your input. Read more about resumable uploads
        *     [here](http://goo.gl/1JWqCF).
        * @param {string|boolean} options.validation - Possible values: `'md5'`,
        *     `'crc32c'`, or `false`. By default, data integrity is validated with an
        *     MD5 checksum for maximum reliability. CRC32c will provide better
        *     performance with less reliability. You may also choose to skip validation
        *     completely, however this is **not recommended**.
        *
        * @example
        * //-
        * // <h4>Uploading a File</h4>
        * //
        * // Now, consider a case where we want to upload a file to your bucket. You
        * // have the option of using {module:storage/bucket#upload}, but that is just
        * // a convenience method which will do the following.
        * //-
        * var fs = require('fs');
        * var image = myBucket.file('image.png');
        *
        * fs.createReadStream('/Users/stephen/Photos/birthday-at-the-zoo/panda.jpg')
        *   .pipe(image.createWriteStream())
        *   .on('error', function(err) {})
        *   .on('complete', function(metadata) {
        *     // The file upload is complete.
        *   });
        *
        * //-
        * // <h4>Uploading a File with Metadata</h4>
        * //
        * // One last case you may run into is when you want to upload a file to your
        * // bucket and set its metadata at the same time. Like above, you can use
        * // {module:storage/bucket#upload} to do this, which is just a wrapper around
        * // the following.
        * //-
        * var fs = require('fs');
        * var image = myBucket.file('image.png');
        *
        * fs.createReadStream('/Users/stephen/Photos/birthday-at-the-zoo/panda.jpg')
        *   .pipe(image.createWriteStream({
        *     metadata: {
        *       contentType: 'image/jpeg',
        *       metadata: {
        *         custom: 'metadata'
        *       }
        *     }
        *   }))
        *   .on('error', function(err) {});
        */
        createWriteStream( options?: {
            metadata?: any,
            resumable?: boolean,
            validation?: string | boolean
        } ): fs.WriteStream;

        /**
        * Delete the file.
        *
        * @param {function=} callback - The callback function.
        *
        * @example
        * file.delete(function(err, apiResponse) {});
        */
        delete( callback?: ( err: Error, apiResponse: any ) => any );

        /**
        * Convenience method to download a file into memory or to a local destination.
        *
        * @param {object=} options - Optional configuration. The arguments match those
        *     passed to {module:storage/file#createReadStream}.
        * @param {string} options.destination - Local file path to write the file's
        *     contents to.
        * @param {function} callback - The callback function.
        *
        * @example
        * //-
        * // Download a file into memory. The contents will be available as the second
        * // argument in the demonstration below, `contents`.
        * //-
        * file.download(function(err, contents) {});
        *
        * //-
        * // Download a file to a local destination.
        * //-
        * file.download({
        *   destination: '/Users/stephen/Desktop/file-backup.txt'
        * }, function(err) {});
        */
        download( options?: {
            destination?: string,
            validation?: string | boolean,
            start: number,
            end: number
        }, callback?: ( err: Error, fileContents: Buffer ) => any );

        /**
        * Get the file's metadata.
        *
        * @param {function=} callback - The callback function.
        *
        * @example
        * file.getMetadata(function(err, metadata, apiResponse) {});
        */
        getMetadata( callback?: ( err: Error, meta: any, apiResponse: any ) => any );

        /**
        * Get a signed policy document to allow a user to upload data with a POST
        * request.
        *
        * *[Reference](http://goo.gl/JWJEkG).*
        *
        * @throws {Error} If an expiration timestamp from the past is given.
        * @throws {Error} If options.equals has an array with less or more than two
        *     members.
        * @throws {Error} If options.startsWith has an array with less or more than two
        *     members.
        *
        * @param {object} options - Configuration object.
        * @param {object} options.expiration - Timestamp (seconds since epoch) when
        *     this policy will expire.
        * @param {array|array[]=} options.equals - Array of request parameters and
        *     their expected value (e.g. [['$<field>', '<value>']]). Values are
        *     translated into equality constraints in the conditions field of the
        *     policy document (e.g. ['eq', '$<field>', '<value>']). If only one
        *     equality condition is to be specified, options.equals can be a one-
        *     dimensional array (e.g. ['$<field>', '<value>']).
        * @param {array|array[]=} options.startsWith - Array of request parameters and
        *     their expected prefixes (e.g. [['$<field>', '<value>']). Values are
        *     translated into starts-with constraints in the conditions field of the
        *     policy document (e.g. ['starts-with', '$<field>', '<value>']). If only
        *     one prefix condition is to be specified, options.startsWith can be a one-
        *     dimensional array (e.g. ['$<field>', '<value>']).
        * @param {string=} options.acl - ACL for the object from possibly predefined
        *     ACLs.
        * @param {string=} options.successRedirect - The URL to which the user client
        *     is redirected if the upload is successful.
        * @param {string=} options.successStatus - The status of the Google Storage
        *     response if the upload is successful (must be string).
        * @param {object=} options.contentLengthRange
        * @param {number} options.contentLengthRange.min - Minimum value for the
        *     request's content length.
        * @param {number} options.contentLengthRange.max - Maximum value for the
        *     request's content length.
        *
        * @example
        * file.getSignedPolicy({
        *   equals: ['$Content-Type', 'image/jpeg'],
        *   contentLengthRange: { min: 0, max: 1024 },
        *   expiration: Math.round(Date.now() / 1000) + (60 * 60 * 24 * 14) // 2 weeks.
        * }, function(err, policy) {
        *   // policy.string: the policy document in plain text.
        *   // policy.base64: the policy document in base64.
        *   // policy.signature: the policy signature in base64.
        * });
        */
        getSignedPolicy( options?: {
            expiration: number;
            equals?: Array<any> | Array<Array<any>>;
            startsWith?: Array<any> | Array<Array<any>>;
            acl?: any;
            successRedirect?: string;
            successStatus?: string;
            contentLengthRange?: any;
        }, callback?: ( err: Error, data: { string: any; base64: any; signature: any } ) => any );

        /**
        * Get a signed URL to allow limited time access to the file.
        *
        * *[Reference](http://goo.gl/LcqhjU).*
        *
        * @throws {Error} if an expiration timestamp from the past is given.
        *
        * @param {object} options - Configuration object.
        * @param {string} options.action - 'read', 'write', or 'delete'
        * @param {string=} options.contentMd5 - The MD5 digest value in base64. If you
        *     provide this, the client must provide this HTTP header with this same
        *     value in its request.
        * @param {string=} options.contentType - If you provide this value, the client
        *     must provide this HTTP header set to the same value.
        * @param {number} options.expires - Timestamp (seconds since epoch) when this
        *     link will expire.
        * @param {string=} options.extensionHeaders - If these headers are used, the
        *     server will check to make sure that the client provides matching values.
        * @param {string=} options.promptSaveAs - The filename to prompt the user to
        *     save the file as when the signed url is accessed. This is ignored if
        *     options.responseDisposition is set.
        * @param {string=} options.responseDisposition - The
        *     response-content-disposition parameter (http://goo.gl/yMWxQV) of the
        *     signed url.
        * @param {string=} options.responseType - The response-content-type parameter
        *     of the signed url.
        * @param {function=} callback - The callback function.
        *
        * @example
        * file.getSignedUrl({
        *   action: 'read',
        *   expires: Math.round(Date.now() / 1000) + (60 * 60 * 24 * 14), // 2 weeks.
        *   promptSaveAs: 'filename.ext'
        * }, function(err, url) {});
        */
        getSignedUrl( options?: {
            action?: string,
            contentType?: string,
            extensionHeaders?: string,
            promptSaveAs?: string,
            responseDisposition?: string,
            responseType?: string
        }, callback?: ( err: Error, url: string ) => any );

        /**
        * Merge the given metadata with the current remote file's metadata. This will
        * set metadata if it was previously unset or update previously set metadata. To
        * unset previously set metadata, set its value to null.
        *
        * You can set custom key/value pairs in the metadata key of the given object,
        * however the other properties outside of this object must adhere to the
        * [official API documentation](https://goo.gl/BOnnCK).
        *
        * See the examples below for more information.
        *
        * @param {object} metadata - The metadata you wish to update.
        * @param {function=} callback - The callback function.
        *
        * @example
        * file.setMetadata({
        *   contentType: 'application/x-font-ttf',
        *   metadata: {
        *     my: 'custom',
        *     properties: 'go here'
        *   }
        * }, function(err, metadata, apiResponse) {});
        *
        * // Assuming current metadata = { hello: 'world', unsetMe: 'will do' }
        * file.setMetadata({
        *   metadata: {
        *     abc: '123', // will be set.
        *     unsetMe: null, // will be unset (deleted).
        *     hello: 'goodbye' // will be updated from 'hello' to 'goodbye'.
        *   }
        * }, function(err, metadata, apiResponse) {
        *   // metadata should now be { abc: '123', hello: 'goodbye' }
        * });
        */
        setMetadata( metadata: any, callback?: ( err: Error, meta: any, responseApi: any ) => any );

        /**
        * Make a file private to the project and remove all other permissions.
        * Set `options.strict` to true to make the file private to only the owner.
        *
        * @param {object=} options - The configuration object.
        * @param {boolean=} options.strict - If true, set the file to be private to
        *     only the owner user. Otherwise, it will be private to the project.
        * @param {function=} callback - The callback function.
        *
        * @example
        *
        * //-
        * // Set the file private so only project maintainers can see and modify it.
        * //-
        * file.makePrivate(function(err) {});
        *
        * //-
        * // Set the file private so only the owner can see and modify it.
        * //-
        * file.makePrivate({ strict: true }, function(err) {});
        */
        makePrivate( options?: {
            strict?: boolean;
        }, callback?: ( err: Error ) => any );

        /**
        * Set a file to be publicly readable and maintain all previous permissions.
        *
        * @param {function=} callback - The callback function.
        *
        * @example
        * file.makePublic(function(err, apiResponse) {});
        */
        makePublic( callback?: ( err: Error, apiResponse: any ) => any );
    }

    export interface IBucket {
        acl: IACL;
        metadata: IMeta
        name: string;
        storage: Storage

        /**
        * Create a File object. See {module:storage/file} to see how to handle
        * the different use cases you may have.
        *
        * @param {string} name - The name of the file in this bucket.
        * @param {object=} options - Configuration options.
        * @param {string|number} options.generation - Only use a specific revision of
        *     this file.
        * @return {module:storage/file}
        *
        * @example
        * var file = bucket.file('my-existing-file.png');
        */
        file( name: string, options?: { generation: string | number } ): IFile;

        /**
        * Get File objects for the files currently in the bucket.
        *
        * @param {object=} query - Query object.
        * @param {string} query.delimiter - Results will contain only objects whose
        *     names, aside from the prefix, do not contain delimiter. Objects whose
        *     names, aside from the prefix, contain delimiter will have their name
        *     truncated after the delimiter, returned in `apiResponse.prefixes`.
        *     Duplicate prefixes are omitted.
        * @param {string} query.prefix - Filter results to objects whose names begin
        *     with this prefix.
        * @param {number} query.maxResults - Maximum number of items plus prefixes to
        *     return.
        * @param {string} query.pageToken - A previously-returned page token
        *     representing part of the larger set of results to view.
        * @param {bool} query.versions - If true, returns File objects scoped to their
        *     versions.
        * @param {function} callback - The callback function.
        *
        * @example
        * bucket.getFiles(function(err, files, nextQuery, apiResponse) {
        *   if (nextQuery) {
        *     // nextQuery will be non-null if there are more results.
        *     bucket.getFiles(nextQuery, function(err, files, nextQ, apiResponse) {});
        *   }
        *
        *   // The `metadata` property is populated for you with the metadata at the
        *   // time of fetching.
        *   files[0].metadata;
        *
        *   // However, in cases where you are concerned the metadata could have
        *   // changed, use the `getMetadata` method.
        *   files[0].getMetadata(function(err, metadata) {});
        * });
        *
        * //-
        * // Fetch using a query.
        * //-
        * bucket.getFiles({
        *   maxResults: 5
        * }, function(err, files, nextQuery, apiResponse) {});
        *
        * //-
        * // If your bucket has versioning enabled, you can get all of your files
        * // scoped to their generation.
        * //-
        * bucket.getFiles({
        *   versions: true
        * }, function(err, files, nextQuery, apiResponse) {
        *   // Each file is scoped to its generation.
        * });
        */
        getFiles( query: {
            delimiter?: string;
            prefix?: string;
            maxResults?: number;
            pageToken?: string;
            versions?: boolean;
        }, callback: ( err?: Error, files?: Array<IFile>, nextQuery?: any, response?: any ) => any ): any;
        getFiles( callback: ( err?: Error, files?: Array<IFile>, nextQuery?: any, response?: any ) => any ): any;

        /**
        * Get the bucket's metadata.
        *
        * To set metadata, see {module:storage/bucket#setMetadata}.
        *
        * @param {function=} callback - The callback function.
        *
        * @example
        * bucket.getMetadata(function(err, metadata, apiResponse) {});
        */
        getMetadata( callback: ( err?: Error, meta?: any, response?: any ) => any );

        /**
        * Set the bucket's metadata.
        *
        * @param {object} metadata - The metadata you wish to set.
        * @param {function=} callback - The callback function.
        *
        * @example
        * //-
        * // Set website metadata field on the bucket.
        * //-
        * bucket.setMetadata({
        *   website: {
        *     mainPageSuffix: 'http://example.com',
        *     notFoundPage: 'http://example.com/404.html'
        *   }
        * }, function(err, metadata, apiResponse) {});
        *
        * //-
        * // Enable versioning for your bucket.
        * //-
        * bucket.setMetadata({
        *   versioning: {
        *     enabled: true
        *   }
        * }, function(err, metadata, apiResponse) {});
        */
        setMetadata( metadata: any, callback: ( err?: Error, meta?: any, response?: any ) => any );

        /**
        * Make the bucket listing private.
        *
        * You may also choose to make the contents of the bucket private by specifying
        * `includeFiles: true`. This will automatically run
        * {module:storage/file#makePrivate} for every file in the bucket.
        *
        * When specifying `includeFiles: true`, use `force: true` to delay execution of
        * your callback until all files have been processed. By default, the callback
        * is executed after the first error. Use `force` to queue such errors until all
        * files have been procssed, after which they will be returned as an array as
        * the first argument to your callback.
        *
        * NOTE: This may cause the process to be long-running and use a high number of
        * requests. Use with caution.
        *
        * @param {object=} options - The configuration object.
        * @param {boolean} options.includeFiles - Make each file in the bucket private.
        *     Default: `false`.
        * @param {boolean} options.force - Queue errors occurred while making files
        *     private until all files have been processed.
        * @param {function} callback - The callback function.
        *
        * @example
        * //-
        * // Make the bucket private.
        * //-
        * bucket.makePrivate(function(err) {});
        *
        * //-
        * // Make the bucket and its contents private.
        * //-
        * var opts = {
        *   includeFiles: true
        * };
        *
        * bucket.makePrivate(opts, function(err, files) {
        *   // `err`:
        *   //    The first error to occur, otherwise null.
        *   //
        *   // `files`:
        *   //    Array of files successfully made private in the bucket.
        * });
        *
        * //-
        * // Make the bucket and its contents private, using force to suppress errors
        * // until all files have been processed.
        * //-
        * var opts = {
        *   includeFiles: true,
        *   force: true
        * };
        *
        * bucket.makePrivate(opts, function(errors, files) {
        *   // `errors`:
        *   //    Array of errors if any occurred, otherwise null.
        *   //
        *   // `files`:
        *   //    Array of files successfully made private in the bucket.
        * });
        */
        makePrivate( options?: { includeFiles: boolean; force: boolean }, callback?: ( errors?: Array<Error>, files?: Array<IFile> ) => any );

        /**
        * Make the bucket publicly readable.
        *
        * You may also choose to make the contents of the bucket publicly readable by
        * specifying `includeFiles: true`. This will automatically run
        * {module:storage/file#makePublic} for every file in the bucket.
        *
        * When specifying `includeFiles: true`, use `force: true` to delay execution of
        * your callback until all files have been processed. By default, the callback
        * is executed after the first error. Use `force` to queue such errors until all
        * files have been procssed, after which they will be returned as an array as
        * the first argument to your callback.
        *
        * NOTE: This may cause the process to be long-running and use a high number of
        * requests. Use with caution.
        *
        * @param {object=} options - The configuration object.
        * @param {boolean} options.includeFiles - Make each file in the bucket publicly
        *     readable. Default: `false`.
        * @param {boolean} options.force - Queue errors occurred while making files
        *     public until all files have been processed.
        * @param {function} callback - The callback function.
        *
        * @example
        * //-
        * // Make the bucket publicly readable.
        * //-
        * bucket.makePublic(function(err) {});
        *
        * //-
        * // Make the bucket and its contents publicly readable.
        * //-
        * var opts = {
        *   includeFiles: true
        * };
        *
        * bucket.makePublic(opts, function(err, files) {
        *   // `err`:
        *   //    The first error to occur, otherwise null.
        *   //
        *   // `files`:
        *   //    Array of files successfully made public in the bucket.
        * });
        *
        * //-
        * // Make the bucket and its contents publicly readable, using force to
        * // suppress errors until all files have been processed.
        * //-
        * var opts = {
        *   includeFiles: true,
        *   force: true
        * };
        *
        * bucket.makePublic(opts, function(errors, files) {
        *   // `errors`:
        *   //    Array of errors if any occurred, otherwise null.
        *   //
        *   // `files`:
        *   //    Array of files successfully made public in the bucket.
        * });
        */
        makePublic( options?: { includeFiles: boolean; force: boolean }, callback?: ( errors?: Array<Error>, files?: Array<IFile> ) => any );

        /**
        * Upload a file to the bucket. This is a convenience method that wraps the
        * functionality provided by a File object, {module:storage/file}.
        *
        * @param {string} localPath - The fully qualified path to the file you wish to
        *     upload to your bucket.
        * @param {object=} options - Configuration options.
        * @param {string|module:storage/file} options.destination - The place to save
        *     your file. If given a string, the file will be uploaded to the bucket
        *     using the string as a filename. When given a File object, your local file
        *     will be uploaded to the File object's bucket and under the File object's
        *     name. Lastly, when this argument is omitted, the file is uploaded to your
        *     bucket using the name of the local file.
        * @param {object=} options.metadata - Metadata to set for your file.
        * @param {boolean=} options.resumable - Force a resumable upload. (default:
        *     true for files larger than 5MB). Read more about resumable uploads
        *     [here](http://goo.gl/1JWqCF). NOTE: This behavior is only possible with
        *     this method, and not {module:storage/file#createWriteStream}. When
        *     working with streams, the file format and size is unknown until it's
        *     completely consumed. Because of this, it's best for you to be explicit
        *     for what makes sense given your input.
        * @param {function} callback - The callback function.
        * @param {string|boolean} options.validation - Possible values: `'md5'`,
        *     `'crc32c'`, or `false`. By default, data integrity is validated with an
        *     MD5 checksum for maximum reliability. CRC32c will provide better
        *     performance with less reliability. You may also choose to skip validation
        *     completely, however this is **not recommended**.
        *
        * @example
        * //-
        * // The easiest way to upload a file.
        * //-
        * bucket.upload('/local/path/image.png', function(err, file, apiResponse) {
        *   // Your bucket now contains:
        *   // - 'image.png' (with the contents of `/local/path/image.png')
        *
        *   // `file` is an instance of a File object that refers to your new file.
        * });
        *
        * //-
        * // It's not always that easy. You will likely want to specify the filename
        * // used when your new file lands in your bucket.
        * //
        * // You may also want to set metadata or customize other options.
        * //-
        * var options = {
        *   destination: 'new-image.png',
        *   resumable: true,
        *   validation: 'crc32c',
        *   metadata: {
        *     event: 'Fall trip to the zoo'
        *   }
        * };
        *
        * bucket.upload('local-image.png', options, function(err, file) {
        *   // Your bucket now contains:
        *   // - 'new-image.png' (with the contents of `local-image.png')
        *
        *   // `file` is an instance of a File object that refers to your new file.
        * });
        *
        * //-
        * // You may also re-use a File object, {module:storage/file}, that references
        * // the file you wish to create or overwrite.
        * //-
        * var options = {
        *   destination: bucket.file('existing-file.png'),
        *   resumable: false
        * };
        *
        * bucket.upload('local-img.png', options, function(err, newFile) {
        *   // Your bucket now contains:
        *   // - 'existing-file.png' (with the contents of `local-img.png')
        *
        *   // Note:
        *   // The `newFile` parameter is equal to `file`.
        * });
        */
        upload( localPath: string, options: any, callback: ( err?: Error, newFile?: IFile ) => any );

        /**
        * Combine mutliple files into one new file.
        *
        * @throws {Error} if a non-array is provided as sources argument.
        * @throws {Error} if less than two sources are provided.
        * @throws {Error} if no destination is provided.
        * @throws {Error} if content type can't be determined for the destination file.
        *
        * @param {string[]|module:storage/file} sources - The source files that will be combined.
        * @param {string|module:storage/file} destination - The file you would like the source files combined into.
        * @param {function=} callback - The callback function.
        *
        * @example
        * var logBucket = gcs.bucket('log-bucket');
        *
        * var logs2013 = logBucket.file('2013-logs.txt');
        * var logs2014 = logBucket.file('2014-logs.txt');
        *
        * var allLogs = logBucket.file('all-logs.txt');
        *
        * logBucket.combine([
        *   logs2013,
        *   logs2014
        * ], allLogs, function(err, newFile, apiResponse) {
        *   // newFile === allLogs
        * });
        */
        combine( sources: Array<string> | IFile, destination: string | IFile, callback: ( err?: Error, destination?: string, response?: any ) => any ): any;

        /**
        * Delete the bucket.
        *
        * @param {function=} callback - The callback function.
        *
        * @example
        * var bucket = gcs.bucket('delete-me');
        * bucket.delete(function(err, apiResponse) {});
        */
        delete( callback: ( err?: Error, apiResponse?: any ) => any )
    }

    export interface IGCS {
        acl: IACL;

        /**
       * Get a reference to a Google Cloud Storage bucket.
       *
       * @param {object|string} name - Name of the existing bucket.
       * @return {module:storage/bucket}
       *
       * @example
       * var gcloud = require('gcloud')({
       *   projectId: 'grape-spaceship-123',
       *   keyFilename: '/path/to/keyfile.json'
       * });
       *
       * var gcs = gcloud.storage();
       *
       * var albums = gcs.bucket('albums');
       * var photos = gcs.bucket('photos');
       */
        bucket( bucketName: string ): IBucket;

        /**
        * Create a bucket.
        * @param {string} name - Name of the bucket to create.
        * @param {object=} metadata - Metadata to set for the bucket.
        * @param {function} callback - The callback function.
        * @throws {Error} If a name is not provided.
        * @example
        * var callback = function(err, bucket, apiResponse) {
        *   // `bucket` is a Bucket object.
        * };
        *
        * gcs.createBucket('new-bucket', callback);
        *
        * //-
        * // Specify metadata.
        * //-
        * var metadata = {
        *   mainPageSuffix: '/unknown/',
        *   maxAgeSeconds: 90
        * };
        *
        * gcs.createBucket('new-bucket', metadata, callback);
        *
        * //-
        * // Enable versioning on a new bucket.
        * //-
        * var metadata = {
        *   versioning: {
        *     enabled: true
        *   }
        * };
        *
        * gcs.createBucket('new-bucket', metadata, callback);
        */
        createBucket( bucketName: string, callback: ( err: Error, bucket: IBucket ) => any ): any;
        createBucket( bucketName: string, metadata: any, callback: ( err: Error, bucket: IBucket ) => any ): any;

        /**
        * Get Bucket objects for all of the buckets in your project.
        *
        * @param {object=} query - Query object.
        * @param {number} query.maxResults - Maximum number of items plus prefixes to
        *     return.
        * @param {string} query.pageToken - A previously-returned page token
        *     representing part of the larger set of results to view.
        * @param {function} callback - The callback function.
        *
        * @example
        * gcs.getBuckets(function(err, buckets, nextQuery) {
        *   if (nextQuery) {
        *     // nextQuery will be non-null if there are more results.
        *     var callback = function(err, buckets, nextQuery, apiResponse){};
        *     gcs.getBuckets(nextQuery, callback);
        *   }
        *
        *   // The `metadata` property is populated for you with the metadata at the
        *   // time of fetching.
        *   buckets[0].metadata;
        *
        *   // However, in cases where you are concerned the metadata could have
        *   // changed, use the `getMetadata` method.
        *   buckets[0].getMetadata(function(err, metadata, apiResponse) {});
        * });
        *
        * //-
        * // Fetch using a query.
        * //-
        * gcs.getBuckets({
        *   maxResults: 5
        * }, function(err, buckets, nextQuery, apiResponse) {});
        */
        getBuckets( query: { maxResults?: number; pageToken?: string; }, callback?: ( err: Error, buckets: Array<IBucket>, nextQuery?: Function ) => any );
    }

    export function storage( options: { keyFilename?: string, credentials?: { client_email: string; private_key: string; }, projectId: string } ): IGCS;
}