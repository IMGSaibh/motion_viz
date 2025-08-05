
type WidgetFileUploadProps = 
{
    file_dialog_reference: React.RefObject<HTMLInputElement | null>;
    file_dialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
    file_dialog_on_click: () => void;
};

export function WidgetFileUpload({ 
    file_dialog_reference, 
    file_dialog_on_change,
    file_dialog_on_click 
}: WidgetFileUploadProps) {
  return (
    <>
      <button onClick={file_dialog_on_click}>Search for files</button>
      <input
        type="file"
        ref={file_dialog_reference}
        multiple
        onChange={file_dialog_on_change}
        style={{ display: "none" }}
      />
    </>
  );
}