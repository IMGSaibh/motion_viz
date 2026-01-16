import Button from '@mui/material/Button';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

type Props = {
  file_dialog_reference: React.RefObject<HTMLInputElement | null>;
  file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
  delete_dialog_on_click: () => void;
};

export function WidgetFileOperations(props: Props) {
  return (
    <>
      <Button component="label" startIcon={<CloudUploadIcon />}>
        Upload Files
        <input ref={props.file_dialog_reference} type="file" multiple hidden onChange={props.file_dialog_on_change} />
      </Button>
      {/* <Button startIcon={<DeleteIcon />} onClick={props.delete_dialog_on_click}>
        Delete Files
      </Button> */}
    </>
  );
}
