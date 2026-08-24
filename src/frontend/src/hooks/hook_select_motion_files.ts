import { useQuery } from '@tanstack/react-query';

const ENDPOINT = '/api_list_files/list_files';

export type MotionFileItem = {
  type: 'bvh' | 'fbx' | 'npy' | 'glb';
  name: string;
};

type MotionFilesResponse = {
  bvh: string[];
  fbx: string[];
  npy: string[];
  glb: string[];
};

export function hook_list_motion_files() {
  return useQuery({
    queryKey: ['motion_files'],
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
        ...data.glb.map((name) => ({ type: 'glb' as const, name })),
      ];

      return items;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function hook_list_topologies() {
  return useQuery({
    queryKey: ['topologies'],
    queryFn: async (): Promise<string[]> => {
      const response = await fetch('/api_list_files/list_topologies', { method: 'GET' });

      if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        const errText = ct.includes('application/json') ? JSON.stringify(await response.json()) : await response.text();
        throw new Error(`List topologies failed (${response.status}): ${errText}`);
      }

      const data = (await response.json()) as string[];
      return data;
    },
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
