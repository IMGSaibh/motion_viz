import { useCallback } from 'react';
import {
  create_empty_rula_selection,
  create_label_category,
  create_label_category_with_features,
  uid,
} from '@/domain/label_logic';
import { use_add_slider_label_ctx } from '@/context/context_slider_label_list';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import type { ErgoLabel, RulaCategory, LabelCategory, OwasCategory } from '@/domain/datatypes';
import { use_can_save_label_cxt } from '@/context/context_slider_label_list';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
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
  const effectiveRange = range ?? [frame_slider_value, frame_slider_value];
  const can_save_label = use_can_save_label_cxt();
  const { owas_selected, set_owas_selected } = use_ergo_methods_cxt();
  const can_save_rula_label = can_save_label('RULA', effectiveRange);
  const { rula_selected, set_rula_selected } = use_ergo_methods_cxt();

  const can_save_owas_label = can_save_label('OWAS', effectiveRange);
  const all_owas_selected = Object.values(owas_selected).every(Boolean);

  const on_rula_select = (cat: RulaCategory, featureId: number, isOptional: boolean) => {
    if (cat === 'CAT_UPPERARM' && isOptional) {
      const isSelected = rula_selected.CAT_UPPERARM.optional_feature_ids.includes(featureId);
      set_rula_selected({
        ...rula_selected,
        CAT_UPPERARM: {
          ...rula_selected.CAT_UPPERARM,
          optional_feature_ids: isSelected
            ? rula_selected.CAT_UPPERARM.optional_feature_ids.filter((id: number) => id !== featureId)
            : [...rula_selected.CAT_UPPERARM.optional_feature_ids, featureId],
        },
      });
      return;
    }
    if (cat === 'CAT_UPPERARM') {
      set_rula_selected({
        ...rula_selected,
        CAT_UPPERARM: { ...rula_selected.CAT_UPPERARM, feature_id: featureId },
      });
      return;
    }
    if (cat === 'CAT_WRIST') {
      const optionals = rula_selected.CAT_WRIST.optional_feature_ids;
      set_rula_selected({
        ...rula_selected,
        CAT_WRIST: isOptional
          ? {
              ...rula_selected.CAT_WRIST,
              optional_feature_ids: optionals.includes(featureId)
                ? optionals.filter((id: number) => id !== featureId)
                : [...optionals, featureId],
            }
          : { ...rula_selected.CAT_WRIST, feature_id: featureId },
      });
      return;
    }
    if (cat === 'CAT_NECK' || cat === 'CAT_TRUNK') {
      const selection = rula_selected[cat];
      set_rula_selected({
        ...rula_selected,
        [cat]: isOptional
          ? {
              ...selection,
              optional_feature_ids: selection.optional_feature_ids.includes(featureId)
                ? selection.optional_feature_ids.filter((id: number) => id !== featureId)
                : [...selection.optional_feature_ids, featureId],
            }
          : { ...selection, feature_id: featureId },
      });
      return;
    }
    set_rula_selected({ ...rula_selected, [cat]: featureId });
  };

  const on_rula_save_label = () => {
    const allSelected =
      rula_selected.CAT_UPPERARM.feature_id !== null &&
      rula_selected.CAT_LOWERARM !== null &&
      rula_selected.CAT_WRIST.feature_id !== null &&
      rula_selected.CAT_NECK.feature_id !== null &&
      rula_selected.CAT_TRUNK.feature_id !== null &&
      rula_selected.CAT_LEGS !== null;
    if (!allSelected || !can_save_rula_label) return;

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
      create_label_category(4, 'CAT_LOAD', owas_selected.CAT_LOAD!),
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
    set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null, CAT_LOAD: null });
  };

  return (
    <PresenterLabelButtons
      on_rula_select={on_rula_select}
      on_rula_save_label={on_rula_save_label}
      all_rula_selected={rula_selected}
      can_save_rula={can_save_rula_label}
      on_owas_select={on_owas_select}
      on_owas_save_label={on_owas_save_label}
      all_owas_selected={all_owas_selected}
      can_save_owas_label={can_save_owas_label}
    />
  );
}
