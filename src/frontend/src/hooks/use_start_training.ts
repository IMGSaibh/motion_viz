import { start_training } from '@/api/api_motion_files';
import { useMutation } from '@tanstack/react-query';

export function useStartTraining() {
  return useMutation({ mutationFn: start_training });
}
