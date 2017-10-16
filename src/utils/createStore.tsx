import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { routerMiddleware } from 'react-router-redux';
import { History } from 'history';
import { default as rootReducer } from '../store/index';

export default function configureStore( initialState: any, history: History ) {

  // Build the middleware for intercepting and dispatching navigation actions
  const middleware = routerMiddleware( history )

  return createStore(
    rootReducer,
    initialState,
    compose( applyMiddleware( middleware, thunk ) )
  );
}
