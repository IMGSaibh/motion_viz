type WidgetListFilesProps = 
{
  motion_files: Array<{type: string, name: string}>;
  motion_file_selected: string | null;
  motion_file_list_on_focus: () => void;
  motion_file_list_on_change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function WidgetListFiles({ 
  motion_files,
  motion_file_selected,
  motion_file_list_on_focus,
  motion_file_list_on_change
}: WidgetListFilesProps) {
    
  return (
    <>
      <select
        value={motion_file_selected || ""}
        onFocus={motion_file_list_on_focus}
        onChange={motion_file_list_on_change}
      >
        <option value="">Select file</option>
        {motion_files.map(file_obj =>
        <option key={file_obj.name} value={file_obj.name}>
            [{file_obj.type.toUpperCase()}] {file_obj.name}
        </option>
        )}
      </select>
    </>
  );
}