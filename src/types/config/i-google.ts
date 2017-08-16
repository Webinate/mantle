declare module 'modepress' {
  /*
   * Users stores data on an external cloud bucket with Google
   */
  export interface IGoogleProperties extends IRemoteOptions {
    /*
     * Path to the key file
     */
    keyFile: string;

    /*
     * Project ID
     */
    projectId: string;
  }
}