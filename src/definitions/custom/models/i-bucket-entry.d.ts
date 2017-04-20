declare namespace Modepress {
    /**
     * The interface for describing each user's bucket
     */
    export interface IBucketEntry {
        _id?: any;
        name?: string;
        identifier?: string;
        user?: string;
        created?: number;
        memoryUsed?: number;
        meta?: any;
    }
}