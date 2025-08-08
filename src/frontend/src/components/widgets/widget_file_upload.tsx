
type WidgetFileUploadProps = 
{
    file_dialog_reference: React.RefObject<HTMLInputElement | null>;
    file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
    file_dialog_on_click: () => void;
};

export function WidgetFileUpload(widget_file_upload_props: WidgetFileUploadProps) {
  return (
    <>
      <button onClick={widget_file_upload_props.file_dialog_on_click}>Search for files</button>
      <input
        type="file"
        ref={widget_file_upload_props.file_dialog_reference}
        multiple
        onChange={widget_file_upload_props.file_dialog_on_change}
        style={{ display: "none" }}
      />
    </>
  );
}