import * as React from 'react';
import { Store } from 'redux';
import { History, Location } from 'history';
import { Router } from 'react-router';

export const LOCATION_CHANGE = '@@router/LOCATION_CHANGE';

type Props = {
  store: Store<any>;
  history: History;
}

export class ConnectedRouter extends React.Component<Props, any> {
  private unsubscribeFromHistory: Function;

  handleLocationChange( location: Location ) {
    this.props.store.dispatch( {
      type: LOCATION_CHANGE,
      payload: location
    } )
  }

  componentWillMount() {
    this.handleLocationChange( this.props.history.location )
  }

  componentDidMount() {
    this.unsubscribeFromHistory = this.props.history.listen( location => this.handleLocationChange( location ) )
  }

  componentWillUnmount() {
    if ( this.unsubscribeFromHistory )
      this.unsubscribeFromHistory()
  }

  render() {
    return <Router {...this.props} />
  }
}

export default ConnectedRouter