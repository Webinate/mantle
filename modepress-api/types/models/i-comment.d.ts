import { IModelEntry } from './i-model-entry';
export interface IComment extends IModelEntry {
    author?: string;
    post?: string;
    parent?: string;
    public?: boolean;
    content?: string;
    children?: Array<string | any>;
    createdOn?: number;
    lastUpdated?: number;
}
