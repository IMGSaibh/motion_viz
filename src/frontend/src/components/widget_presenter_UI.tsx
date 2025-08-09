import { WidgetFileUpload } from './widgets/widget_file_upload';
import { WidgetMotionDescriptorBar } from './widgets/widget_motion_descriptor';
import { WidgetConvertMotionFile } from './widgets/widget_motion_file_conversion';
import { WidgetListFiles } from './widgets/widget_list_motion_files';
import { SelectChangeEvent } from '@mui/material/Select';
import { Box } from '@mui/material';

type WidgetPresenterUIProps = {
  file_dialog_reference: React.RefObject<HTMLInputElement | null>;
  file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  file_dialog_on_click: () => void;

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

export function WidgetPresenterUI(widget_presenter_ui_props: WidgetPresenterUIProps) {
  return (
    <>
      <Box className="button-grid">
        <WidgetFileUpload
          {...{
            file_dialog_reference: widget_presenter_ui_props.file_dialog_reference,
            file_dialog_on_change: widget_presenter_ui_props.file_dialog_on_change,
            file_dialog_on_click: widget_presenter_ui_props.file_dialog_on_click,
          }}
        />
        <WidgetMotionDescriptorBar
          {...{
            motion_config_reference: widget_presenter_ui_props.motion_config_reference,
            motion_config_is_open: widget_presenter_ui_props.motion_config_is_open,
            motion_config_on_click: widget_presenter_ui_props.motion_config_on_click,
            motion_config_create_on_click: widget_presenter_ui_props.motion_config_create_on_click,
          }}
        />
        <WidgetConvertMotionFile
          {...{
            convert_pv_files_on_click: widget_presenter_ui_props.convert_pv_files_on_click,
            convert_bvh_files_on_click: widget_presenter_ui_props.convert_bvh_files_on_click,
          }}
        />
        <WidgetListFiles
          {...{
            motion_files: widget_presenter_ui_props.motion_files,
            motion_file_selected: widget_presenter_ui_props.motion_file_selected,
            motion_file_list_on_focus: widget_presenter_ui_props.motion_file_list_on_focus,
            motion_file_list_on_change: widget_presenter_ui_props.motion_file_list_on_change,
          }}
        />
      </Box>
    </>
  );
}
