import { getJson, get, postJson, putJson, makeQueryString, apiUrl } from './http-clients';
import { IAuthenticationResponse, ILoginToken, IRegisterToken, ISimpleResponse } from '../index';

const rootPath = `${apiUrl}/auth`;

export type GetAllOptions = {
  search: string;
  index: number;
  limit: number;
  verbose: boolean;
}


export async function authenticated( verbose: boolean = true ) {
  return await getJson<IAuthenticationResponse>( `${rootPath}/authenticated` + makeQueryString( { verbose } ) );
}

export async function logout() {
  await get( `${rootPath}/logout` );
}

export async function activateAccount( options: { user: string; key: string; origin: string; } ) {
  return await getJson<IAuthenticationResponse>( `${rootPath}/activate-account` + makeQueryString( options ) );
}

export async function login( token: ILoginToken ) {
  return await postJson<IAuthenticationResponse>( `${rootPath}/login`, token );
}

export async function register( token: IRegisterToken ) {
  return await postJson<IAuthenticationResponse>( `${rootPath}/register`, token );
}

export async function passwordReset( token: { user: string; key: string; password: string; } ) {
  return await putJson<ISimpleResponse>( `${rootPath}/password-reset`, token );
}

export async function resendActivation( user: string ) {
  return await getJson<ISimpleResponse>( `${rootPath}/${user}/resend-activation` );
}

export async function requestPasswordReset( user: string ) {
  return await getJson<ISimpleResponse>( `${rootPath}/${user}/request-password-reset` );
}

export async function approveActivation( user: string ) {
  return await putJson<ISimpleResponse>( `${rootPath}/${user}/approve-activation`, {} );
}