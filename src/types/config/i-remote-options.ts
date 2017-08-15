declare module 'modepress' {

  /**
   * The base interface for all remote options
   */
  export interface IRemoteOptions {
  }

  /**
   * The properties for setting up a local bucket
   */
  export interface ILocalBucket extends IRemoteOptions {
    path: string;
  }
}