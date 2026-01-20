import { download_labels_jsons } from '@/api/api_file_processing';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function hook_download_labels() {
  console.log('hook download labels called');
  const qc = useQueryClient();
  return useMutation({
    // mutationFn: () => download_labels_jsons(),
    onSuccess: () => qc.invalidateQueries(),
  });
}
