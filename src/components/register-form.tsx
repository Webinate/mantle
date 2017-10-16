import * as React from 'react';
import { Link } from 'react-router-dom';
import { RaisedButton, TextField, FontIcon } from 'material-ui';
import { default as styled } from '../theme/styled';

type Props = {
  loading: boolean;
  onRegister: ( user: string, email: string, password: string ) => void;
}
type State = {
  user: string;
  email: string;
  pass: string;
  pass2: string;
  formSubmitted: boolean;
}

/**
 * A form for entering user registration information
 */
export class RegisterForm extends React.Component<Props, State> {
  constructor() {
    super();
    this.state = {
      user: '',
      email: '',
      pass: '',
      pass2: '',
      formSubmitted: false
    }
  }

  private onRegister() {
    this.setState( { formSubmitted: true } );
    if ( this.state.user !== '' && this.state.pass !== '' )
      this.props.onRegister( this.state.user, this.state.email, this.state.pass );
  }

  render() {
    return (
      <form className="register-form" action="" name="register">
        <TextField
          className="mt-username"
          value={this.state.user}
          onChange={( e, text ) => this.setState( { user: text } )}
          fullWidth={true}
          floatingLabelText="Username"
          type="text"
          name="username"
          errorText={this.state.formSubmitted && !this.state.user ? 'Please specify a username' : ''}
          id="user" />
        <TextField
          className="mt-email"
          value={this.state.email}
          onChange={( e, text ) => this.setState( { email: text } )}
          fullWidth={true}
          floatingLabelText="Email"
          type="text"
          name="username"
          errorText={this.state.formSubmitted && !this.state.email ? 'Please specify an email' : ''}
          id="email" />
        <TextField
          className="mt-password"
          value={this.state.pass}
          onChange={( e, text ) => this.setState( { pass: text } )}
          fullWidth={true}
          errorText={this.state.formSubmitted && !this.state.pass ? 'Please specify a password' : ''}
          floatingLabelText="Password"
          type="password"
          name="password"
          id="pass" />
        <TextField
          className="mt-password2"
          value={this.state.pass2}
          onChange={( e, text ) => this.setState( { pass2: text } )}
          fullWidth={true}
          floatingLabelText="Repeat Password"
          type="password" name="password2"
          errorText={this.state.pass !== this.state.pass2 ? 'Passwords do not match' : ''}
          id="pass2" />
        <ButtonsDiv>
          <RaisedButton
            className="mt-register-btn"
            disabled={this.props.loading}
            label="Create Account"
            fullWidth={true}
            onClick={e => this.onRegister()}
            icon={<FontIcon className="icon-person" />}
            primary={true} />
          <AnchorBtnsDiv>
            <Link
              to="/login"
              className="mt-to-login"
              style={{ margin: '0 5px' }}>🡐 Back to Login</Link>
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
  margin: 20px 0 0 0;
  text-align: center;
`;