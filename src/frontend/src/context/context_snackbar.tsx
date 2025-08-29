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
      success: (m: string, ms?: number) => notify(m, 'success', ms),
      info: (m: string, ms?: number) => notify(m, 'info', ms),
      warning: (m: string, ms?: number) => notify(m, 'warning', ms),
      error: (m: string, ms?: number) => notify(m, 'error', ms),
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
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ zIndex: '1000' }}
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
