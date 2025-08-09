// type WidgetListFilesProps = {
//   motion_files: Array<{ type: string; name: string }>;
//   motion_file_selected: string | null;
//   motion_file_list_on_focus: () => void;
//   motion_file_list_on_change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
// };

// export function WidgetListFiles(widget_list_files_props: WidgetListFilesProps) {
//   return (
//     <>
//       <select
//         value={widget_list_files_props.motion_file_selected || ''}
//         onFocus={widget_list_files_props.motion_file_list_on_focus}
//         onChange={widget_list_files_props.motion_file_list_on_change}
//       >
//         <option value="">Select file</option>
//         {widget_list_files_props.motion_files.map((file_obj) => (
//           <option key={file_obj.name} value={file_obj.name}>
//             [{file_obj.type.toUpperCase()}] {file_obj.name}
//           </option>
//         ))}
//       </select>
//     </>
//   );
// }

import * as React from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import { SelectChangeEvent } from '@mui/material/Select';

type WidgetListFilesProps = {
  motion_files: Array<{ type: string; name: string }>;
  motion_file_selected: string | null;
  motion_file_list_on_focus: () => void;
  motion_file_list_on_change: (event: SelectChangeEvent<string>) => void;
};

export function WidgetListFiles(widget_list_files_props: WidgetListFilesProps) {
  const {
    motion_files,
    motion_file_selected,
    motion_file_list_on_focus,
    motion_file_list_on_change,
  } = widget_list_files_props;

  return (
    <FormControl fullWidth size="small">
      <InputLabel>Select file</InputLabel>
      <Select
        value={motion_file_selected || ''}
        label="Select file"
        onFocus={motion_file_list_on_focus}
        onChange={motion_file_list_on_change}
      >
        <MenuItem value="">
          <em>Select file</em>
        </MenuItem>
        {motion_files.map((file_obj) => (
          <MenuItem key={file_obj.name} value={file_obj.name}>
            [{file_obj.type.toUpperCase()}] {file_obj.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
