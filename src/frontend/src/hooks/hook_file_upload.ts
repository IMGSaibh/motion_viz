import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { MOTION_FILES_QUERY_KEY } from '@/hooks/hook_select_motion_files';

const ENDPOINT = '/api_file_upload/upload';

type FileUploadResponse = {
  message: number | string;
  warning: string;
  saved_files?: string[];
  skipped_existing_files?: string[];
  unsupported_files?: string[];
};

export function hook_file_upload() {
  const queryClient = useQueryClient();
  const { success, warning, error } = use_snackbar_ctx();

  const upload_files = useCallback(
    async (files: File[] | FileList) => {
      const fileArray = Array.isArray(files) ? files : Array.from(files);

      try {
        const form = new FormData();
        for (const file of fileArray) form.append('files', file);

        const response = await fetch(ENDPOINT, {
          method: 'POST',
          body: form,
        });

        if (!response.ok) {
          const ct = response.headers.get('content-type') || '';
          const errText = ct.includes('application/json')
            ? JSON.stringify(await response.json())
            : await response.text();
          throw new Error(`Upload failed (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as FileUploadResponse;
        const savedCount = typeof data.message === 'number' ? data.message : data.message ? Number(data.message) : 0;
        const skippedExistingFiles = data.skipped_existing_files ?? [];
        const unsupportedFiles = data.unsupported_files ?? [];

        queryClient.setQueryData(['file_upload_metadata'], {
          date: new Date().toISOString(),
          uploadedCount: fileArray.length,
          uploadedFiles: fileArray.map((file) => ({ name: file.name, size: file.size, type: file.type })),
          savedCount,
          savedFiles: data.saved_files ?? [],
          skippedExistingFiles,
          unsupportedFiles,
          warning: data.warning ?? '',
        });

        await queryClient.invalidateQueries({ queryKey: MOTION_FILES_QUERY_KEY });

        const skippedNotes = [
          skippedExistingFiles.length > 0 ? `already uploaded: ${skippedExistingFiles.join(', ')}` : '',
          unsupportedFiles.length > 0 ? `not supported: ${unsupportedFiles.join(', ')}` : '',
        ].filter(Boolean);

        if (skippedNotes.length > 0) {
          const message =
            savedCount > 0
              ? `Upload teilweise erfolgreich (${savedCount}/${fileArray.length}); skipped: ${skippedNotes.join('; ')}`
              : `Upload skipped: ${skippedNotes.join('; ')}`;

          if (unsupportedFiles.length > 0) {
            error(message);
          } else {
            warning(message);
          }
        } else if (savedCount > 0) {
          success(`Upload erfolgreich: ${savedCount} Datei(en) gespeichert`);
        } else {
          warning('Keine Dateien hochgeladen.');
        }

        return data;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('File Upload Error:', err);
        error(`Fehler beim Upload: ${message}`);
        throw err;
      }
    },
    [queryClient, success, warning, error],
  );

  return { upload_files };
}
