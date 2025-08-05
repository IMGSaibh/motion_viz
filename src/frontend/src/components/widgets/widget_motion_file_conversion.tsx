
type WidgetMotionFileConversionProps = 
{
    convert_pv_files_on_click:(e: React.MouseEvent<HTMLButtonElement>) => void;
    convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

export function WidgetConvertMotionFile({ 
    convert_pv_files_on_click, 
    convert_bvh_files_on_click
}: WidgetMotionFileConversionProps) {
  return (
    <>
        <button id="convert_bvh_to_npy_btn" onClick={convert_bvh_files_on_click}>Convert BVH to NPY</button>
        <div id="convert_bvh_to_npy_status"></div>
        <button id="convert_pv_style_btn" onClick={convert_pv_files_on_click}>Convert File as done in Pose Viewer</button>
        <div id="convert_pv_style_status"></div>
    </>
  );
}