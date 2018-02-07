/*
 * The token used for registration
 */
export interface IRegisterToken {
  username: string;
  password: string;
  email: string;
  meta?: any;
  privileges?: number;
}
