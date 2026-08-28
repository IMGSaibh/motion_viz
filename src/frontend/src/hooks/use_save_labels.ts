import { useMutation } from '@tanstack/react-query';
import { save_labels } from '@/api/labels_api';

export function useSaveLabels() {
  return useMutation({ mutationFn: save_labels });
}
