declare module 'modepress' {
  /**
    * The interface for describing each user's bucket
    */
  export interface IStorageStats extends IModelEntry {
    user?: string;
    memoryUsed?: number;
    memoryAllocated?: number;
    apiCallsUsed?: number;
    apiCallsAllocated?: number;
  }
}