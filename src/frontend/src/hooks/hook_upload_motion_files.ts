import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFiles, deleteFiles } from '@/api/api_file_processing';

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
