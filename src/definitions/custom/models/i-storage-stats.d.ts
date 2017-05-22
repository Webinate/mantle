
/**
 * The interface for describing each user's bucket
 */
export interface IStorageStats {
    user?: string;
    memoryUsed?: number;
    memoryAllocated?: number;
    apiCallsUsed?: number;
    apiCallsAllocated?: number;
}