import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { use_snackbar_ctx } from '@/context/context_snackbar';

const ENDPOINT = '/api_motion_descriptor/motion_descriptor';

export type MotionDescriptorData = {
  format: string;
  abbrev: string;
  scale: number;
  positions: string;
  rotations: string;
  systemname: string;
  fps: number;
  jointcount: number;
  coloffset: number;
  colgap: number;
  dimsize: number;
};

type MotionDescriptorResponse = {
  message: string; // "config file created" oder ""
  warning: string; // "" oder "could not create config file"
};

export function hook_motion_descriptor() {
  const queryClient = useQueryClient();
  const { success, error } = use_snackbar_ctx();

  const create_motion_descriptor = useCallback(
    async (config: MotionDescriptorData) => {
      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config),
        });

        if (!response.ok) {
          const ct = response.headers.get('content-type') || '';
          const errText = ct.includes('application/json')
            ? JSON.stringify(await response.json())
            : await response.text();

          throw new Error(`motion_descriptor failed (${response.status}): ${errText}`);
        }

        const data = (await response.json()) as MotionDescriptorResponse;

        queryClient.setQueryData(['motion_descriptor_metadata'], {
          date: new Date().toISOString(),
          request: config,
          message: data.message ?? '',
          warning: data.warning ?? '',
        });

        if (data.warning) {
          error(`Motion Descriptor: ${data.warning}`);
        } else {
          success(data.message || 'Config file created');
        }

        return data;
      } catch (err: any) {
        console.error('Motion Descriptor Error:', err);
        error(`Fehler beim Erstellen der Descriptor-Datei: ${err.message}`);
        throw err;
      }
    },
    [queryClient, success, error],
  );

  return { create_motion_descriptor };
}
