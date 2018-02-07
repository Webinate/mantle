/**
 * The base interface for all remote options
 */
export interface IRemoteOptions {
}
/**
 * The properties for setting up a local bucket
 */
export interface ILocalBucket extends IRemoteOptions {
    /**
     * The system path to a system directory to store the media in.
     * The directory must have write access
     */
    path: string;
    /**
     * The public URL for downloading the media
     */
    url: string;
}
