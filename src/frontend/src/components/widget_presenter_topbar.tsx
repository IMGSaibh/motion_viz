import { WidgetFileUpload } from './widgets/widget_file_upload';
import { WidgetMotionDescriptorBar } from './widgets/widget_motion_descriptor';
import { WidgetConvertMotionFile } from './widgets/widget_motion_file_conversion';
import { WidgetListFiles } from './widgets/widget_list_motion_files';
import { SelectChangeEvent } from '@mui/material/Select';
import { AppBar, Toolbar, Stack, Box, Container } from '@mui/material';

type Props = {
  file_dialog_reference: React.RefObject<HTMLInputElement | null>;
  file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;

  motion_config_reference: { [key: string]: React.RefObject<HTMLInputElement | null> };
  motion_config_is_open: boolean;
  motion_config_on_click: () => void;
  motion_config_create_on_click: () => void;

  convert_pv_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;

  motion_files: Array<{ type: string; name: string }>;
  motion_file_selected: string | null;
  motion_file_list_on_focus: () => void;
  motion_file_list_on_change: (event: SelectChangeEvent<string>) => void;
};

export function WidgetPresenterTopbar(props: Props) {
  return (
    <>
      {/* Menu: Topbar */}
      <AppBar>
        <Toolbar>
          <Container maxWidth={false} disableGutters>
            <Stack direction="row" alignItems="center" spacing={2} flexWrap="nowrap">
              {/* LEFT: Buttons */}
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="nowrap">
                <Box>
                  <WidgetFileUpload
                    {...{
                      file_dialog_reference: props.file_dialog_reference,
                      file_dialog_on_change: props.file_dialog_on_change,
                    }}
                  />
                  <WidgetConvertMotionFile
                    {...{
                      convert_pv_files_on_click: props.convert_pv_files_on_click,
                      convert_bvh_files_on_click: props.convert_bvh_files_on_click,
                    }}
                  />
                  <WidgetMotionDescriptorBar
                    {...{
                      motion_config_reference: props.motion_config_reference,
                      motion_config_is_open: props.motion_config_is_open,
                      motion_config_on_click: props.motion_config_on_click,
                      motion_config_create_on_click: props.motion_config_create_on_click,
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
                  motion_file_list_on_focus={props.motion_file_list_on_focus}
                  motion_file_list_on_change={props.motion_file_list_on_change}
                />
              </Box>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>
    </>
  );
}
