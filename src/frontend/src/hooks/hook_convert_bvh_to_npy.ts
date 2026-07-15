import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { MOTION_FILES_QUERY_KEY } from '@/hooks/hook_select_motion_files';

const ENDPOINT = '/api_bvh_conversion/convert_bvh_to_npy';

type BvhConversionError = {
  file: string;
  error_type: string;
  message: string;
};

type BvhConversionResponse = {
  message: string;
  warning: string;
  errors?: BvhConversionError[];
};

function format_conversion_errors(errors: BvhConversionError[]) {
  return errors.map((item) => `${item.file}: ${item.error_type} - ${item.message}`).join('\n');
}

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

      queryClient.setQueryData(['bvh_conversion_metadata'], {
        date: new Date().toISOString(),
        message: data.message,
        warning: data.warning,
        errors: data.errors ?? [],
      });

      await queryClient.invalidateQueries({ queryKey: MOTION_FILES_QUERY_KEY });

      if (data.warning) {
        error(`Konvertierung abgeschlossen, aber Hinweis: ${data.warning}`);
      } else if (data.errors?.length) {
        error(`Konvertierung abgeschlossen, aber mit Fehlern:\n${format_conversion_errors(data.errors)}`, 10000);
      } else {
        success(data.message || 'BVH -> NPY Konvertierung abgeschlossen');
      }

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('BVH Conversion Error:', err);
      error(`Fehler bei BVH->NPY Konvertierung: ${message}`);
      throw err;
    }
  }, [queryClient, success, error]);

  return { convert_bvh_to_npy };
}
