export const apiUrl = `${process.env.root || '/api'}`;

export class ClientError extends Error {
  public response: Response;
  public code: number;

  constructor( message: string, code: number, response: Response ) {
    super( message );
    this.response = response;
    this.code = code;
  }
}

export function makeQueryString( options: Partial<{ [ name: string ]: boolean | string | number | Array<any> }> ) {
  let toRet = '?';
  for ( const i in options ) {

    switch ( typeof options[ i ] ) {
      case 'object':
        if ( options[ i ]!.constructor === Array )
          toRet += `${i}=${( options[ i ] as Array<string> ).join( ',' )}`;
        break;
      case 'undefined':
        break;
      case 'string':
      case 'number':
      case 'boolean':
        toRet += `${i}=${options[ i ]}`;
        break;
      default:
        toRet += `${i}=${options[ i ]!.toString()}`;
    }

    toRet += '&';
  }

  toRet = toRet.substr( 0, toRet.length - 1 );
  if ( toRet.length === 1 )
    return '';

  return encodeURI( toRet );
}

export async function getJson<T>( url: string ) {
  const resp = await get( url );
  return await resp.json() as T;
}

export async function get( url: string ) {
  const resp = await fetch( url, {
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, resp );

  return resp;
}

export async function postJson<T>( url: string, data: any ) {
  const resp = await post( url, data );
  return await resp.json() as T;
}

export async function post( url: string, data: any, headers?: any ) {
  let header = {};
  let body: any;

  if ( data instanceof FormData ) {
    body = data;
    header = headers;
  }
  else {
    body = JSON.stringify( data );
    header = { 'content-type': 'application/json', ...headers };
  }

  const resp = await fetch( url, {
    method: 'post',
    body: body,
    credentials: 'include',
    headers: new Headers( header )
  } );

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, resp );

  return resp;
}

export async function delJson<T>( url: string, data: any ) {
  const resp = await del( url, data );
  return await resp.json() as T;
}

export async function del( url: string, data?: any ) {
  const resp = await fetch( url, {
    method: 'delete',
    body: data ? JSON.stringify( data ) : undefined,
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, resp );

  return resp;
}

export async function putJson<T>( url: string, data: any ) {
  const resp = await put( url, data );
  return await resp.json() as T;
}

export async function put( url: string, data?: any ) {
  const resp = await fetch( url, {
    method: 'put',
    body: data ? JSON.stringify( data ) : undefined,
    credentials: 'include',
    headers: new Headers( {
      'content-type': 'application/json'
    } )
  } );

  if ( resp.status >= 400 && resp.status <= 500 )
    throw new ClientError( resp.statusText, resp.status, resp );

  return resp;
}