import { useMutation, useQueryClient } from '@tanstack/react-query';
import { convertBvh, convertWithPoseViewer } from '@/api/api_file_processing';

const query_keys = {
  motionFiles: ['motion-files'] as const,
};
export function convert_with_pose_viewer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => convertWithPoseViewer(),
    onSuccess: () => qc.invalidateQueries({ queryKey: query_keys.motionFiles }),
  });
}

export function convert_bvh() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => convertBvh(),
    onSuccess: () => qc.invalidateQueries({ queryKey: query_keys.motionFiles }),
  });
}
