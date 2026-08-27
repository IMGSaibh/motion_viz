import { useMutation } from '@tanstack/react-query';

import { load_labels_for_file } from '@/api/labels_api';

export function useLoadLabels() {
  return useMutation({ mutationFn: load_labels_for_file });
}
