import { useMutation } from '@tanstack/react-query';
import { create_motion_descriptor } from '@/api/api_motion_files';

export function useMotionDescriptor() {
  return useMutation({ mutationFn: create_motion_descriptor });
}
