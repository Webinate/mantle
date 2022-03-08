/*
 * The most basic response from the server. The base type of all responses.
 */
export interface IResponse {}

export interface ISimpleResponse extends IResponse {
  message: string;
}

/*
 * A GET request that returns an array of data items
 */
export interface Page<T> {
  count: number;
  data: Array<T>;
  index: number;
  limit: number;
}
