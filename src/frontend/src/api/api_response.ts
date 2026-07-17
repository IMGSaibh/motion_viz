export async function assert_response_ok(response: Response, operation: string): Promise<void> {
  if (response.ok) return;

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? JSON.stringify(await response.json())
    : await response.text();

  throw new Error(`${operation} failed (${response.status}): ${body}`);
}

export function parse_record(value: unknown, responseName: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid ${responseName} response`);
  }
  return value as Record<string, unknown>;
}

export function read_string(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== 'string') throw new Error(`Invalid response field: ${key}`);
  return value;
}

export function read_string_array(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`Invalid response field: ${key}`);
  }
  return value;
}

export function read_optional_string_array(record: Record<string, unknown>, key: string): string[] {
  return record[key] === undefined ? [] : read_string_array(record, key);
}