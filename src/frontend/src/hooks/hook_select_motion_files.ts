import { useQuery } from '@tanstack/react-query';

const ENDPOINT = '/api_list_files/list_files';
export const MOTION_FILES_QUERY_KEY = ['motion_files'] as const;

export type MotionFileItem = {
  type: 'bvh' | 'fbx' | 'npy';
  name: string;
};

type MotionFilesResponse = {
  bvh: string[];
  fbx: string[];
  npy: string[];
};

export function hook_list_motion_files() {
  return useQuery({
    queryKey: MOTION_FILES_QUERY_KEY,
    queryFn: async (): Promise<MotionFileItem[]> => {
      const response = await fetch(ENDPOINT, { method: 'GET' });

      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();
        throw new Error(`List motion files failed (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as MotionFilesResponse;

      const items: MotionFileItem[] = [
        ...data.bvh.map((name) => ({ type: 'bvh' as const, name })),
        ...data.fbx.map((name) => ({ type: 'fbx' as const, name })),
        ...data.npy.map((name) => ({ type: 'npy' as const, name })),
      ];

      return items;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
