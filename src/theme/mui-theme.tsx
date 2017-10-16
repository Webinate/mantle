import { ThemeInterface } from './theme';

// Reds
const p100 = '#B64545';
const p200 = '#CC7A7A';

// Purples
const s100 = '#6d689c';
const s200 = '#8885A7';

// Lights BGs
const l100 = '#fff';
const l200 = '#E7E7E7';

/**
 *  Light Theme is the default theme used in material-ui. It is guaranteed to
 *  have all theme variables needed for every component. Variables not defined
 *  in a custom theme will default to these values.
 */
export default {
  primaryColor: '',
  primaryColorInverted: '',

  // Reds
  primary100: { color: '#fff', background: p100 },
  primary200: { color: '#fff', background: p200, border: '#835151' },

  // Purples
  secondary100: { color: '#fff', background: s100 },
  secondary200: { color: '#fff', background: s200 },

  // Light
  light100: { color: '#333', background: l100, border: '#ccc' },
  light200: { color: '#333', background: l200, border: '#ccc' },

  spacing: {
    iconSize: 24,
    desktopGutter: 24,
    desktopGutterMore: 32,
    desktopGutterLess: 16,
    desktopGutterMini: 8,
    desktopKeylineIncrement: 64,
    desktopDropDownMenuItemHeight: 32,
    desktopDropDownMenuFontSize: 15,
    desktopDrawerMenuItemHeight: 48,
    desktopSubheaderHeight: 48,
    desktopToolbarHeight: 56,
  },
  fontFamily: 'Roboto, sans-serif',
  borderRadius: 2,
  palette: {
    primary1Color: s100,
    primary2Color: '#0288D1',
    primary3Color: '#BDBDBD',
    accent1Color: '#FF4081',
    accent2Color: '#F5F5F5',
    accent3Color: '#9E9E9E',
    textColor: '#000',
    secondaryTextColor: 'rgba(0,0,0,0.54)',
    alternateTextColor: '#fff',
    canvasColor: '#fff',
    borderColor: '#E0E0E0',
    disabledColor: 'rgba(0,0,0,0.3)',
    pickerHeaderColor: '#0D47A1',
    clockCircleColor: 'rgba(0,0,0,0.3)',
    shadowColor: '#000'
  },

} as ThemeInterface;