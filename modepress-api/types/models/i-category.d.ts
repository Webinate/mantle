import { IModelEntry } from './i-model-entry';
export interface ICategory extends IModelEntry {
    title?: string;
    slug?: string;
    parent?: string;
    description?: string;
}
