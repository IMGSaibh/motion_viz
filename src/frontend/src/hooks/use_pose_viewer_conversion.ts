import { useMutation } from '@tanstack/react-query';
import { convert_pose_viewer_files } from '@/api/api_motion_files';

export function usePoseViewerConversion() {
  return useMutation({ mutationFn: convert_pose_viewer_files });
}
