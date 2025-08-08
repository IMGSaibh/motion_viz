
type WidgetMotionFileConversionProps = 
{
    convert_pv_files_on_click:(e: React.MouseEvent<HTMLButtonElement>) => void;
    convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WidgetConvertMotionFile(motion_file_conv_props: WidgetMotionFileConversionProps) {
  return (
    <>
        <button id="convert_bvh_to_npy_btn" onClick={motion_file_conv_props.convert_bvh_files_on_click}>Convert BVH to NPY</button>
        <button id="convert_pv_style_btn" onClick={motion_file_conv_props.convert_pv_files_on_click}>Convert File as done in Pose Viewer</button>
    </>
  );
}