import type { ErgoLabel, LabelCategory, LabelImage } from '@/domain/datatypes';

export function create_label_category(id: number, name: string, image: LabelImage): LabelCategory {
  return { id, name, features: [{ id: 1, name: image.name, image }] };
}

export function uid() {
  // Browser: crypto.randomUUID; fallback wenn nicht vorhanden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== 'undefined' ? crypto : null;
  return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number) {
  return aFrom < bTo && aTo > bFrom;
}

export function can_save_for_range(args: {
  labels: ErgoLabel[];
  category?: string;
  from: number;
  to: number;
  id?: string | null;
}) {
  const fromN = Math.min(args.from, args.to);
  const toN = Math.max(args.from, args.to);
  const hasOverlapSameCategory = args.labels.some((label) => {
    if (args.id && label.id === args.id) return false;
    const mf = Math.min(label.start_frame, label.end_frame);
    const mt = Math.max(label.start_frame, label.end_frame);
    return fromN < mt && toN > mf;
  });

  return !hasOverlapSameCategory;
}
