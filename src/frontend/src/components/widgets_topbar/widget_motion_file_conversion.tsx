import Button from '@mui/material/Button';

type Props = {
  pv_file_dialog_reference: React.RefObject<HTMLInputElement | null>;
  pv_file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  convert_bvh_files_on_click: (e: React.MouseEvent<HTMLButtonElement>) => void;  
};

export function WidgetConvertMotionFile(props: Props) {
  return (
    <>
      <Button onClick={props.convert_bvh_files_on_click}>Convert BVH to NPY</Button>
            <Button component="label">  {}
        Convert via Pose Viewer
        <input 
          ref={props.pv_file_dialog_reference} 
          type="file" 
          multiple 
          hidden 
          onChange={props.pv_file_dialog_on_change} 
        />
      </Button>
    </>
  );
}
