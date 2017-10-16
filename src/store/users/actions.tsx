import { ActionCreator } from '../actions-creator';
import { IUserEntry, UserTokens } from 'modepress';
import { IRootState } from '../';
import { get, apiUrl } from '../../utils/httpClients';

// Action Creators
export const ActionCreators = {
  SetUsersBusy: new ActionCreator<'SetUsersBusy', boolean>( 'SetUsersBusy' ),
  SetUsers: new ActionCreator<'SetUsers', IUserEntry[] | null>( 'SetUsers' )
};

// Action Types
export type Action = typeof ActionCreators[ keyof typeof ActionCreators ];

/**
 * Refreshes the user state
 */
export function getUsers() {
  return async function( dispatch: Function, getState: () => IRootState ) {
    dispatch( ActionCreators.SetUsersBusy.create( true ) );
    const resp = await get<UserTokens.GetAll.Response>( `${ apiUrl }/users` );
    dispatch( ActionCreators.SetUsers.create( resp.data ) );
  }
}