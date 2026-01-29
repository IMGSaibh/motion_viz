import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';

const ENDPOINT = '/api_bvh_conversion/convert_bvh_to_npy';

type BvhConversionResponse = {
  message: string;
  warning: string;
  errors?: string; // backend liefert aktuell einen String (z.B. "[{'file': 'x.bvh'}]")
};

export function hook_bvh_conversion() {
  const queryClient = useQueryClient();
  const { success, error } = use_snackbar_ctx();

  const convert_bvh_to_npy = useCallback(async () => {
    try {
      const response = await fetch(ENDPOINT, { method: 'POST' });

      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();

        throw new Error(`Conversion failed (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as BvhConversionResponse;

      // Metadata ähnlich wie beim Download-Hook
      queryClient.setQueryData(['bvh_conversion_metadata'], {
        date: new Date().toISOString(),
        message: data.message,
        warning: data.warning,
        errors: data.errors ?? '',
      });

      // Optional: falls ihr irgendwo Motion/Files/Assets cached, kann man hier invalidieren:
      // queryClient.invalidateQueries({ queryKey: ['motions'] });
      // queryClient.invalidateQueries({ queryKey: ['npy_files'] });

      if (data.warning) {
        error(`Konvertierung abgeschlossen, aber Hinweis: ${data.warning}`);
      } else if (data.errors && data.errors !== '[]') {
        error(`Konvertierung abgeschlossen, aber mit Fehlern: ${data.errors}`);
      } else {
        success(data.message || 'BVH → NPY Konvertierung abgeschlossen');
      }

      return data;
    } catch (err: any) {
      console.error('BVH Conversion Error:', err);
      error(`Fehler bei BVH→NPY Konvertierung: ${err.message}`);
      throw err;
    }
  }, [queryClient, success, error]);

  return { convert_bvh_to_npy };
}
