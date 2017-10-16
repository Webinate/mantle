import { MuiTheme } from 'material-ui/styles';

export type ThemeValue = {
  color: string;
  background: string;
  border?: string;
}

export interface ThemeInterface extends MuiTheme {
  primaryColor: string;
  primaryColorInverted: string;

  primary100: ThemeValue;
  primary200: ThemeValue;
  secondary100: ThemeValue;
  secondary200: ThemeValue;

  light100: ThemeValue;
  light200: ThemeValue;
}