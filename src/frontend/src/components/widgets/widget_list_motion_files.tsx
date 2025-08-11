import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { SelectChangeEvent } from '@mui/material/Select';

type Props = {
  motion_files: Array<{ type: string; name: string }>;
  motion_file_selected: string | null;
  motion_file_list_on_focus: () => void;
  motion_file_list_on_change: (event: SelectChangeEvent<string>) => void;
};

export function WidgetListFiles(props: Props) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Select file</InputLabel>
      <Select
        value={props.motion_file_selected || ''}
        label="Select file"
        onFocus={props.motion_file_list_on_focus}
        onChange={props.motion_file_list_on_change}
      >
        <MenuItem value="">
          <em>Select file</em>
        </MenuItem>
        {props.motion_files.map((file_obj) => (
          <MenuItem key={file_obj.name} value={file_obj.name}>
            [{file_obj.type.toUpperCase()}] {file_obj.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
