import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

type Props = {
  motion_config_reference: { [key: string]: React.RefObject<HTMLInputElement | null> };
  motion_config_is_open: boolean;
  motion_config_on_click: () => void; // Toggle open/close
  motion_config_create_on_click: () => void; // Create descriptor
  is_pending: boolean;
};

/**
 * Renders the motion-descriptor dialog and exposes its form fields through provided refs.
 *
 * This widget owns dialog and form presentation only. Reading values, creating the request,
 * calling the backend, and displaying outcomes belong in `ContainerTopbar` and API hooks.
 * Add descriptor form controls here when the backend contract gains corresponding fields.
 */
export function WidgetMotionDescriptorBar(props: Props) {
  return (
    <>
      {/* Trigger Topbar */}
      <Button onClick={props.motion_config_on_click} startIcon={<SettingsIcon />}>
        Motion Config
      </Button>

      {/* panel as Modal */}
      <Dialog
        open={props.motion_config_is_open}
        onClose={props.motion_config_on_click}
        fullWidth
        maxWidth="md"
        keepMounted // Preserve panel state and refs while the modal is closed.
      >
        <DialogTitle>Motion Configuration</DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Format"
                defaultValue="csv"
                inputRef={props.motion_config_reference.format as any}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Abbreviation"
                defaultValue=""
                inputRef={props.motion_config_reference.abbrev as any}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Scale"
                type="number"
                defaultValue="1"
                inputRef={props.motion_config_reference.scale as any}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Positions"
                defaultValue="absolute"
                inputRef={props.motion_config_reference.positions as any}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Rotations"
                defaultValue="none"
                inputRef={props.motion_config_reference.rotations as any}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Systemname"
                defaultValue=""
                inputRef={props.motion_config_reference.systemname as any}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="FPS"
                type="number"
                defaultValue="30"
                inputRef={props.motion_config_reference.fps as any}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Joint count"
                type="number"
                defaultValue="30"
                inputRef={props.motion_config_reference.jointcount as any}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Col offset"
                type="number"
                defaultValue="0"
                inputRef={props.motion_config_reference.coloffset as any}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Col gap"
                type="number"
                defaultValue="0"
                inputRef={props.motion_config_reference.colgap as any}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Dim size for position"
                type="number"
                defaultValue="3"
                inputRef={props.motion_config_reference.dimsize as any}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Stack direction="row" spacing={1}>
            <Button onClick={props.motion_config_on_click}>Close</Button>
            <Button onClick={props.motion_config_create_on_click} variant="outlined" disabled={props.is_pending}>
              Create descriptor Json
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
}
