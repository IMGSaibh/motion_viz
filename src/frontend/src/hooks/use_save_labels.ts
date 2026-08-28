import { useMutation } from '@tanstack/react-query';
import { save_labels } from '@/api/api_motion_labels';

export function useSaveLabels() {
  return useMutation({ mutationFn: save_labels });
}
