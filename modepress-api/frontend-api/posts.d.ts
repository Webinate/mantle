import { IPost } from '../types/models/i-post';
import { Page } from '../types/tokens/standard-tokens';
export declare function getAll(options: Partial<{
    visibility: 'all' | 'public' | 'private';
    categories: string[];
    tags: string[];
    rtags: string[];
    sort: boolean;
    index: number;
    limit: number;
    keyword: string;
    author: string;
    sortOrder: 'asc' | 'desc';
    minimal: boolean;
    verbose: boolean;
}>): Promise<Page<IPost>>;
export declare function getOne(options: {
    id: string;
    verbose?: boolean;
}): Promise<IPost>;
export declare function getBySlug(options: {
    slug: string;
    verbose?: boolean;
}): Promise<IPost>;
export declare function remove(id: string): Promise<Response>;
export declare function update(id: string, token: Partial<IPost>): Promise<IPost>;
export declare function create(token: Partial<IPost>): Promise<IPost>;
