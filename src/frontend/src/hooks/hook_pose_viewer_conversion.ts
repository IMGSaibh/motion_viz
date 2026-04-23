import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';

const ENDPOINT = '/api_pose_viewer_conversion/convert_pv_style';

type PoseViewerConversionResponse = {
  message: string; // z.B. "pose viewer compatible files converted" oder ""
  warning: string; // z.B. "no pose viewer compatible files found." oder ""
};

export function hook_pose_viewer_conversion() {
  const queryClient = useQueryClient();
  const { success, error } = use_snackbar_ctx();

  const convert_pv_style = useCallback(async () => {
    try {
      const response = await fetch(ENDPOINT, { method: 'POST' });

      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();

        throw new Error(`Pose Viewer conversion failed (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as PoseViewerConversionResponse;

      // Metadata wie bei download/save hooks
      queryClient.setQueryData(['pose_viewer_conversion_metadata'], {
        date: new Date().toISOString(),
        message: data.message ?? '',
        warning: data.warning ?? '',
      });

      if (data.warning) {
        error(`PV Conversion: ${data.warning}`);
      } else {
        success(data.message || 'Pose Viewer Conversion abgeschlossen');
      }

      return data;
    } catch (err: any) {
      console.error('Pose Viewer Conversion Error:', err);
      error(`Fehler bei Pose Viewer Conversion: ${err.message}`);
      throw err;
    }
  }, [queryClient, success, error]);

  return { convert_pv_style };
}
