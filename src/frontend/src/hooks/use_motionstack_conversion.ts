import { useMutation } from '@tanstack/react-query';
import { convert_motionstack_files } from '@/api/api_motion_files';

export function useMotionstackConversion() {
  return useMutation({ mutationFn: convert_motionstack_files });
}
