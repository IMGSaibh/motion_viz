import Button from '@mui/material/Button';

type WidgetMotionFileConversionProps = {
  convert_pv_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
  convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WidgetConvertMotionFile(motion_file_conv_props: WidgetMotionFileConversionProps) {
  return (
    <>
      <Button onClick={motion_file_conv_props.convert_bvh_files_on_click}>
        Convert BVH to NPY
      </Button>
      <Button onClick={motion_file_conv_props.convert_pv_files_on_click}>
        Convert via Pose Viewer
      </Button>
    </>
  );
}
