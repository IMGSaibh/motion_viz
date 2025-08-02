import { WidgetFileUpload } from './widgets/widget_file_upload';
import { WidgetCreateDescriptorFile } from './widgets/widget_motion_descriptor';
import { WidgetConvertMotionFile } from './widgets/widget_motion_file_conversion';
import { WidgetListFiles } from './widgets/widget_list_motion_files';

type WidgetPresenterProps = 
{
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  triggerFileDialog: () => void;
  is_dropdown_open: boolean;
  on_toggle_dropdown: () => void;

  inputRefs: { [key: string]: React.RefObject<HTMLInputElement | null> };
  onCreate: () => void;

  on_convert_pose_viewer: (e: React.MouseEvent<HTMLButtonElement>) => void;
  on_convert_bvh: (e: React.MouseEvent<HTMLButtonElement>) => void;

  motionFiles: Array<{type: string, name: string}>;
  selectedMotionFile: string | null;
  onFetchFileList: () => void;
  onSelectMotionFile: (e: React.ChangeEvent<HTMLSelectElement>) => void;

  status_massage: string | null
};

export function WidgetPresenter({
    inputRef,
    onFileInputChange,
    triggerFileDialog,
    on_toggle_dropdown,
    is_dropdown_open,
    inputRefs,
    onCreate,
    on_convert_pose_viewer,
    on_convert_bvh,
    
    motionFiles,
    selectedMotionFile,
    onFetchFileList,
    onSelectMotionFile,
    
    status_massage
    
}: WidgetPresenterProps )
{
  return (
    <>
      <WidgetFileUpload
        inputRef={inputRef}
        onFileInputChange={onFileInputChange}
        triggerFileDialog={triggerFileDialog}
        status_massage={status_massage}
      />
      <WidgetCreateDescriptorFile
        on_toggle_dropdown={on_toggle_dropdown}
        isOpen={is_dropdown_open} 
        inputRefs={inputRefs}        
        onCreate={onCreate}
      />
      <WidgetConvertMotionFile
        on_convert_motion_file_pose_viewer={on_convert_pose_viewer}
        on_convert_motion_file={on_convert_bvh}
      />
      <WidgetListFiles
        motionFiles={motionFiles}
        selectedMotionFile={selectedMotionFile}
        onFetchFileList={onFetchFileList}
        onSelectMotionFile={onSelectMotionFile}
      />
    </>
  );
}
