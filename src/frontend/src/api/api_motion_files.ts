import { api_get_base_url } from '@/utils/api_url';
import {
  assert_response_ok,
  parse_record,
  read_optional_string_array,
  read_string,
  read_string_array,
} from '@/api/api_response';

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

export type MotionFileItem = {
  type: 'bvh' | 'fbx' | 'npy';
  name: string;
};

export type MessageResponse = {
  message: string;
  warning: string;
};

export type FileUploadResponse = MessageResponse & {
  saved_count: number;
  saved_files: string[];
  skipped_existing_files: string[];
  unsupported_files: string[];
};

const ENDPOINTS = {
  motionstackConversion: '/api_motionstack/convert_with_motionstack',
  motionDescriptor: '/api_motion_descriptor/motion_descriptor',
  fileUpload: '/api_file_upload/upload',
  motionFiles: '/api_list_files/list_files',
} as const;

// API modules own transport details and runtime validation; hooks only manage request state and caching.
function parse_message_response(value: unknown, responseName: string): MessageResponse {
  const record = parse_record(value, responseName);
  return { message: read_string(record, 'message'), warning: read_string(record, 'warning') };
}

export async function convert_motionstack_files(): Promise<MessageResponse> {
  const response = await fetch(api_get_base_url(ENDPOINTS.motionstackConversion), { method: 'POST' });
  await assert_response_ok(response, 'Motionstack conversion');
  return parse_message_response(await response.json(), 'Motionstack conversion');
}

export async function create_motion_descriptor(config: MotionDescriptorData): Promise<MessageResponse> {
  const response = await fetch(api_get_base_url(ENDPOINTS.motionDescriptor), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  await assert_response_ok(response, 'Motion descriptor creation');
  return parse_message_response(await response.json(), 'Motion descriptor creation');
}

export async function upload_motion_files(files: File[]): Promise<FileUploadResponse> {
  const form = new FormData();
  files.forEach((file) => form.append('files', file));
  const response = await fetch(api_get_base_url(ENDPOINTS.fileUpload), { method: 'POST', body: form });
  await assert_response_ok(response, 'Upload');
  const record = parse_record(await response.json(), 'upload');
  const rawMessage = record.message;
  const savedCount = typeof rawMessage === 'number' ? rawMessage : Number(rawMessage || 0);
  if (!Number.isFinite(savedCount)) throw new Error('Invalid response field: message');
  return {
    message: String(rawMessage ?? ''),
    warning: read_string(record, 'warning'),
    saved_count: savedCount,
    saved_files: read_optional_string_array(record, 'saved_files'),
    skipped_existing_files: read_optional_string_array(record, 'skipped_existing_files'),
    unsupported_files: read_optional_string_array(record, 'unsupported_files'),
  };
}

export async function list_motion_files(signal?: AbortSignal): Promise<MotionFileItem[]> {
  const response = await fetch(api_get_base_url(ENDPOINTS.motionFiles), { method: 'GET', signal });
  await assert_response_ok(response, 'List motion files');
  const record = parse_record(await response.json(), 'motion files');
  return [
    ...read_string_array(record, 'bvh').map((name) => ({ type: 'bvh' as const, name })),
    ...read_string_array(record, 'fbx').map((name) => ({ type: 'fbx' as const, name })),
    ...read_string_array(record, 'npy').map((name) => ({ type: 'npy' as const, name })),
  ];
}
