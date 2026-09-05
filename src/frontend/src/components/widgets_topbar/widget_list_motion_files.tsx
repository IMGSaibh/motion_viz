import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
  const [menu_anchor, set_menu_anchor] = useState<null | HTMLElement>(null);
  const is_menu_open = Boolean(menu_anchor);

  function handle_open(event: React.MouseEvent<HTMLButtonElement>) {
    set_menu_anchor(event.currentTarget);
    props.motion_file_list_on_open();
  }

  function handle_select(filename: string) {
    set_menu_anchor(null);
    props.motion_file_list_on_select(filename);
  }

  return (
    <FormControl fullWidth size="small">
      <Button
        variant="outlined"
        onClick={handle_open}
        aria-haspopup="menu"
        aria-expanded={is_menu_open ? 'true' : undefined}
        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
      >
        {props.motion_file_selected || 'Select file'}
      </Button>
      <Menu anchorEl={menu_anchor} open={is_menu_open} onClose={() => set_menu_anchor(null)}>
        <MenuItem onClick={() => handle_select('')}>
          <em>Select file</em>
        </MenuItem>
        {props.motion_files.map((file_obj) => (
          <MenuItem key={file_obj.name} onClick={() => handle_select(file_obj.name)}>
            [{file_obj.type.toUpperCase()}] {file_obj.name}
          </MenuItem>
        ))}
      </Menu>
    </FormControl>
  );
}
