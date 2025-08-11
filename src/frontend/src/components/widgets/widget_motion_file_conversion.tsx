import Button from '@mui/material/Button';

type Props = {
  convert_pv_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WidgetConvertMotionFile(props: Props) {
  return (
    <>
      <Button onClick={props.convert_bvh_files_on_click}>Convert BVH to NPY</Button>
      <Button onClick={props.convert_pv_files_on_click}>Convert via Pose Viewer</Button>
    </>
  );
}
