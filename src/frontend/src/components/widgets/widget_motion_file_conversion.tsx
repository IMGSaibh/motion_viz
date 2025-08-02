
type WidgetMotionFileConversionProps = 
{
    on_convert_motion_file_pose_viewer:(e: React.MouseEvent<HTMLButtonElement>) => void;
    on_convert_motion_file: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WidgetConvertMotionFile({ 
    on_convert_motion_file_pose_viewer, 
    on_convert_motion_file
}: WidgetMotionFileConversionProps) {
  return (
    <>
        <button id="convert_bvh_to_npy_btn" onClick={on_convert_motion_file}>Convert BVH to NPY</button>
        <div id="convert_bvh_to_npy_status"></div>
        <button id="convert_pv_style_btn" onClick={on_convert_motion_file_pose_viewer}>Convert File as done in Pose Viewer</button>
        <div id="convert_pv_style_status"></div>
    </>
  );
}