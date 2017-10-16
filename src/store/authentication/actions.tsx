import { ActionCreator } from '../actions-creator';
import { IRootState } from '../';
import { post, get, apiUrl, ClientError } from '../../utils/httpClients';
import { AuthTokens, IResponse, IUserEntry } from 'modepress';
import { push } from 'react-router-redux';

// Action Creators
export const ActionCreators = {
  setUser: new ActionCreator<'setUser', IUserEntry | null>( 'setUser' ),
  isAuthenticating: new ActionCreator<'isAuthenticating', boolean>( 'isAuthenticating' ),
  authenticationError: new ActionCreator<'authenticationError', string>( 'authenticationError' ),
  loggedOut: new ActionCreator<'loggedOut', boolean>( 'loggedOut' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

export function login( authToken: AuthTokens.Login.Body ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.isAuthenticating.create( true ) );

    try {
      const resp = await post<AuthTokens.Login.Response>( `${ apiUrl }/auth/login`, authToken );
      dispatch( ActionCreators.setUser.create( resp.user ? resp.user : null ) );
      dispatch( push( '/' ) );

    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( ( e as ClientError<IResponse> ).json.message ) );
    }
  }
}

export function register( authToken: AuthTokens.Register.Body ) {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.isAuthenticating.create( true ) );

    try {
      const resp = await post<AuthTokens.Register.Response>( `${ apiUrl }/auth/register`, authToken );
      dispatch( ActionCreators.authenticationError.create( resp.message ) );
    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( ( e as ClientError<IResponse> ).json.message ) );
    }
  }
}

export function logout() {
  return async function( dispatch: Function, getState: () => IRootState ) {
    try {
      await get<AuthTokens.Logout.Response>( `${ apiUrl }/auth/logout` );
      dispatch( ActionCreators.loggedOut.create( true ) );
      dispatch( push( '/login' ) );

    }
    catch ( e ) {
      dispatch( ActionCreators.authenticationError.create( ( e as ClientError<IResponse> ).json.message ) );
    }
  }
}