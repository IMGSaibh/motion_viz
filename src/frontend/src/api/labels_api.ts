import type { ErgoLabel } from '@/domain/datatypes';
import { api_get_base_url } from '@/utils/api_url';
import { assert_response_ok, parse_record, read_string } from '@/api/api_response';

export type SaveLabelsRequest = {
  motion_name: string;
  labels: ErgoLabel[];
};

export type SaveLabelsResponse = {
  message: string;
  warning: string;
};

export type LabelsDownload = {
  blob: Blob;
  file_name: string;
};

const ENDPOINTS = {
  save: '/api_save_labels/save_labels',
  download: '/api_download_labels/download_labels',
} as const;

export async function save_labels(request: SaveLabelsRequest): Promise<SaveLabelsResponse> {
  const response = await fetch(api_get_base_url(ENDPOINTS.save), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  await assert_response_ok(response, 'Save labels');
  const record = parse_record(await response.json(), 'save labels');
  return { message: read_string(record, 'message'), warning: read_string(record, 'warning') };
}

export async function download_labels(): Promise<LabelsDownload> {
  const response = await fetch(api_get_base_url(ENDPOINTS.download), { method: 'GET' });
  await assert_response_ok(response, 'Download labels');
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('zip')) {
    const preview = await response.text();
    throw new Error(`Expected ZIP but got "${contentType}". Body starts with: ${preview.slice(0, 200)}`);
  }
  const disposition = response.headers.get('Content-Disposition');
  const fileName = disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'labels_export.zip';
  return { blob: await response.blob(), file_name: fileName };
}

export function save_blob({ blob, file_name }: LabelsDownload): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  try {
    anchor.href = url;
    anchor.download = file_name;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}