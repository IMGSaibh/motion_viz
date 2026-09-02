import { useMutation } from '@tanstack/react-query';
import { download_labels, save_blob } from '@/api/api_motion_labels';

export function useDownloadLabels() {
  return useMutation({
    mutationFn: download_labels,
    onSuccess: save_blob,
  });
}
