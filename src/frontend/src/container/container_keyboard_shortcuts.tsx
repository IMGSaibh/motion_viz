import { useEffect } from 'react';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import {
  use_add_slider_label_ctx,
  use_can_save_label_cxt,
  use_clear_label_list_ctx,
} from '@/context/context_slider_label_list';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import {
  create_empty_rula_selection,
  create_label_category,
  create_label_category_with_features,
  uid,
} from '@/domain/label_logic';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import {
  INITIAL_RULA_HOTKEY_STATE,
  RulaHotkeyCommandType,
  RulaHotkeyContext,
  resolve_rula_hotkey_command,
  transition_rula_hotkey_state,
} from '@/domain/rula_hotkey_commands';
import { HotkeyProfile, toggle_hotkey_profile } from '@/domain/hotkey_profile';
import type { LabelCategory, RulaSelection } from '@/domain/datatypes';

/**
 * Orchestrates application-wide keyboard commands between shared contexts and the Three.js engine.
 *
 * This container owns keyboard event registration, hotkey profile routing, playback commands,
 * and label workflow actions. Keep key mapping and side effects here; presentation remains in
 * the UI containers and widgets, while RULA command transitions remain in the domain layer.
 */
export function ContainerKeyboardShortcuts(): null {
  const { frame_slider_value, range, set_frame_slider_value, set_range, set_is_review_rending_active } =
    use_frame_slider_context();
  const { rula_selected, set_owas_selected, set_rula_selected } = use_ergo_methods_cxt();
  const clear_slider_label_list = use_clear_label_list_ctx();
  const add_slider_label = use_add_slider_label_ctx();
  const can_save_label = use_can_save_label_cxt();
  const { rula_hotkey_state, set_rula_hotkey_state, hotkeyMode, set_hotkeyMode } = use_rula_hotkey_context();
  const { frame_count, go_to_frame, pause, play_pause, print_scene_components, reset_engine, stop } =
    use_three_js_engine_ctx();

  useEffect(() => {
    function handle_key_down(event: KeyboardEvent): void {
      if (
        event.code === 'Tab' &&
        (hotkeyMode === HotkeyProfile.PLAY_PROFILE || rula_hotkey_state.context === RulaHotkeyContext.ROOT)
      ) {
        event.preventDefault();
        set_hotkeyMode(toggle_hotkey_profile(hotkeyMode));
        return;
      }

      if (hotkeyMode === HotkeyProfile.RULA_PROFILE) {
        const rula_command = resolve_rula_hotkey_command(rula_hotkey_state, event.code);
        if (rula_command) {
          event.preventDefault();

          if (
            rula_command.type === RulaHotkeyCommandType.COMMIT_CATEGORY &&
            rula_hotkey_state.context !== RulaHotkeyContext.ROOT &&
            !commit_rula_category(rula_hotkey_state.context)
          ) {
            return;
          }

          if (rula_command.type === RulaHotkeyCommandType.COMMIT_LABEL && !commit_rula_label()) {
            return;
          }

          set_rula_hotkey_state((state) => transition_rula_hotkey_state(state, rula_command));
          return;
        }

        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        play_pause();
      }

      if (event.code === 'KeyS') {
        event.preventDefault();
        stop();
        go_to_frame(0);
        set_frame_slider_value(0);
      }

      if (event.code === 'KeyR') {
        event.preventDefault();
        reset_engine();
        set_frame_slider_value(0);
        set_range(null);
        clear_slider_label_list();
        set_rula_hotkey_state(INITIAL_RULA_HOTKEY_STATE);
        set_rula_selected(create_empty_rula_selection());
        set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null, CAT_LOAD: null });
      }

      // TODO: refactor min and max logic. Maybe not needed.
      if (event.code === 'ArrowRight') {
        event.preventDefault();
        if (!frame_count) return;
        const next_frame = Math.min(Math.max(0, frame_count - 1), frame_slider_value + 1);
        pause();
        set_frame_slider_value(next_frame);
        go_to_frame(next_frame);
      }

      // TODO: refactor min and max logic. Maybe not needed.
      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        if (!frame_count) return;
        const previous_frame = Math.max(0, frame_slider_value - 1);
        pause();
        set_frame_slider_value(previous_frame);
        go_to_frame(previous_frame);
      }

      if (event.code === 'KeyD') {
        event.preventDefault();
        print_scene_components();
      }

      if (event.code === 'Escape') {
        event.preventDefault();
        set_range(null);
      }

      if (event.code === 'KeyP') {
        event.preventDefault();
        set_is_review_rending_active((is_active) => !is_active);
      }
    }

    function commit_rula_category(
      category: Exclude<typeof rula_hotkey_state.context, RulaHotkeyContext.ROOT>,
    ): boolean {
      const primary =
        rula_hotkey_state.pending_primary_index === null ? null : rula_hotkey_state.pending_primary_index + 1;
      const optionals = rula_hotkey_state.pending_optional_indices.map((index) => index + 1);
      if (!primary) return false;

      set_rula_selected(
        (() => {
          switch (category) {
            case 'CAT_UPPERARM':
              return { ...rula_selected, CAT_UPPERARM: { feature_id: primary, optional_feature_ids: optionals } };
            case 'CAT_WRIST':
              return { ...rula_selected, CAT_WRIST: { feature_id: primary, optional_feature_ids: optionals } };
            case 'CAT_NECK':
              return { ...rula_selected, CAT_NECK: { feature_id: primary, optional_feature_ids: optionals } };
            case 'CAT_TRUNK':
              return { ...rula_selected, CAT_TRUNK: { feature_id: primary, optional_feature_ids: optionals } };
            case 'CAT_LOWERARM':
              return { ...rula_selected, CAT_LOWERARM: primary };
            case 'CAT_LEGS':
              return { ...rula_selected, CAT_LEGS: primary };
          }
        })() as RulaSelection,
      );
      return true;
    }

    function commit_rula_label(): boolean {
      const effective_range = range ?? [frame_slider_value, frame_slider_value];
      if (!can_save_label('RULA', effective_range)) return false;
      if (
        !rula_selected.CAT_UPPERARM.feature_id ||
        !rula_selected.CAT_LOWERARM ||
        !rula_selected.CAT_WRIST.feature_id ||
        !rula_selected.CAT_NECK.feature_id ||
        !rula_selected.CAT_TRUNK.feature_id ||
        !rula_selected.CAT_LEGS
      )
        return false;

      const selected_feature_ids = (selection: typeof rula_selected.CAT_UPPERARM): number[] => [
        selection.feature_id!,
        ...selection.optional_feature_ids,
      ];
      const categories: LabelCategory[] = [
        create_label_category_with_features(1, 'CAT_UPPERARM', selected_feature_ids(rula_selected.CAT_UPPERARM)),
        create_label_category(2, 'CAT_LOWERARM', rula_selected.CAT_LOWERARM),
        create_label_category_with_features(3, 'CAT_WRIST', selected_feature_ids(rula_selected.CAT_WRIST)),
        create_label_category_with_features(4, 'CAT_NECK', selected_feature_ids(rula_selected.CAT_NECK)),
        create_label_category_with_features(5, 'CAT_TRUNK', selected_feature_ids(rula_selected.CAT_TRUNK)),
        create_label_category(6, 'CAT_LEGS', rula_selected.CAT_LEGS),
      ];
      add_slider_label({
        id: uid(),
        start_frame: Math.min(...effective_range),
        end_frame: Math.max(...effective_range),
        ergo_method: 'RULA',
        categories,
      });
      set_range(null);
      set_rula_selected(create_empty_rula_selection());
      return true;
    }

    window.addEventListener('keydown', handle_key_down);
    return () => window.removeEventListener('keydown', handle_key_down);
  }, [
    clear_slider_label_list,
    add_slider_label,
    can_save_label,
    frame_count,
    frame_slider_value,
    go_to_frame,
    pause,
    play_pause,
    print_scene_components,
    range,
    hotkeyMode,
    rula_hotkey_state,
    rula_selected,
    reset_engine,
    set_frame_slider_value,
    set_is_review_rending_active,
    set_owas_selected,
    set_range,
    set_rula_selected,
    set_rula_hotkey_state,
    set_hotkeyMode,
    stop,
  ]);

  return null;
}
