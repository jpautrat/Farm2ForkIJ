import { createTheme } from '@mui/material/styles';

// Farm2Fork color palette
const primaryColor = '#2E7D32'; // Green - representing freshness and agriculture
const secondaryColor = '#8D6E63'; // Earth tones - representing natural, organic products
const accentColor = '#FF8F00'; // Orange - for calls to action
const errorColor = '#D32F2F'; // Red - for errors and warnings
const successColor = '#388E3C'; // Green - for success messages
const warningColor = '#FFA000'; // Amber - for warnings
const infoColor = '#1976D2'; // Blue - for information

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: secondaryColor,
      light: '#be9c91',
      dark: '#5f4339',
      contrastText: '#ffffff',
    },
    error: {
      main: errorColor,
      light: '#ff6659',
      dark: '#9a0007',
      contrastText: '#ffffff',
    },
    warning: {
      main: warningColor,
      light: '#ffc947',
      dark: '#c67100',
      contrastText: '#000000',
    },
    info: {
      main: infoColor,
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    success: {
      main: successColor,
      light: '#6abf69',
      dark: '#00600f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
      hint: 'rgba(0, 0, 0, 0.38)',
    },
  },
  typography: {
    fontFamily: [
      'Montserrat',
      'Open Sans',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(','),
    h1: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 700,
    },
    h3: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 600,
    },
    h5: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 500,
    },
    subtitle1: {
      fontFamily: 'Open Sans, sans-serif',
    },
    subtitle2: {
      fontFamily: 'Open Sans, sans-serif',
    },
    body1: {
      fontFamily: 'Open Sans, sans-serif',
    },
    body2: {
      fontFamily: 'Open Sans, sans-serif',
    },
    button: {
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: 500,
      textTransform: 'none',
    },
    caption: {
      fontFamily: 'Open Sans, sans-serif',
    },
    overline: {
      fontFamily: 'Open Sans, sans-serif',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#ffffff',
          color: primaryColor,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiSelect: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiCheckbox: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiRadio: {
      defaultProps: {
        color: 'primary',
      },
    },
    MuiSwitch: {
      defaultProps: {
        color: 'primary',
      },
    },
  },
});

export default theme;
