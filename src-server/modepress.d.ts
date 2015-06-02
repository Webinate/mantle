declare module modepress
{
    export interface IPost
    {
        _id?: any;
        author?: string;
        title?: string;
        slug?: string;
        content?: string;
        featuredImage?: string;
        categories?: Array<string>;
        tags?: Array<string>;
        createdOn?: number;
        lastUpdated?: number;
    }

    export interface ICategory
    {
        _id?: any;
        title?: string;
        slug?: string;
        parent?: string;
        description?: string;
    }

    export interface IResponse
    {
        message: string;
        error: boolean;
    }

    /*
    * A GET request that returns a data item
    */
    export interface IGetResponse<T> extends IResponse
    {
        data: T;
    }

    /*
    * A GET request that returns an array of data items
    */
    export interface IGetArrayResponse<T> extends IResponse
    {
        count: number;
        data: Array<T>;
    }

    export interface IMessage
    {
        name: string;
        email: string;
        message: string;
        phone?: string;
        website?: string;
    }

    export interface IGetPosts extends IGetArrayResponse<IPost> { }
    export interface IGetPost extends IGetResponse<IPost> { }
    export interface IGetCategory extends IGetResponse<ICategory> { }
    export interface IGetCategories extends IGetArrayResponse<ICategory> { }
}