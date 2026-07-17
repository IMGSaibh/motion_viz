import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upload_motion_files } from '@/api/motion_api';
import { MOTION_FILES_QUERY_KEY } from '@/hooks/use_motion_files';

export function useFileUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: File[] | FileList) => upload_motion_files(Array.from(files)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MOTION_FILES_QUERY_KEY });
    },
  });
}