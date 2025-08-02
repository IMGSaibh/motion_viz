
type WidgetFileUploadProps = 
{
    inputRef: React.RefObject<HTMLInputElement | null>;
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    triggerFileDialog: () => void;
    status_massage: string | null;
};

export function WidgetFileUpload({ 
    inputRef, 
    onFileInputChange,
    triggerFileDialog, 
    status_massage 
}: WidgetFileUploadProps) {
  return (
    <>
      <button onClick={triggerFileDialog}>Search for files</button>
      <input
        type="file"
        ref={inputRef}
        multiple
        onChange={onFileInputChange}
        style={{ display: "none" }}
      />
        {status_massage && (<p>{status_massage}</p>
      )}
    </>
  );
}