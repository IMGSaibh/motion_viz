import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convert_bvh_to_npy } from '@/api/motion_api';
import { MOTION_FILES_QUERY_KEY } from '@/hooks/use_motion_files';

export function useBvhConversion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: convert_bvh_to_npy,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MOTION_FILES_QUERY_KEY });
    },
  });
}