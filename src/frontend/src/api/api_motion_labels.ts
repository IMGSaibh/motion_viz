import type { ErgoLabel, LabelCategory, LabelFeature } from '@/domain/datatypes';
import { uid } from '@/domain/label_logic';
import { api_get_base_url } from '@/utils/api_url';
import { assert_response_ok, parse_record, read_string } from '@/api/api_response';

export type SaveLabelsRequest = {
  motion_name: string;
  labels: ErgoLabel[];
};

type LabelFileCategory = {
  category: string;
  feature_id: number[];
};

type LabelFileItem = {
  ergo_method: string;
  start_frame: number;
  end_frame: number;
  categories: LabelFileCategory[];
};

export type SaveLabelsResponse = {
  message: string;
  warning: string;
};

export type LabelsDownload = {
  blob: Blob;
  file_name: string;
};

type CategoryDefinition = {
  id: number;
  cat_name: string;
};

const ENDPOINTS = {
  save: '/api_save_labels/save_labels',
  download: '/api_download_labels/download_labels',
  load: '/api_list_files/load_labels',
} as const;

function get_category_definition(ergoMethod: string, categoryName: string): CategoryDefinition | undefined {
  const definitions = ergoMethod.toUpperCase() === 'OWAS' ? OWAS_CATEGORY_DEFINITIONS : RULA_CATEGORY_DEFINITIONS;
  return definitions.find((definition) => definition.cat_name === categoryName);
}

const OWAS_CATEGORY_DEFINITIONS: readonly CategoryDefinition[] = [
  { id: 1, cat_name: 'CAT_BACK' },
  { id: 2, cat_name: 'CAT_ARMS' },
  { id: 3, cat_name: 'CAT_LEGS' },
  { id: 4, cat_name: 'CAT_LOAD' },
];

const RULA_CATEGORY_DEFINITIONS: readonly CategoryDefinition[] = [
  { id: 1, cat_name: 'CAT_UPPERARM' },
  { id: 2, cat_name: 'CAT_LOWERARM' },
  { id: 3, cat_name: 'CAT_WRIST' },
  { id: 4, cat_name: 'CAT_NECK' },
  { id: 5, cat_name: 'CAT_TRUNK' },
  { id: 6, cat_name: 'CAT_LEGS' },
];

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
    const ergoMethod = label.ergo_method ?? '';
    if (!Array.isArray(label.categories)) throw new Error(`Invalid label ${index + 1} field: categories`);

    const categories: LabelCategory[] = label.categories.map((value, categoryIndex) => {
      const category = parse_record(value, `label ${index + 1} category ${categoryIndex + 1}`);
      if (typeof category.category !== 'string' || !Array.isArray(category.feature_id)) {
        throw new Error(`Invalid label ${index + 1} category ${categoryIndex + 1}`);
      }
      const definition = get_category_definition(ergoMethod, category.category);
      if (!definition) throw new Error(`Unknown category: ${category.category}`);

      const features: LabelFeature[] = category.feature_id.map((value, featureIndex) => {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
          throw new Error(`Invalid label ${index + 1} feature ${featureIndex + 1}`);
        }
        return { id: value };
      });
      return { id: definition.id, name: definition.cat_name, features };
    });

    return {
      id: uid(),
      start_frame: startFrame,
      end_frame: endFrame,
      ergo_method: ergoMethod,
      categories,
    };
  });
}

export async function save_labels(request: SaveLabelsRequest): Promise<SaveLabelsResponse> {
  const labels: LabelFileItem[] = request.labels.map((label) => ({
    ergo_method: label.ergo_method ?? 'Uncategorized',
    start_frame: label.start_frame,
    end_frame: label.end_frame,
    categories: label.categories.map((category) => {
      return {
        category: category.name,
        feature_id: category.features.map((feature) => feature.id),
      };
    }),
  }));

  const response = await fetch(api_get_base_url(ENDPOINTS.save), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      motion_name: request.motion_name,
      labels,
    }),
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
  const response = await fetch(api_get_base_url(`${ENDPOINTS.load}/${encodeURIComponent(filename)}`), {
    method: 'GET',
  });
  await assert_response_ok(response, 'Load labels');
  return parse_labels(await response.json());
}
