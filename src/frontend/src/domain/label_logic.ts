import type { ErgoLabel, LabelCategory, OwasSelection, RulaSelection } from '@/domain/datatypes';

export function get_rula_selection_from_label(label: ErgoLabel): RulaSelection {
  const getFeatures = (category: string) =>
    label.categories.find((item) => item.name === category)?.features.map((feature) => feature.id) ?? [];
  const createFeatureSelection = (category: string) => {
    const [feature_id = null, ...optional_feature_ids] = getFeatures(category);
    return { feature_id, optional_feature_ids };
  };
  const lowerArmFeatures = getFeatures('CAT_LOWERARM');
  const legsFeatures = getFeatures('CAT_LEGS');

  return {
    CAT_UPPERARM: createFeatureSelection('CAT_UPPERARM'),
    CAT_LOWERARM: lowerArmFeatures[0] ?? null,
    CAT_WRIST: createFeatureSelection('CAT_WRIST'),
    CAT_NECK: createFeatureSelection('CAT_NECK'),
    CAT_TRUNK: createFeatureSelection('CAT_TRUNK'),
    CAT_LEGS: legsFeatures[0] ?? null,
  };
}

export function get_owas_selection_from_label(label: ErgoLabel): OwasSelection {
  const getFeature = (category: string) =>
    label.categories.find((item) => item.name === category)?.features[0]?.id ?? null;

  return {
    CAT_BACK: getFeature('CAT_BACK'),
    CAT_ARMS: getFeature('CAT_ARMS'),
    CAT_LEGS: getFeature('CAT_LEGS'),
  };
}

export function create_empty_rula_selection(): RulaSelection {
  return {
    CAT_UPPERARM: { feature_id: null, optional_feature_ids: [] },
    CAT_LOWERARM: null,
    CAT_WRIST: { feature_id: null, optional_feature_ids: [] },
    CAT_NECK: { feature_id: null, optional_feature_ids: [] },
    CAT_TRUNK: { feature_id: null, optional_feature_ids: [] },
    CAT_LEGS: null,
  };
}

export function create_label_category(id: number, name: string, feature_id: number): LabelCategory {
  return { id, name, features: [{ id: feature_id }] };
}

export function create_label_category_with_features(
  id: number,
  name: string,
  feature_ids: readonly number[],
): LabelCategory {
  return {
    id,
    name,
    features: feature_ids.map((feature_id) => ({ id: feature_id })),
  };
}

export function uid() {
  // Browser: crypto.randomUUID; fallback when unavailable
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = typeof crypto !== 'undefined' ? crypto : null;
  return c?.randomUUID ? c.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function overlaps(aFrom: number, aTo: number, bFrom: number, bTo: number) {
  return aFrom <= bTo && aTo >= bFrom;
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
    return overlaps(fromN, toN, mf, mt);
  });

  return !hasOverlapSameCategory;
}
