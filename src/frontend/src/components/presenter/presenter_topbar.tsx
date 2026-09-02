import { WidgetFileOperations } from '@/components/widgets_topbar/widget_file_operations';
import { WidgetMotionDescriptorBar } from '@/components/widgets_topbar/widget_motion_descriptor';
import { WidgetConvertMotionFile } from '@/components/widgets_topbar/widget_motion_file_conversion';
import { WidgetListFiles } from '@/components/widgets_topbar/widget_list_motion_files';
import { SelectChangeEvent } from '@mui/material/Select';
import { AppBar, Toolbar, Stack, Box, Container } from '@mui/material';

type Props = {
  file_dialog_reference: React.RefObject<HTMLInputElement | null>;
  file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file_upload_is_pending: boolean;

  motion_config_reference: { [key: string]: React.RefObject<HTMLInputElement | null> };
  motion_config_is_open: boolean;
  motion_config_on_click: () => void;
  motion_config_create_on_click: () => void;
  motion_descriptor_is_pending: boolean;

  convert_pv_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  pose_viewer_conversion_is_pending: boolean;

  motion_files: Array<{ type: string; name: string }>;
  motion_file_selected: string | null;
  motion_file_list_on_change: (event: SelectChangeEvent<string>) => void;
  motion_file_list_on_open: () => void;
};

/**
 * Composes the application top bar from file, conversion, descriptor, and selection widgets.
 *
 * All data and event handlers enter through props, keeping this component independent of
 * API hooks and global state. Add top-bar layout and widget composition here; file workflow,
 * request handling, and cross-feature resets belong in `ContainerTopbar`.
 */
export function PresenterTopbar(props: Props) {
  return (
    <>
      {/* Menu: Topbar */}
      <AppBar>
        <Toolbar>
          <Container maxWidth={false} disableGutters>
            <Stack direction="row" alignItems="center" flexWrap="nowrap">
              {/* LEFT: Buttons */}
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WidgetFileOperations
                    {...{
                      file_dialog_reference: props.file_dialog_reference,
                      file_dialog_on_change: props.file_dialog_on_change,
                      is_pending: props.file_upload_is_pending,
                    }}
                  />
                  <WidgetConvertMotionFile
                    {...{
                      convert_pv_files_on_click: props.convert_pv_files_on_click,
                      pose_viewer_conversion_is_pending: props.pose_viewer_conversion_is_pending,
                    }}
                  />
                  <WidgetMotionDescriptorBar
                    {...{
                      motion_config_reference: props.motion_config_reference,
                      motion_config_is_open: props.motion_config_is_open,
                      motion_config_on_click: props.motion_config_on_click,
                      motion_config_create_on_click: props.motion_config_create_on_click,
                      is_pending: props.motion_descriptor_is_pending,
                    }}
                  />
                </Box>
              </Stack>
              {/* SPACER Select button far right */}
              <Box sx={{ flexGrow: 1 }} />
              {/* RIGHT: Select – fixed min width */}
              <Box sx={{ minWidth: 280, flexShrink: 0 }}>
                <WidgetListFiles
                  motion_files={props.motion_files}
                  motion_file_selected={props.motion_file_selected}
                  motion_file_list_on_change={props.motion_file_list_on_change}
                  motion_file_list_on_open={props.motion_file_list_on_open}
                />
              </Box>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
    </>
  );
}
