import { IFileEntry } from '../models/i-file-entry';
import { IBucketEntry } from '../models/i-bucket-entry';

/*
 * Describes the different types of event interfaces we can use to interact with the system via web sockets
 */
export namespace SocketTokens {
    export type ClientInstructionType = (
        'Login' |
        'Logout' |
        'Activated' |
        'Removed' |
        'FileUploaded' |
        'FileRemoved' |
        'BucketUploaded' |
        'BucketRemoved' |
        'MetaRequest'
    );

    export type ServerInstructionType = (
        'MetaRequest'
    );

    /**
     * The base interface for all data that is serialized & sent to clients or server.
     * The type property describes to the reciever what kind of data to expect.
     */
    export interface IToken {
        error?: string;
        type: ClientInstructionType | ServerInstructionType | string;
    }

    /*
     * Describes a get/set Meta request, which can fetch or set meta data for a given user
     * if you provide a property value, then only that specific meta property is edited.
     * If not provided, then the entire meta data is set.
     */
    export interface IMetaToken extends IToken {
        username?: string;
        property?: string;
        val?: any;
    }

    /*
     * The socket user event
     */
    export interface IUserToken extends IToken {
        username: string;
    }

    /*
     * Interface for file added events
     */
    export interface IFileToken extends IToken {
        username: string;
        file: IFileEntry;
    }

    /*
     * Interface for a bucket being added
     */
    export interface IBucketToken extends IToken {
        username: string;
        bucket: IBucketEntry
    }
}