import { useQuery } from '@tanstack/react-query';
import { list_motion_files } from '@/api/api_motion_files';

export const MOTION_FILES_QUERY_KEY = ['motion_files'] as const;

export function useMotionFiles() {
  return useQuery({
    queryKey: MOTION_FILES_QUERY_KEY,
    queryFn: ({ signal }) => list_motion_files(signal),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
