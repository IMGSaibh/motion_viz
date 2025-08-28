import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFiles, save_labels_to_json, type LabelItem } from '../api/api_file_processing';

export function upload_motion_files() {
  const query_keys = {
    motionFiles: ['motion-files'] as const,
  };
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (files: File[]) => uploadFiles(files),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: query_keys.motionFiles });
    },
  });
}

export function hook_save_labels_to_json() {
  return useMutation({
    mutationFn: (args: { file_name: string; labels: LabelItem[] }) => save_labels_to_json(args.file_name, args.labels),
  });
}
