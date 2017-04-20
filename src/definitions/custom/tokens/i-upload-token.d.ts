declare namespace Modepress {
    /*
     * Token used to describe how the upload went
     */
    export interface IUploadToken {
        file: string;
        field: string;
        filename: string;
        error: boolean;
        errorMsg: string;
        url: string;
        extension: string
    }
}