import { IModelEntry } from './i-model-entry';

/*
* Describes the comment model
*/
export interface IComment extends IModelEntry {
    author?: string;
    post?: string;
    parent?: string;
    public?: boolean;
    content?: string;
    children?: Array<string>;
    createdOn?: number;
    lastUpdated?: number;
}