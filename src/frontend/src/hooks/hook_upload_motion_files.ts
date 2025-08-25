import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadFiles } from '../api/api_file_processing';

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
