import { useMutation } from '@tanstack/react-query';

import { load_labels_for_file } from '@/api/api_motion_labels';

export function useLoadLabels() {
  return useMutation({ mutationFn: load_labels_for_file });
}
