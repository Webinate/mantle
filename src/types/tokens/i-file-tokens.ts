export interface IUploadResponse {
  files: {
    size: number;
    path: string;
    name: string;
    type: string;
  }[];
}