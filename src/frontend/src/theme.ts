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
    warning: {
      main: '#f59e0b',
      contrastText: '#fff',
    },
    background: {
      default: '#000000',
      paper: 'rgba(0,0,0,0.5)',
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

        /* ================ Slider ===================== */
        '.slider-overlay': {
          position: 'absolute',
          left: '2vw',
          right: '2vw',
          bottom: '3vw',
          zIndex: 'var(--z-slider)',
        },
        '.slider-widget': {
          left: '2vw',
          right: '2vw',
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-overlay-bg)',
          padding: 'var(--space-lg)',
          borderRadius: 'var(--radius-md)',
          marginTop: '10px',
        },
        'label[for="slider-label"]': {
          marginRight: '1em',
          whiteSpace: 'nowrap',
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
          borderColor: theme.palette.text.primary,
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
          borderColor: theme.palette.text.primary,
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
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
          },

          '& .MuiSelect-select': {
            color: theme.palette.text.primary,
            backgroundColor: 'transparent',
          },
          '& .MuiSelect-icon': {
            color: theme.palette.text.primary,
          },
        }),
      },
    },
    // when select files is pressed
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
            borderWidth: '1px',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
            borderWidth: '1px',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.text.primary,
            borderWidth: '1px',
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: theme.palette.text.primary,
          borderWidth: '1px',
        }),
      },
    },
    // ===== Slider: no animation; rail white; track green; thumb white/green =====
    MuiSlider: {
      styleOverrides: {
        root: { transition: 'none' },
        rail: ({ theme }) => ({
          color: theme.palette.text.primary,
          opacity: 1,
        }),
        track: ({ theme }) => ({
          color: theme.palette.primary.main,
          transition: 'none',
        }),
        thumb: ({ theme }) => ({
          backgroundColor: theme.palette.text.primary,
          border: `2px solid ${theme.palette.primary.main}`,
          transition: 'none',
          '&:hover, &.Mui-focusVisible': {
            boxShadow: '0 0 0 4px rgba(69, 171, 69, 0.3)',
          },
          '&.Mui-active': {
            boxShadow: '0 0 0 8px rgba(69, 171, 69, 0.5)',
          },
        }),
        valueLabel: ({ theme }) => ({
          color: theme.palette.text.primary,
          background: theme.palette.primary.main,
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
