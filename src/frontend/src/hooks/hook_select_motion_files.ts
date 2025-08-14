import { useQuery } from '@tanstack/react-query';
import { list_motion_files, MotionFileItem } from '../api/api_file_processing';

export function select_motion_files(options?: { enabled?: boolean; staleTime?: number }) {
  const query_keys = {
    motionFiles: ['motion-files'] as const,
  };
  return useQuery({
    queryKey: query_keys.motionFiles,
    queryFn: ({ signal }) => list_motion_files({ signal }),
    select: (data) => {
      const items: MotionFileItem[] = [
        ...data.bvh.map((name) => ({ type: 'bvh' as const, name })),
        ...data.fbx.map((name) => ({ type: 'fbx' as const, name })),
        ...data.npy.map((name) => ({ type: 'npy' as const, name })),
      ];
      return items;
    },
    staleTime: options?.staleTime ?? 30_000,
    enabled: options?.enabled ?? true,
  });
}
