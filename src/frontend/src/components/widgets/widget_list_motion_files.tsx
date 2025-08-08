type WidgetListFilesProps = 
{
  motion_files: Array<{type: string, name: string}>;
  motion_file_selected: string | null;
  motion_file_list_on_focus: () => void;
  motion_file_list_on_change: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function WidgetListFiles(widget_list_files_props: WidgetListFilesProps) {
    
  return (
    <>
      <select
        value={widget_list_files_props.motion_file_selected || ""}
        onFocus={widget_list_files_props.motion_file_list_on_focus}
        onChange={widget_list_files_props.motion_file_list_on_change}
      >
        <option value="">Select file</option>
        {widget_list_files_props.motion_files.map(file_obj =>
        <option key={file_obj.name} value={file_obj.name}>
            [{file_obj.type.toUpperCase()}] {file_obj.name}
        </option>
        )}
      </select>
    </>
  );
}