import { useMutation } from '@tanstack/react-query';
import { createMotionDescriptor, MotionDescriptorData } from '../api/api_file_processing';

export function create_motion_descriptor() {
  return useMutation({
    mutationFn: (payload: MotionDescriptorData) => createMotionDescriptor(payload),
  });
}
