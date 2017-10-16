export const apiUrl = '/api';

export class ClientError<T extends any> extends Error {
  public json: T;
  public code: number;

  constructor( message: string, code: number, json: T ) {
    super( message );
    this.json = json;
    this.code = code;
  }
}

export async function get<T>( url: string ) {
  const resp = await fetch( url, {
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const data = await resp.json() as T;

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, data );

  return data;
}

export async function post<T>( url: string, data: any ) {
  const resp = await fetch( url, {
    method: 'post',
    body: JSON.stringify( data ),
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, respData );

  return respData;
}

export async function del<T>( url: string, data?: any ) {
  const resp = await fetch( url, {
    method: 'delete',
    body: data ? JSON.stringify( data ) : undefined,
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, respData );

  return respData;
}

export async function put<T>( url: string, data?: any ) {
  const resp = await fetch( url, {
    method: 'put',
    body: data ? JSON.stringify( data ) : undefined,
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  const respData = await resp.json() as T;

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, respData );

  return respData;
}