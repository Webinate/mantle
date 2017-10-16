import * as React from 'react';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import MantleDiv from './mantle-background';
import { LinearProgress } from 'material-ui';
import { default as styled } from '../theme/styled';

type Prop = {
  loading: boolean;
  activeComponent: 'login' | 'register';
  error: string | null | undefined;
  onLogin: ( user: string, password: string ) => void;
  onPasswordReset: ( user: string ) => void;
  onActivationReset: ( user: string ) => void;
  onRegister: ( user: string, email: string, password: string ) => void;
}

export class AuthScreen extends React.Component<Prop, any> {
  constructor() {
    super();
  }

  render() {
    return (
      <MantleDiv className="auth-screen">
        <OuterDiv>
          <InnerDiv>
            {this.props.loading ? <span className="mt-loading"><LinearProgress /></span> : undefined}
            <ContentDiv>
              <Logo src="./images/mantle-logo.svg" />
              {
                this.props.activeComponent === 'login' ?
                  <LoginForm
                    loading={this.props.loading}
                    onLogin={this.props.onLogin}
                    onPasswordReset={this.props.onPasswordReset}
                    onActivationReset={this.props.onActivationReset}
                  /> :
                  <RegisterForm
                    onRegister={this.props.onRegister}
                    loading={this.props.loading}
                  />
              }
              {this.props.error ? <Error className="mt-auth-err">{this.props.error}</Error> : undefined}
            </ContentDiv>
          </InnerDiv>
        </OuterDiv>
      </MantleDiv>
    )
  }
}

const Logo = styled.img`
  width: 80px;
  position: absolute;
  top: -130px;
  left: calc((100% - 80px) / 2);
`;

const OuterDiv = styled.div`
  display: -webkit-flex;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  height: 100%;
`;

const InnerDiv = styled.div`
  width: 320px;
  background: #fff;
  border-radius: 5px;
  box-shadow: 4px 4px 18px 0px rgba(0, 0, 0, 0.25);
  position: relative;
`;

const ContentDiv = styled.div`
  text-align: left;
  padding: 25px;
`;

const Error = styled.div`
  text-align: center;
  color: red;
`;