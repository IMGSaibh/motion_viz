import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

type Props = {
  motion_files: Array<{ type: string; name: string }>;
  motion_file_selected: string | null;
  motion_file_list_on_select: (filename: string) => void;
  motion_file_list_on_open: () => void;
};

/**
 * Presents the available motion files as a controlled MUI selection field.
 *
 * Refreshing the file list, loading a selected motion, and resetting related application
 * state are container responsibilities. Option rendering and selection-field presentation
 * belong in this widget.
 */
export function WidgetListFiles(props: Props) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel shrink>{'Selected file'}</InputLabel>
      <Select
        value={props.motion_file_selected || ''}
        label={props.motion_file_selected}
        onOpen={props.motion_file_list_on_open}
      >
        <MenuItem value="" onClick={() => props.motion_file_list_on_select('')}>
          <em>Select file</em>
        </MenuItem>
        {props.motion_files.map((file_obj) => (
          <MenuItem
            key={file_obj.name}
            value={file_obj.name}
            onClick={() => props.motion_file_list_on_select(file_obj.name)}
          >
            [{file_obj.type.toUpperCase()}] {file_obj.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
