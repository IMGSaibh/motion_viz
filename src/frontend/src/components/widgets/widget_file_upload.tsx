
type WidgetFileUploadProps = 
{
    filedialog_reference: React.RefObject<HTMLInputElement | null>;
    filedialog_on_change: (e: React.ChangeEvent<HTMLInputElement>) => void;
    filedialog_on_click: () => void;
};

export function WidgetFileUpload({ 
    filedialog_reference, 
    filedialog_on_change,
    filedialog_on_click 
}: WidgetFileUploadProps) {
  return (
    <>
      <button onClick={filedialog_on_click}>Search for files</button>
      <input
        type="file"
        ref={filedialog_reference}
        multiple
        onChange={filedialog_on_change}
        style={{ display: "none" }}
      />
    </>
  );
}