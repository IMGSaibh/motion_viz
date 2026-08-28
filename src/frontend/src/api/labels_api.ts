import type { ErgoLabel, LabelCategory, LabelFeature, LabelImage } from '@/domain/datatypes';
import { uid } from '@/domain/label_logic';
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
  load: '/api_list_files/load_labels',
} as const;

function parse_labels(value: unknown): ErgoLabel[] {
  const record = parse_record(value, 'load labels');
  if (!Array.isArray(record.labels)) throw new Error('Invalid load labels response field: labels');

  return record.labels.map((value, index) => {
    const label = parse_record(value, `label ${index + 1}`);
    const startFrame = label.start_frame;
    const endFrame = label.end_frame;
    if (typeof startFrame !== 'number' || !Number.isFinite(startFrame)) {
      throw new Error(`Invalid label ${index + 1} field: start_frame`);
    }
    if (typeof endFrame !== 'number' || !Number.isFinite(endFrame)) {
      throw new Error(`Invalid label ${index + 1} field: end_frame`);
    }
    if (label.ergo_method !== undefined && typeof label.ergo_method !== 'string') {
      throw new Error(`Invalid label ${index + 1} field: ergo_method`);
    }
    if (!Array.isArray(label.categories)) throw new Error(`Invalid label ${index + 1} field: categories`);

    const categories: LabelCategory[] = label.categories.map((value, categoryIndex) => {
      const category = parse_record(value, `label ${index + 1} category ${categoryIndex + 1}`);
      if (typeof category.id !== 'number' || typeof category.name !== 'string' || !Array.isArray(category.features)) {
        throw new Error(`Invalid label ${index + 1} category ${categoryIndex + 1}`);
      }

      const features: LabelFeature[] = category.features.map((value, featureIndex) => {
        const feature = parse_record(value, `label ${index + 1} feature ${featureIndex + 1}`);
        const imageRecord = parse_record(feature.image, `label ${index + 1} feature image ${featureIndex + 1}`);
        if (typeof feature.id !== 'number' || typeof feature.name !== 'string') {
          throw new Error(`Invalid label ${index + 1} feature ${featureIndex + 1}`);
        }
        const image: LabelImage = {
          name: read_string(imageRecord, 'name'),
          src: read_string(imageRecord, 'src'),
          category: read_string(imageRecord, 'category'),
        };
        return { id: feature.id, name: feature.name, image };
      });
      return { id: category.id, name: category.name, features };
    });

    return {
      id: uid(),
      start_frame: startFrame,
      end_frame: endFrame,
      ergo_method: label.ergo_method,
      categories,
    };
  });
}

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

export async function load_labels_for_file(filename: string): Promise<ErgoLabel[]> {
  const response = await fetch(api_get_base_url(`${ENDPOINTS.load}/${encodeURIComponent(filename)}`), { method: 'GET' });
  await assert_response_ok(response, 'Load labels');
  return parse_labels(await response.json());
}
