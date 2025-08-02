type WidgetListFilesProps = 
{
  motionFiles: Array<{type: string, name: string}>;
  selectedMotionFile: string | null;
  onFetchFileList: () => void;
  onSelectMotionFile: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function WidgetListFiles({ 
  motionFiles,
  selectedMotionFile,
  onFetchFileList,
  onSelectMotionFile
}: WidgetListFilesProps) {
    
  return (
    <>
      <select
        value={selectedMotionFile || ""}
        onFocus={onFetchFileList}
        onChange={onSelectMotionFile}
        style={{ marginTop: 5 }}
      >
        <option value="">Select file</option>
        {motionFiles.map(fileObj =>
        <option key={fileObj.name} value={fileObj.name}>
            [{fileObj.type.toUpperCase()}] {fileObj.name}
        </option>
        )}
      </select>
    </>
  );
}