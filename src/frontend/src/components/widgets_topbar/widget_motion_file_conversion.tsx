import { useState } from 'react';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';

type Props = {
  convert_motionstack_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  motionstack_conversion_is_pending: boolean;
  descriptor_type_selected: string | null;
  descriptor_type_on_select: (descriptor_type: string) => void;
  descriptor_type_list_on_open: () => void;
};

/**
 * Renders the Pose Viewer conversion action and its pending state.
 *
 * The conversion workflow is intentionally supplied through props. Backend communication,
 * result handling, and notifications belong in `ContainerTopbar`; button presentation stays
 * in this widget.
 */
export function WidgetConvertMotionFile(props: Props) {
  const [menu_anchor, set_menu_anchor] = useState<null | HTMLElement>(null);
  const is_menu_open = Boolean(menu_anchor);

  function handle_open(event: React.MouseEvent<HTMLButtonElement>) {
    set_menu_anchor(event.currentTarget);
    props.descriptor_type_list_on_open();
  }
  function handle_select(descriptor_type: string) {
    props.descriptor_type_on_select(descriptor_type);
    set_menu_anchor(null);
  }

  const descriptor_types = [
    '3dpw',
    'aimove',
    'amass',
    'aist',
    'carda',
    'coco19',
    'cmu_kitchen',
    'crea3d',
    'congreg8',
    'dag',
    'gaziv',
    'egobody',
    'elmo',
    'fb3d',
    'gpjatk',
    'h36m',
    'lara',
    'mmm_hier',
    'mmm_wo_hands',
    'mocapact',
    'movi',
    'mgait',
    'ntu',
    'rehab24',
    'tum',
    'umons',
    'uw_iom',
    'yord',
    'amcasf',
    'bvh',
    'bvh_10',
    'bvh_20',
    'bvh_100',
    'bvh_1000',
    'bvh_inch',
    'xsens_mvnx',
    'xsens_mvnx_rot_only',
    'xsens_pkl',
    'xsens_xlsx_pos_only',
    'kinect360',
    'kinectone',
  ];

  return (
    <>
      <Button onClick={props.convert_motionstack_files_on_click} disabled={props.motionstack_conversion_is_pending}>
        Convert via Pose Viewer
      </Button>

      <Button
        variant="outlined"
        onClick={handle_open}
        aria-haspopup="menu"
        aria-expanded={is_menu_open ? 'true' : undefined}
        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
      >
        {props.descriptor_type_selected || 'Select descriptor type'}
      </Button>
      <Menu anchorEl={menu_anchor} open={is_menu_open} onClose={() => set_menu_anchor(null)}>
        <MenuItem onClick={() => handle_select('')}>
          <em>Select file</em>
        </MenuItem>
        {descriptor_types.map((descriptor_type) => {
          return (
            <MenuItem key={descriptor_type} onClick={() => handle_select(descriptor_type)}>
              {descriptor_type}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
