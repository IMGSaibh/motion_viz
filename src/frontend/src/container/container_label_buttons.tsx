import {
  create_empty_rula_selection,
  create_label_category,
  create_label_category_with_features,
  uid,
} from '@/domain/label_logic';
import { useEffect } from 'react';
import { use_add_slider_label_ctx, use_save_edit_label_cxt } from '@/context/context_slider_label_list';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import type { ErgoLabel, RulaCategory, LabelCategory, OwasCategory, OwasSelection, RulaSelection } from '@/domain/datatypes';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import { use_is_editing_label_cxt } from '@/context/context_slider_label_list';
import { use_get_labels_cxt } from '@/context/context_slider_label_list';

function getRulaSelectionFromLabel(label: ErgoLabel): RulaSelection {
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

function getOwasSelectionFromLabel(label: ErgoLabel): OwasSelection {
  const getFeature = (category: string) =>
    label.categories.find((item) => item.name === category)?.features[0]?.id ?? null;

  return {
    CAT_BACK: getFeature('CAT_BACK'),
    CAT_ARMS: getFeature('CAT_ARMS'),
    CAT_LEGS: getFeature('CAT_LEGS'),
  };
}

type RulaOptionalCategory = 'CAT_UPPERARM' | 'CAT_WRIST' | 'CAT_NECK' | 'CAT_TRUNK';

function isRulaOptionalCategory(cat: RulaCategory): cat is RulaOptionalCategory {
  return cat === 'CAT_UPPERARM' || cat === 'CAT_WRIST' || cat === 'CAT_NECK' || cat === 'CAT_TRUNK';
}

/**
 * Connects ergonomic label controls to the shared label and frame-range contexts.
 *
 * It receives completed labels from the presenter, persists them in client state, and
 * clears the consumed frame range. Label construction rules belong in domain utilities or
 * method-specific orchestration; button layout and method tabs belong in the presenter and
 * widgets.
 */
export function ContainerLabelButtons() {
  const add_label = use_add_slider_label_ctx();
  const { range, frame_slider_value, set_range } = use_frame_slider_context();
  const ergo_labels = use_get_labels_cxt();
  const effectiveRange = range ?? [frame_slider_value, frame_slider_value];
  const can_save_label = use_can_save_label_cxt();
  const {
    rula_save_requested,
    set_rula_save_requested,
    owas_save_requested,
    set_owas_save_requested,
  } = use_rula_hotkey_context();
  const { owas_selected, set_owas_selected } = use_ergo_methods_cxt();
  const can_save_rula_label = can_save_label('RULA', effectiveRange);
  const { rula_selected, set_rula_selected } = use_ergo_methods_cxt();
  const saveEdit = use_save_edit_label_cxt();

  const all_rula_selected =
    rula_selected.CAT_UPPERARM.feature_id !== null &&
    rula_selected.CAT_LOWERARM !== null &&
    rula_selected.CAT_WRIST.feature_id !== null &&
    rula_selected.CAT_NECK.feature_id !== null &&
    rula_selected.CAT_TRUNK.feature_id !== null &&
    rula_selected.CAT_LEGS !== null;

  const can_save_owas_label = can_save_label('OWAS', effectiveRange);
  const all_owas_selected = Object.values(owas_selected).every(Boolean);
  const is_label_editing = use_is_editing_label_cxt();
  const frame_label =
    range === null && !is_label_editing
      ? ergo_labels.find((label) => frame_slider_value >= label.start_frame && frame_slider_value <= label.end_frame)
      : undefined;
  const display_rula_selection = frame_label?.ergo_method === 'RULA' ? getRulaSelectionFromLabel(frame_label) : null;
  const display_owas_selection = frame_label?.ergo_method === 'OWAS' ? getOwasSelectionFromLabel(frame_label) : null;

  const on_rula_select = (cat: RulaCategory, featureId: number, isOptional: boolean) => {
    if (isOptional && isRulaOptionalCategory(cat)) {
      const selection = rula_selected[cat];
      const isSelected = selection.optional_feature_ids.includes(featureId);
      set_rula_selected({
        ...rula_selected,
        [cat]: {
          ...selection,
          optional_feature_ids: isSelected
            ? selection.optional_feature_ids.filter((id) => id !== featureId)
            : [...selection.optional_feature_ids, featureId],
        },
      });
      return;
    }

    if (isRulaOptionalCategory(cat)) {
      set_rula_selected({
        ...rula_selected,
        [cat]: { ...rula_selected[cat], feature_id: featureId },
      });
      return;
    }

    set_rula_selected({ ...rula_selected, [cat]: featureId });
  };

  const on_rula_save_label = () => {
    if (!all_rula_selected || !can_save_rula_label) return;

    if (is_label_editing) {
      saveEdit();
      return;
    }

    const categories: LabelCategory[] = [
      create_label_category_with_features(1, 'CAT_UPPERARM', [
        rula_selected.CAT_UPPERARM.feature_id!,
        ...rula_selected.CAT_UPPERARM.optional_feature_ids,
      ]),
      create_label_category(2, 'CAT_LOWERARM', rula_selected.CAT_LOWERARM!),
      create_label_category_with_features(3, 'CAT_WRIST', [
        rula_selected.CAT_WRIST.feature_id!,
        ...rula_selected.CAT_WRIST.optional_feature_ids,
      ]),
      create_label_category_with_features(4, 'CAT_NECK', [
        rula_selected.CAT_NECK.feature_id!,
        ...rula_selected.CAT_NECK.optional_feature_ids,
      ]),
      create_label_category_with_features(5, 'CAT_TRUNK', [
        rula_selected.CAT_TRUNK.feature_id!,
        ...rula_selected.CAT_TRUNK.optional_feature_ids,
      ]),
      create_label_category(6, 'CAT_LEGS', rula_selected.CAT_LEGS!),
    ];
    const label: ErgoLabel = {
      id: uid(),
      start_frame: Math.min(...effectiveRange),
      end_frame: Math.max(...effectiveRange),
      ergo_method: 'RULA',
      categories,
    };
    add_label(label);
    set_range(null);
    set_rula_selected(create_empty_rula_selection());
  };

  useEffect(() => {
    if (!rula_save_requested) return;
    set_rula_save_requested(false);
    on_rula_save_label();
  }, [rula_save_requested, set_rula_save_requested, on_rula_save_label]);

  // saves category and feature selections to the container state, which is used to construct a label when the user clicks "Save"
  const on_owas_select = (cat: OwasCategory, featureId: number) => {
    set_owas_selected({ ...owas_selected, [cat]: featureId });
  };

  const on_owas_save_label = () => {
    if (!all_owas_selected) return;
    if (!can_save_owas_label) return;
    const categories: LabelCategory[] = [
      create_label_category(1, 'CAT_BACK', owas_selected.CAT_BACK!),
      create_label_category(2, 'CAT_ARMS', owas_selected.CAT_ARMS!),
      create_label_category(3, 'CAT_LEGS', owas_selected.CAT_LEGS!),
    ];

    const label: ErgoLabel = {
      id: uid(),
      start_frame: Math.min(...effectiveRange),
      end_frame: Math.max(...effectiveRange),
      ergo_method: 'OWAS',
      categories,
    };
    add_label(label);
    set_range(null);
    set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null });
  };

  useEffect(() => {
    if (!owas_save_requested) return;
    set_owas_save_requested(false);
    on_owas_save_label();
  }, [owas_save_requested, set_owas_save_requested, on_owas_save_label]);

  return (
    <PresenterLabelButtons
      on_rula_select={on_rula_select}
      on_rula_save_label={on_rula_save_label}
      rula_selected={rula_selected}
      all_rula_selected={all_rula_selected}
      can_save_rula={can_save_rula_label}
      on_owas_select={on_owas_select}
      on_owas_save_label={on_owas_save_label}
      all_owas_selected={all_owas_selected}
      can_save_owas_label={can_save_owas_label}
      display_rula_selection={display_rula_selection}
      display_owas_selection={display_owas_selection}
      active_label_method={frame_label?.ergo_method === 'RULA' || frame_label?.ergo_method === 'OWAS' ? frame_label.ergo_method : null}
    />
  );
}
