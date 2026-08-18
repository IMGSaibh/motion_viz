import { api_get_base_url } from '@/utils/api_url';
import { assert_response_ok, parse_record, read_string } from '@/api/api_response';
import type { ErgoLabel } from '@/domain/datatypes';

export type MessageResponse = {
  message: string;
  warning: string;
};

const ENDPOINTS = {
  clusterDo: '/api_cluster_do/cluster_do',
} as const;

function parse_message_response(value: unknown, responseName: string): MessageResponse {
  const record = parse_record(value, responseName);
  return { message: read_string(record, 'message'), warning: read_string(record, 'warning') };
}

export async function call_cluster_do(filename: string, labels: ErgoLabel[]): Promise<MessageResponse> {
  const response = await fetch(api_get_base_url(ENDPOINTS.clusterDo), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, labels }),
  });
  await assert_response_ok(response, 'Cluster do');
  return parse_message_response(await response.json(), 'Cluster do');
}
