import { experimental_extendTheme as extendTheme } from '@mui/material/styles';

const APP_BAR_HEIGHT = '60px';
const BOARD_BAR_HEIGHT = '60px';
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`;
const COLUMN_HEADER_HEIGHT = '50px';
const COLUMN_FOOTER_HEIGHT = '56px';

// Create a theme instance.
const theme = extendTheme({
  trello: {
    appBarHeight: APP_BAR_HEIGHT,
    boardBarHeight: BOARD_BAR_HEIGHT,
    boardContentHeight: BOARD_CONTENT_HEIGHT,
    columnHeaderHeight: COLUMN_HEADER_HEIGHT,
    columnFooterHeight: COLUMN_FOOTER_HEIGHT
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0079bf',
          light: '#4c9aff',
          dark: '#0065a2'
        },
        secondary: {
          main: '#ff5722',
          light: '#ff8a50',
          dark: '#c41c00'
        },
        background: {
          default: '#f5f7fa',
          paper: '#ffffff'
        }
      }
    },
    dark: {
      palette: {
        primary: {
          main: '#2196f3',
          light: '#4dabf5',
          dark: '#1565c0'
        },
        secondary: {
          main: '#ff9800',
          light: '#ffac33',
          dark: '#c77700'
        },
        background: {
          default: '#1a1a2e',
          paper: '#242639'
        },
        text: {
          primary: '#e0e0e0',
          secondary: '#b0b0b0'
        }
      }
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          '*::-webkit-scrollbar': {
            width: '8px',
            height: '8px'
          },
          '*::-webkit-scrollbar-thumb': {
            backgroundColor: '#b0b0b0',
            borderRadius: '8px'
          },
          '*::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#808080'
          },
          '*::-webkit-scrollbar-track': {
            backgroundColor: 'transparent'
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '4px',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': { 
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }
        },
        contained: {
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
          }
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { 
          fontSize: '0.875rem',
          fontWeight: 500 
        }
      }
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          '&.MuiTypography-body1': { fontSize: '0.875rem' }
        },
        h5: {
          fontWeight: 600
        },
        h6: {
          fontWeight: 600
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          borderRadius: '4px',
          '& fieldset': { borderWidth: '1px' },
          '&:hover fieldset': { borderWidth: '1.5px' },
          '&.Mui-focused fieldset': { borderWidth: '2px' }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s cubic-bezier(.25,.8,.25,1)',
          '&:hover': {
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)'
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '6px'
        }
      }
    }
  }
});

export default theme;
