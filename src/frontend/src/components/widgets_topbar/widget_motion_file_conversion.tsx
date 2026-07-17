import Button from '@mui/material/Button';

type Props = {
  convert_pv_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  bvh_conversion_is_pending: boolean;
  pose_viewer_conversion_is_pending: boolean;
};

export function WidgetConvertMotionFile(props: Props) {
  return (
    <>
      <Button onClick={props.convert_bvh_files_on_click} disabled={props.bvh_conversion_is_pending}>Convert BVH to NPY</Button>
      <Button onClick={props.convert_pv_files_on_click} disabled={props.pose_viewer_conversion_is_pending}>Convert via Pose Viewer</Button>
    </>
  );
}
