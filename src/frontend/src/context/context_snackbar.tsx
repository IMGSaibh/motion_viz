import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Severity = 'success' | 'info' | 'warning' | 'error';
type Notify = (message: string, severity?: Severity, durationMs?: number) => void;

type SnackbarCtx = {
  notify: Notify;
  success: (msg: string, ms?: number) => void;
  info: (msg: string, ms?: number) => void;
  warning: (msg: string, ms?: number) => void;
  error: (msg: string, ms?: number) => void;
  close: () => void;
};

const Ctx = createContext<SnackbarCtx | null>(null);

// TODO: Reassess whether these notification helpers need a dedicated provider.
/**
 * Provides one application-wide notification surface and severity-specific helper actions.
 *
 * Containers and hooks report user-facing outcomes through this context without owning
 * Snackbar rendering state. Request error interpretation stays with the calling workflow;
 * notification display behavior and lifecycle belong here.
 */
export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<Severity>('info');
  const [autoHideDuration, setAutoHideDuration] = useState<number>(6000);

  const notify: Notify = useCallback((msg, sev = 'info', ms = 6000) => {
    setMessage(msg);
    setSeverity(sev);
    setAutoHideDuration(ms);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({
      notify,
      success: (message: string, ms?: number) => notify(message, 'success', ms),
      info: (message: string, ms?: number) => notify(message, 'info', ms),
      warning: (message: string, ms?: number) => notify(message, 'warning', ms),
      error: (message: string, ms?: number) => notify(message, 'error', ms),
      close,
    }),
    [notify, close],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        onClose={(_, reason) => (reason === 'clickaway' ? undefined : close())}
        autoHideDuration={autoHideDuration}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{
          margin: '30vh 0 0 0',
          position: 'absolute',
        }}
      >
        <Alert onClose={close} severity={severity} variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </Ctx.Provider>
  );
}

export function use_snackbar_ctx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSnackbar must be used within <SnackbarProvider>');
  return ctx;
}
