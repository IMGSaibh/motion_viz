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
  RulaFeatureMode,
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
  const { rula_hotkey_state, set_rula_hotkey_state, hotkey_profile, set_hotkey_profile } = use_rula_hotkey_context();
  const {
    frame_count,
    go_to_frame,
    pause,
    play_pause,
    print_scene_components,
    reset_engine,
    set_selected_motion,
    stop,
  } = use_three_js_engine_ctx();

  useEffect(() => {
    function handle_key_down(event: KeyboardEvent): void {
      if (
        event.code === 'Tab' &&
        (hotkey_profile === HotkeyProfile.PLAY_PROFILE || rula_hotkey_state.context === RulaHotkeyContext.ROOT)
      ) {
        event.preventDefault();
        set_hotkey_profile(toggle_hotkey_profile(hotkey_profile));
        return;
      }

      if (event.code === 'Escape') {
        event.preventDefault();

        if (hotkey_profile === HotkeyProfile.RULA_PROFILE && rula_hotkey_state.context !== RulaHotkeyContext.ROOT) {
          const active_category = rula_hotkey_state.context;
          switch (active_category) {
            case 'CAT_UPPERARM':
              set_rula_selected({ ...rula_selected, CAT_UPPERARM: { feature_id: null, optional_feature_ids: [] } });
              break;
            case 'CAT_LOWERARM':
              set_rula_selected({ ...rula_selected, CAT_LOWERARM: null });
              break;
            case 'CAT_WRIST':
              set_rula_selected({ ...rula_selected, CAT_WRIST: { feature_id: null, optional_feature_ids: [] } });
              break;
            case 'CAT_NECK':
              set_rula_selected({ ...rula_selected, CAT_NECK: { feature_id: null, optional_feature_ids: [] } });
              break;
            case 'CAT_TRUNK':
              set_rula_selected({ ...rula_selected, CAT_TRUNK: { feature_id: null, optional_feature_ids: [] } });
              break;
            case 'CAT_LEGS':
              set_rula_selected({ ...rula_selected, CAT_LEGS: null });
              break;
          }
        }
      }

      if (event.code === 'Space') {
        event.preventDefault();
        play_pause();
        return;
      }

      if (hotkey_profile === HotkeyProfile.RULA_PROFILE && range && frame_count) {
        const last_frame = Math.max(0, frame_count - 1);

        if (event.code === 'ArrowLeft') {
          event.preventDefault();
          const next_frame = event.ctrlKey ? Math.max(range[0], range[1] - 1) : Math.max(0, range[0] - 1);
          const next_range = event.ctrlKey ? [range[0], next_frame] : [next_frame, range[1]];
          set_range(next_range as [number, number]);
          pause();
          set_frame_slider_value(next_frame);
          go_to_frame(next_frame);
          return;
        }

        if (event.code === 'ArrowRight') {
          event.preventDefault();
          const next_frame = event.ctrlKey ? Math.min(range[1], range[0] + 1) : Math.min(last_frame, range[1] + 1);
          const next_range = event.ctrlKey ? [next_frame, range[1]] : [range[0], next_frame];
          set_range(next_range as [number, number]);
          pause();
          set_frame_slider_value(next_frame);
          go_to_frame(next_frame);
          return;
        }
      }

      if (hotkey_profile === HotkeyProfile.RULA_PROFILE) {
        const rula_command = resolve_rula_hotkey_command(rula_hotkey_state, event.code);
        if (rula_command) {
          event.preventDefault();

          if (
            rula_command.type === RulaHotkeyCommandType.COMMIT_CATEGORY &&
            rula_hotkey_state.context !== RulaHotkeyContext.ROOT &&
            (() => {
              const committed_selection = commit_rula_category(rula_hotkey_state.context);
              if (!committed_selection) return true;

              if (
                rula_command.next_context === RulaHotkeyContext.ROOT &&
                is_complete_rula_selection(committed_selection) &&
                can_save_label('RULA', range ?? [frame_slider_value, frame_slider_value])
              ) {
                commit_rula_label(committed_selection);
              }
              return false;
            })()
          ) {
            return;
          }

          if (
            rula_command.type === RulaHotkeyCommandType.BACK &&
            rula_hotkey_state.context !== RulaHotkeyContext.ROOT &&
            rula_hotkey_state.feature_mode === RulaFeatureMode.OPTIONAL
          ) {
            switch (rula_hotkey_state.context) {
              case 'CAT_UPPERARM':
                set_rula_selected({ ...rula_selected, CAT_UPPERARM: { feature_id: null, optional_feature_ids: [] } });
                break;
              case 'CAT_LOWERARM':
                set_rula_selected({ ...rula_selected, CAT_LOWERARM: null });
                break;
              case 'CAT_WRIST':
                set_rula_selected({ ...rula_selected, CAT_WRIST: { feature_id: null, optional_feature_ids: [] } });
                break;
              case 'CAT_NECK':
                set_rula_selected({ ...rula_selected, CAT_NECK: { feature_id: null, optional_feature_ids: [] } });
                break;
              case 'CAT_TRUNK':
                set_rula_selected({ ...rula_selected, CAT_TRUNK: { feature_id: null, optional_feature_ids: [] } });
                break;
              case 'CAT_LEGS':
                set_rula_selected({ ...rula_selected, CAT_LEGS: null });
                break;
            }
          }

          if (rula_command.type === RulaHotkeyCommandType.COMMIT_LABEL && !commit_rula_label()) {
            return;
          }

          set_rula_hotkey_state((state) => transition_rula_hotkey_state(state, rula_command));
          return;
        }

        return;
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
        set_selected_motion(null);
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

      if (event.code === 'KeyP') {
        event.preventDefault();
        set_is_review_rending_active((is_active) => !is_active);
      }
    }

    function commit_rula_category(
      category: Exclude<typeof rula_hotkey_state.context, RulaHotkeyContext.ROOT>,
    ): RulaSelection | null {
      const primary =
        rula_hotkey_state.pending_primary_index === null ? null : rula_hotkey_state.pending_primary_index + 1;
      const optionals = rula_hotkey_state.pending_optional_indices.map((index) => index + 1);
      if (!primary) return null;

      const next_selection: RulaSelection = (() => {
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
      })();
      set_rula_selected(next_selection);
      return next_selection;
    }

    function is_complete_rula_selection(selection: RulaSelection): boolean {
      return Boolean(
        selection.CAT_UPPERARM.feature_id &&
        selection.CAT_LOWERARM &&
        selection.CAT_WRIST.feature_id &&
        selection.CAT_NECK.feature_id &&
        selection.CAT_TRUNK.feature_id &&
        selection.CAT_LEGS,
      );
    }

    function commit_rula_label(selection = rula_selected): boolean {
      const effective_range = range ?? [frame_slider_value, frame_slider_value];
      if (!can_save_label('RULA', effective_range)) return false;
      if (!is_complete_rula_selection(selection)) return false;

      const selected_feature_ids = (selection: typeof rula_selected.CAT_UPPERARM): number[] => [
        selection.feature_id!,
        ...selection.optional_feature_ids,
      ];
      const categories: LabelCategory[] = [
        create_label_category_with_features(1, 'CAT_UPPERARM', selected_feature_ids(selection.CAT_UPPERARM)),
        create_label_category(2, 'CAT_LOWERARM', selection.CAT_LOWERARM!),
        create_label_category_with_features(3, 'CAT_WRIST', selected_feature_ids(selection.CAT_WRIST)),
        create_label_category_with_features(4, 'CAT_NECK', selected_feature_ids(selection.CAT_NECK)),
        create_label_category_with_features(5, 'CAT_TRUNK', selected_feature_ids(selection.CAT_TRUNK)),
        create_label_category(6, 'CAT_LEGS', selection.CAT_LEGS!),
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
    hotkey_profile,
    rula_hotkey_state,
    rula_selected,
    reset_engine,
    set_selected_motion,
    set_frame_slider_value,
    set_is_review_rending_active,
    set_owas_selected,
    set_range,
    set_rula_selected,
    set_rula_hotkey_state,
    set_hotkey_profile,
    stop,
  ]);

  return null;
}
