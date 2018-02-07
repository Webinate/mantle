import { IBucketEntry } from '../models/i-bucket-entry';
import { IFileEntry } from '../models/i-file-entry';
export declare namespace SocketTokens {
    type ClientInstructionType = ('Login' | 'Logout' | 'Activated' | 'Removed' | 'FileUploaded' | 'FileRemoved' | 'BucketUploaded' | 'BucketRemoved' | 'MetaRequest');
    type ServerInstructionType = ('MetaRequest');
    /**
     * The base interface for all data that is serialized & sent to clients or server.
     * The type property describes to the reciever what kind of data to expect.
     */
    interface IToken {
        error?: string;
        type: ClientInstructionType | ServerInstructionType | string;
    }
    interface IMetaToken extends IToken {
        username?: string;
        property?: string;
        val?: any;
    }
    interface IUserToken extends IToken {
        username: string;
    }
    interface IFileToken extends IToken {
        username: string;
        file: IFileEntry;
    }
    interface IBucketToken extends IToken {
        username: string;
        bucket: IBucketEntry;
    }
}
