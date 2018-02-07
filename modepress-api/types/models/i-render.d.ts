import { IModelEntry } from './i-model-entry';
export interface IRender extends IModelEntry {
    url?: string;
    expiration?: number;
    createdOn?: number;
    updateDate?: number;
    html?: string;
}
