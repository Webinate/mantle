import { combineReducers, ReducersMapObject } from 'redux';
import { routerReducer } from 'react-router-redux';
import { default as usersReducer, State as IUserState } from './users/reducer';
import { default as authReducer, State as IAuthState } from './authentication/reducer';

export type IRootState = {
  users: IUserState,
  authentication: IAuthState,
  router: any
};

// Create the root reducer which creates our root state
const rootReducer = combineReducers<IRootState>( {
  users: usersReducer,
  authentication: authReducer,
  router: routerReducer
} as ReducersMapObject );

export default rootReducer;
