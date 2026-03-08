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
    fontFamily: '"Jost", "Helvetica Neue", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
      fontWeight: 300,
      letterSpacing: '0.06em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
      fontWeight: 400,
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
      fontWeight: 400,
      letterSpacing: '0.04em',
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
      fontWeight: 500,
      letterSpacing: '0.03em',
      lineHeight: 1.3,
    },
    h5: {
      fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
      fontWeight: 500,
      letterSpacing: '0.03em',
      lineHeight: 1.35,
    },
    h6: {
      fontFamily: '"Playfair Display", "Cormorant Garamond", serif',
      fontWeight: 500,
      letterSpacing: '0.02em',
      lineHeight: 1.4,
    },
    subtitle1: {
      fontFamily: '"Jost", "Helvetica Neue", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.18em',
      textTransform: 'uppercase' as const,
      fontSize: '0.78rem',
    },
    subtitle2: {
      fontFamily: '"Jost", "Helvetica Neue", sans-serif',
      fontWeight: 400,
      letterSpacing: '0.12em',
      fontSize: '0.72rem',
    },
    body1: {
      fontFamily: '"Jost", "Helvetica Neue", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.02em',
      lineHeight: 1.85,
      fontSize: '0.95rem',
    },
    body2: {
      fontFamily: '"Jost", "Helvetica Neue", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.015em',
      lineHeight: 1.7,
      fontSize: '0.875rem',
    },
    button: {
      fontFamily: '"Jost", "Helvetica Neue", sans-serif',
      fontWeight: 500,
      letterSpacing: '0.22em',
      textTransform: 'uppercase' as const,
      fontSize: '0.75rem',
    },
    caption: {
      fontFamily: '"Jost", "Helvetica Neue", sans-serif',
      fontWeight: 300,
      letterSpacing: '0.08em',
      fontSize: '0.75rem',
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
