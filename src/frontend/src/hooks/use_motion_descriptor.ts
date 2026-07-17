import { useMutation } from '@tanstack/react-query';
import { create_motion_descriptor } from '@/api/motion_api';

export function useMotionDescriptor() {
  return useMutation({ mutationFn: create_motion_descriptor });
}