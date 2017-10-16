import * as React from 'react';
import { RaisedButton, TextField, FontIcon } from 'material-ui';
import { Link } from 'react-router-dom';
import { default as styled } from '../theme/styled';

type Props = {
  loading: boolean;
  onLogin: ( user: string, password: string ) => void;
  onPasswordReset: ( user: string ) => void;
  onActivationReset: ( user: string ) => void;
}

type State = {
  user: string;
  pass: string;
  formSubmitted: boolean;
  retrievePassError: boolean;
}

/**
 * A form for entering user and password information
 */
export class LoginForm extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      user: '',
      pass: '',
      formSubmitted: false,
      retrievePassError: false
    }
  }

  /**
   * Requests the password for a given user
   */
  private checkUsernameSet( e: React.MouseEvent<HTMLAnchorElement> ) {
    e.preventDefault();
    e.stopPropagation();
    if ( this.state.user === '' ) {
      this.setState( { retrievePassError: true, formSubmitted: false } );
      return false;
    }
    else {
      this.setState( { retrievePassError: false } );
      return true;
    }
  }

  /**
   * When we click the login button
   */
  private onLogin() {
    this.setState( { formSubmitted: true } );
    if ( this.state.user !== '' && this.state.pass !== '' )
      this.props.onLogin( this.state.user, this.state.pass );
  }

  /**
   * Gets the user error message if there is one
   */
  getUserError() {
    if ( this.state.retrievePassError )
      return 'Please specify a username';
    if ( this.state.formSubmitted && !this.state.user )
      return 'Please specify a username';

    return null;
  }

  render() {
    return (
      <form className="login-form" action="" name="login">
        <TextField
          className="mt-username"
          value={this.state.user}
          onChange={( e, text ) => this.setState( { user: text } )}
          fullWidth={true}
          errorText={this.getUserError()}
          floatingLabelText="Username"
          type="text" name="username"
          id="login-user" />
        <TextField
          className="mt-password"
          value={this.state.pass}
          onChange={( e, text ) => this.setState( { pass: text } )}
          errorText={this.state.formSubmitted && !this.state.pass ? 'Please specify a password' : ''}
          fullWidth={true}
          floatingLabelText="Password"
          type="password" name="password"
          id="login-pass" />
        <ButtonsDiv>
          <RaisedButton
            className="mt-login-btn"
            disabled={this.props.loading}
            label="Login"
            fullWidth={true}
            onClick={e => this.onLogin()}
            icon={<FontIcon className="icon-person" />}
            primary={true} />
          <AnchorBtnsDiv>
            <Link className="mt-create-account" to="/register">Create an Account</Link> |
            <AnchorBtns className="mt-retrieve-password" href="" onClick={e => {
              if ( this.checkUsernameSet( e ) )
                this.props.onLogin( this.state.user, this.state.pass );
            }}>Retrieve Password</AnchorBtns>
            <br />
            <AnchorBtns className="mt-resend-activation" href="" onClick={e => {
              if ( this.checkUsernameSet( e ) )
                this.props.onActivationReset( this.state.user );
            }}> Resend Activation</AnchorBtns>
          </AnchorBtnsDiv>
        </ButtonsDiv>
      </form>
    )
  }
}

const ButtonsDiv = styled.div`
  margin: 40px 0 0 0;
`;

const AnchorBtnsDiv = styled.div`
  white-space: nowrap;
  margin: 20px 0 0 0;
  text-align: center;
`;

const AnchorBtns = styled.a`
  margin: 0 5px;
`;