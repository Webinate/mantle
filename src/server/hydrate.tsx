import { Action } from 'redux';
import { matchPath, match } from 'react-router';
import { ActionCreators } from '../store/authentication/actions';
import { ActionCreators as UserActions } from '../store/users/actions';
import { IAuthReq } from 'modepress';
import { UserManager } from 'modepress-api';

/**
 * This decorator populates the application state with data before the client loads.
 * Each RouteAction will execute their actions if the url of the client matches
 * the path. This will in-turn hydrate the application state before its initial render
 */
export async function hydrate( req: IAuthReq ) {
  const actions: Action[] = [];
  let matches: match<any> | null;

  // Get the user
  actions.push( ActionCreators.setUser.create( req._user ) );

  // Get users if neccessary
  matches = matchPath( req.url, { path: '/dashboard/users' } );
  if ( matches ) {
    const users = await UserManager.get.getUsers();
    actions.push( UserActions.SetUsers.create( users.map( u => u.dbEntry ) ) );
  }

  return actions;
}