// import { download_labels_jsons } from '@/api/api_file_processing';
// import { useMutation, useQueryClient } from '@tanstack/react-query';

// export function hook_download_labels() {
//   console.log('hook download labels called');
//   const qc = useQueryClient();
//   return useMutation({
//     // mutationFn: () => download_labels_jsons(),
//     onSuccess: () => qc.invalidateQueries(),
//   });
// }

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';

// API-Endpunkt im Backend
const ENDPOINT = '/api_download_labels/download_labels';

/**
 * React Query basierter Download-Hook
 * Lädt alle JSON-Labels als ZIP herunter und cached optional Metadaten
 */
export function use_download_labels() {
  const queryClient = useQueryClient();
  const { success, error } = use_snackbar_ctx();

  const download_labels = useCallback(async () => {
    try {
      // Backend-Request
      const response = await fetch(ENDPOINT, {
        method: 'GET',
      });

      // Prüfe Response
      if (!(response instanceof Response)) {
        throw new Error('Invalid response object from fetch');
      }

      // Dateiname extrahieren
      const contentDisposition = response.headers.get('Content-Disposition');
      const fileNameMatch = contentDisposition?.match(/filename="(.+)"/);
      const fileName = fileNameMatch ? fileNameMatch[1] : 'labels_export.zip';

      // ZIP herunterladen
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      // Optional: Cache aktualisieren (z. B. wenn du später JSON-Dateien lokal anzeigen willst)
      queryClient.setQueryData(['download_labels_metadata'], {
        fileName,
        size: blob.size,
        date: new Date().toISOString(),
      });

      success(`Labels erfolgreich heruntergeladen (${fileName})`);
    } catch (err: any) {
      console.error('Download Labels Error:', err);
      error(`Fehler beim Herunterladen der Labels: ${err.message}`);
    }
  }, [queryClient, success, error]);

  return { download_labels };
}
