import { createTheme } from '@mui/material/styles';

const silvaineDark = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#C9A96E',
      light: '#E0C992',
      dark: '#A68B4B',
      contrastText: '#0A0A0A',
    },
    secondary: {
      main: '#F5F5F5',
      light: '#FFFFFF',
      dark: '#BDBDBD',
      contrastText: '#0A0A0A',
    },
    background: {
      default: '#0A0A0A',
      paper: '#141414',
    },
    text: {
      primary: '#F5F5F5',
      secondary: '#9E9E9E',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
    error: {
      main: '#CF6679',
    },
    success: {
      main: '#4CAF50',
    },
  },
  typography: {
    fontFamily: '"Cormorant Garamond", "Georgia", serif',
    h1: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 300,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
    },
    h2: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 300,
      letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
    },
    h3: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 400,
      letterSpacing: '0.08em',
    },
    h4: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 400,
      letterSpacing: '0.06em',
    },
    h5: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 500,
      letterSpacing: '0.04em',
    },
    h6: {
      fontFamily: '"Cormorant Garamond", serif',
      fontWeight: 500,
      letterSpacing: '0.04em',
    },
    subtitle1: {
      fontFamily: '"Montserrat", "Helvetica", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      fontSize: '0.75rem',
    },
    subtitle2: {
      fontFamily: '"Montserrat", "Helvetica", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.1em',
      fontSize: '0.7rem',
    },
    body1: {
      fontFamily: '"Montserrat", "Helvetica", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.03em',
      lineHeight: 1.8,
    },
    body2: {
      fontFamily: '"Montserrat", "Helvetica", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.02em',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: '"Montserrat", "Helvetica", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.2em',
      textTransform: 'uppercase' as const,
      fontSize: '0.75rem',
    },
    caption: {
      fontFamily: '"Montserrat", "Helvetica", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '14px 40px',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
        },
        contained: {
          backgroundColor: '#C9A96E',
          color: '#0A0A0A',
          boxShadow: 'none',
          '&:hover': {
            backgroundColor: '#E0C992',
            boxShadow: '0 4px 20px rgba(201, 169, 110, 0.3)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: 'rgba(255, 255, 255, 0.3)',
          color: '#F5F5F5',
          '&:hover': {
            borderColor: '#C9A96E',
            color: '#C9A96E',
            backgroundColor: 'transparent',
          },
        },
        text: {
          color: '#F5F5F5',
          '&:hover': {
            backgroundColor: 'transparent',
            color: '#C9A96E',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#141414',
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
          '&:hover': {
            border: '1px solid rgba(201, 169, 110, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 0,
            '& fieldset': {
              borderColor: 'rgba(255, 255, 255, 0.15)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(201, 169, 110, 0.5)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#C9A96E',
            },
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 0,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.3s ease',
          '&:hover': {
            color: '#C9A96E',
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
});

export default silvaineDark;
