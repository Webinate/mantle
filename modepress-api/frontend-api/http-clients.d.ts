export declare const apiUrl = "/api";
export declare class ClientError extends Error {
    response: Response;
    code: number;
    constructor(message: string, code: number, response: Response);
}
export declare function getJson<T>(url: string): Promise<T>;
export declare function get(url: string): Promise<Response>;
export declare function postJson<T>(url: string, data: any): Promise<T>;
export declare function post(url: string, data: any): Promise<Response>;
export declare function delJson<T>(url: string, data: any): Promise<T>;
export declare function del(url: string, data?: any): Promise<Response>;
export declare function putJson<T>(url: string, data: any): Promise<T>;
export declare function put(url: string, data?: any): Promise<Response>;
