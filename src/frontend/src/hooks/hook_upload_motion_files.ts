import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFiles, save_labels_to_json, deleteFiles } from '@/api/api_file_processing';
import { LabelML } from '@/domain/datatypes';

export function hook_upload_motion_files() {
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
    mutationFn: (args: { file_name: string; labels: LabelML[] }) => save_labels_to_json(args.file_name, args.labels),
  });
}

export function hook_delete_motion_files() {
  const query_keys = {
    motionFiles: ['motion-files'] as const,
  };
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (filenames: string[]) => deleteFiles(filenames),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: query_keys.motionFiles });
    },
  });
}
