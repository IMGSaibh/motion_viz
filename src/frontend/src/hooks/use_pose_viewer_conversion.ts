import { useMutation } from '@tanstack/react-query';
import { convert_pose_viewer_files } from '@/api/motion_api';

export function usePoseViewerConversion() {
  return useMutation({ mutationFn: convert_pose_viewer_files });
}