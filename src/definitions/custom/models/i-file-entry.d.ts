declare namespace Modepress {
    /**
     * The interface for describing each user's file
     */
    export interface IFileEntry {
        _id?: any;
        name?: string;
        user?: string;
        identifier?: string;
        bucketId?: string;
        bucketName?: string;
        publicURL?: string;
        created?: number;
        size?: number;
        mimeType?: string;
        isPublic?: boolean;
        numDownloads?: number;
        parentFile?: string | null;
        meta?: any;
    }
}