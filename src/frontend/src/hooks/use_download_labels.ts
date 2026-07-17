import { useMutation } from '@tanstack/react-query';
import { download_labels, save_blob } from '@/api/labels_api';

export function useDownloadLabels() {
  return useMutation({
    mutationFn: download_labels,
    onSuccess: save_blob,
  });
}