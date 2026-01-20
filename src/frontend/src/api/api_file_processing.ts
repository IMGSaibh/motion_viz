import { fetch_json, fetch_form } from '@/api/api_client';

export type MotionFilesResponse = { bvh: string[]; fbx: string[]; npy: string[] };
export type MotionFileItem = { type: 'bvh' | 'fbx' | 'npy'; name: string };

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

export async function list_motion_files(opts?: { signal?: AbortSignal }): Promise<MotionFilesResponse> {
  return fetch_json<MotionFilesResponse>('/api_list_files/list_files', { signal: opts?.signal });
}

export async function uploadFiles(files: File[], opts?: { signal?: AbortSignal }) {
  const form = new FormData();
  files.forEach((f) => form.append('files', f));
  return fetch_form<{ message?: string | number; warning?: string[] | string }>('/api_file_upload/upload', form, {
    signal: opts?.signal,
  });
}

export async function deleteFiles(filenames: string[], opts?: { signal?: AbortSignal }) {
  return fetch_json<{ message?: string | number; warning?: string[] | string }>('/api_file_delete/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filenames }),
    signal: opts?.signal,
  });
}

export async function createMotionDescriptor(data: MotionDescriptorData, opts?: { signal?: AbortSignal }) {
  return fetch_json<{ message: string }>('/api_motion_descriptor/motion_descriptor', {
    method: 'POST',
    body: JSON.stringify(data),
    signal: opts?.signal,
  });
}

export async function convertWithPoseViewer(opts?: { signal?: AbortSignal }) {
  return fetch_json<{ message: string; warning?: string | string[] }>('/api_pose_viewer_conversion/convert_pv_style', {
    method: 'POST',
    signal: opts?.signal,
  });
}

export async function convertBvh(opts?: { signal?: AbortSignal }) {
  return fetch_json<{ message: string; warning?: string | string[] }>(
    '/api_motion_file_conversion/convert_bvh_to_npy',
    { method: 'POST', signal: opts?.signal },
  );
}

export async function save_labels_to_json(
  motion_name: string,
  labels: { ergo_method?: string; start_frame: number; end_frame: number; button_text?: string }[],
) {
  return fetch_json('/api_save_labels/save_labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ motion_name, labels }),
  });
}

export async function download_labels_jsons(opts?: { signal?: AbortSignal }) {
  console.log('api file download_labels_jsons called');

  return fetch_json<{ message: string; warning?: string | string[] }>('/api_download_labels/download_labels', {
    method: 'POST',
    signal: opts?.signal,
  });
}
