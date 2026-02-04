import { ErgoLabel } from '@/domain/datatypes';

export function uid() {
  // Browser: crypto.randomUUID; fallback wenn nicht vorhanden
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== 'undefined' ? crypto : null;
  return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// normalize categorie string to make it comparable
export function normalize_category(categorie?: string) {
  return (categorie ?? 'Uncategorized').trim() || 'Uncategorized';
}

export function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number) {
  return aFrom < bTo && aTo > bFrom;
}

export function can_save_for_range(args: {
  labels: ErgoLabel[];
  category?: string;
  from: number;
  to: number;
  ignore_id?: string | null;
}) {
  const fromN = Math.min(args.from, args.to);
  const toN = Math.max(args.from, args.to);
  const target_category = normalize_category(args.category);

  const hasOverlapSameCategory = args.labels.some((label) => {
    if (args.ignore_id && label.id === args.ignore_id) return false;
    const mCat = normalize_category(label.ergo_method);
    if (mCat !== target_category) return false;
    const mf = Math.min(label.start_frame, label.end_frame);
    const mt = Math.max(label.start_frame, label.end_frame);
    return fromN < mt && toN > mf;
  });

  return !hasOverlapSameCategory;
}
