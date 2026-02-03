import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { ErgoLabel } from '@/domain/datatypes';
const ENDPOINT = '/api_save_labels/save_labels';

type SaveLabelsResponse = {
  message: string;
  warning: string;
};

export function hook_save_labels() {
  const queryClient = useQueryClient();
  const { success, error } = use_snackbar_ctx();

  const save_label_list = useCallback(
    async (motion_name: string, labels: ErgoLabel[]) => {
      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ motion_name, labels }),
        });

        if (!response.ok) {
          const ct = response.headers.get('content-type') || '';
          const errText = ct.includes('application/json')
            ? JSON.stringify(await response.json())
            : await response.text();

          throw new Error(`Save failed (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as SaveLabelsResponse;

        // Cache: "letzter Save" (ähnlich wie download_labels_metadata)
        queryClient.setQueryData(['save_labels_metadata', motion_name], {
          motion_name,
          labelCount: labels.length,
          date: new Date().toISOString(),
          message: data.message,
          warning: data.warning,
        });

        if (data.warning) {
          error(`Labels gespeichert, aber mit Hinweis: ${data.warning}`);
        } else {
          success(`Labels erfolgreich gespeichert :)`);
        }

        return data;
      } catch (err: any) {
        console.error('Save Labels Error:', err);
        error(`Fehler beim Speichern der Labels: ${err.message}`);
        throw err;
      }
    },
    [queryClient, success, error],
  );

  return { save_label_list };
}
