import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';

const ENDPOINT = '/api_file_upload/upload';

type FileUploadResponse = {
  message: number | string; // backend: saved(int) oder ""
  warning: string; // backend: ", ".join(not_saved_files) oder ""
  target_path: string //path to the file uploaded including the file name or ""
};

export function hook_file_upload() {
  const queryClient = useQueryClient();
  const { success, error } = use_snackbar_ctx();

  //QUESTION: Why is this called so often? seems like almost every frame
  console.debug("I'm calling the file upload button!!");

  const upload_files = useCallback(
    async (files: File[] | FileList) => {
      const fileArray = Array.isArray(files) ? files : Array.from(files);

      try {
        const form = new FormData();
        // Backend erwartet: files: List[UploadFile] = File(...)
        for (const f of fileArray) form.append('files', f);

        const response = await fetch(ENDPOINT, {
          method: 'POST',
          body: form,
          // Wichtig: keinen Content-Type setzen (boundary wird automatisch gesetzt)
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

        const notSavedFiles = data.warning
          ? data.warning
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        // Cache Metadata (wie bei download/save)
        queryClient.setQueryData(['file_upload_metadata'], {
          date: new Date().toISOString(),
          uploadedCount: fileArray.length,
          uploadedFiles: fileArray.map((f) => ({ name: f.name, size: f.size, type: f.type })),
          savedCount,
          notSavedFiles,
          warning: data.warning ?? '',
        });

        // Optional: falls ihr Listen cached, hier invalidieren:
        // queryClient.invalidateQueries({ queryKey: ['motions'] });
        // queryClient.invalidateQueries({ queryKey: ['files'] });

        if (notSavedFiles.length > 0) {
          error(
            savedCount > 0
              ? `Upload teilweise erfolgreich (${savedCount}/${fileArray.length}). Nicht unterstützt: ${notSavedFiles.join(', ')}`
              : `Upload fehlgeschlagen: Nicht unterstützte Dateien: ${notSavedFiles.join(', ')}`,
          );
        } else {
          success(`Upload erfolgreich: ${savedCount} Datei(en) gespeichert`);
        }

        return data;
      } catch (err: any) {
        console.error('File Upload Error:', err);
        error(`Fehler beim Upload: ${err.message}`);
        throw err;
      }
    },
    [queryClient, success, error],
  );

  return { upload_files };
}
