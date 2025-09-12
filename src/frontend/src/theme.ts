// theme.ts (MUI v7)
import { createTheme } from '@mui/material';

export const theme = createTheme({
  palette: {
    mode: 'dark',

    primary: { main: '#45ab45' },
    secondary: { main: '#0ea5e9' },

    text: {
      primary: '#ffffff',
      secondary: 'rgba(255,255,255,0.7)',
      disabled: 'rgba(255,255,255,0.5)',
    },
    success: {
      main: '#45ab45',
      contrastText: '#fff',
    },
    info: {
      main: '#f59e0b',
    },
    warning: {
      main: '#f59e0b',
      contrastText: '#fff',
    },
    background: {
      default: '#000000',
      paper: 'rgba(0,0,0,0.8)',
    },
  },

  components: {
    // ===== Global CssBaseline =====
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        ':root': {
          '--color-overlay-bg': theme.palette.background.paper,

          '--space-xs': '0.125rem', // 2px
          '--space-sm': '0.25rem', // 4px
          '--space-md': '0.5rem', // 8px
          '--space-lg': '1rem', // 16px
          '--space-xl': '2rem', // 32px

          '--radius-xs': '0.3125rem', // 5px
          '--radius-sm': '0.375rem', // 6px
          '--radius-md': '0.5rem', // 8px
          '--radius-lg': '0.75rem', // 12px

          '--z-slider': '0',
        },

        'html, body, #root': {
          margin: 0,
          padding: 0,
          height: '100%',
          width: '100%',
          position: 'relative',
          overflow: 'hidden',
        },

        /* ================ Three JS Scene ============= */
        '#scene-container': {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        },
        '#three-canvas': {
          width: '100% !important',
          height: '100% !important',
          display: 'block',
        },
      }),
    },

    // ===== Buttons: white "outlined"-look  =====
    MuiButton: {
      defaultProps: {
        variant: 'outlined',
        disableElevation: true,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          borderColor: theme.palette.divider,
          transition: 'all 0.3s',
          '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderColor: theme.palette.text.primary,
          },
          '&:active': {
            backgroundColor: 'rgba(255,255,255,0.3)',
          },
          '& .MuiSvgIcon-root': {
            color: 'inherit',
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },

    // ===== select & label: white (text, border, icon, focus) =====
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          '&.Mui-focused': { color: theme.palette.text.primary },
          '&.MuiInputLabel-shrink': { color: theme.palette.text.primary },
        }),
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: ({ theme }) => ({
          // '& .MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.text.primary,
          // },
          // '&:hover .MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.text.primary,
          // },
          // '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.text.primary,
          // },
          // '& .MuiSelect-select': {
          //   color: theme.palette.text.primary,
          //   backgroundColor: 'transparent',
          // },
          // '& .MuiSelect-icon': {
          //   color: theme.palette.text.primary,
          // },
        }),
      },
    },
    // when select files is pressed
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          // '& .MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.text.primary,
          //   borderWidth: '1px',
          // },
          // '&:hover .MuiOutlinedInput-notchedOutline': {
          //   borderColor: theme.palette.text.primary,
          //   borderWidth: '1px',
          // },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
            borderWidth: '1px',
          },
        }),
        notchedOutline: ({ theme }) => ({
          // borderColor: theme.palette.text.primary,
          // borderWidth: '1px'
          borderColor: theme.palette.divider,
        }),
      },
    },

    // ================ snackbar and alert for success and warning =====================
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '&.snackbar-centered': {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        filledSuccess: ({ theme }) => ({
          backgroundColor: theme.palette.success.main,
          color: theme.palette.success.contrastText,
        }),
        filledWarning: ({ theme }) => ({
          backgroundColor: theme.palette.warning.main,
          color: theme.palette.warning.contrastText,
        }),
      },
    },
  },
});
