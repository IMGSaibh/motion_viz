import { useEffect, useRef } from 'react';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import {
  use_clear_label_list_ctx,
  use_get_labels_cxt,
  use_is_editing_label_cxt,
  use_start_edit_label_cxt,
} from '@/context/context_slider_label_list';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import {
  create_empty_rula_selection,
  get_owas_selection_from_label,
  get_rula_selection_from_label,
} from '@/domain/label_logic';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { HotkeyProfile, toggle_hotkey_profile } from '@/domain/hotkey_profile';
import {
  apply_rula_hotkey_command,
  INITIAL_RULA_HOTKEY_STATE,
  resolve_rula_hotkey,
} from '@/domain/rula_hotkey_commands';
import {
  apply_owas_hotkey_command,
  INITIAL_OWAS_HOTKEY_STATE,
  resolve_owas_hotkey,
} from '@/domain/owas_hotkey_commands';

/**
 * Orchestrates application-wide keyboard commands between shared contexts and the Three.js engine.
 *
 * This container owns keyboard event registration, hotkey profile routing, playback commands,
 * and label workflow actions. Keep key mapping and side effects here; presentation remains in
 * the UI containers and widgets, while RULA command transitions remain in the domain layer.
 */
export function ContainerKeyboardShortcuts(): null {
  const arrow_hold_started_at = useRef<{ ArrowLeft?: number; ArrowRight?: number }>({});
  const { frame_slider_value, range, set_frame_slider_value, set_range, set_is_review_rending_active } =
    use_frame_slider_context();
  const { owas_selected, rula_selected, set_owas_selected, set_rula_selected } = use_ergo_methods_cxt();
  const clear_slider_label_list = use_clear_label_list_ctx();
  const ergo_labels = use_get_labels_cxt();
  const is_editing_label = use_is_editing_label_cxt();
  const start_edit_label = use_start_edit_label_cxt();
  const { warning } = use_snackbar_ctx();
  const {
    hotkey_profile,
    set_hotkey_profile,
    rula_hotkey_state,
    set_rula_hotkey_state,
    set_rula_save_requested,
    owas_hotkey_state,
    set_owas_hotkey_state,
    set_owas_save_requested,
  } = use_rula_hotkey_context();
  const {
    frame_count,
    go_to_frame,
    pause,
    play_pause,
    print_scene_components,
    reset_engine,
    selected_motion,
    set_selected_motion,
    stop,
  } = use_three_js_engine_ctx();

  useEffect(() => {
    function handle_key_down(event: KeyboardEvent): void {
      if (
        !event.ctrlKey &&
        !event.altKey &&
        !event.shiftKey &&
        (event.code === 'ArrowLeft' || event.code === 'ArrowRight')
      ) {
        arrow_hold_started_at.current[event.code] ??= event.timeStamp;
      }

      if (event.code === 'Tab') {
        event.preventDefault();
        set_hotkey_profile(toggle_hotkey_profile(hotkey_profile));
        set_rula_hotkey_state(INITIAL_RULA_HOTKEY_STATE);
        set_owas_hotkey_state(INITIAL_OWAS_HOTKEY_STATE);
        return;
      }

      if (event.code === 'Space') {
        event.preventDefault();
        play_pause();
        return;
      }

      if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.code === 'KeyC') {
        event.preventDefault();
        set_range(null);
        return;
      }

      if (event.altKey && (event.code === 'ArrowRight' || event.code === 'ArrowLeft')) {
        event.preventDefault();
        if (!frame_count || ergo_labels.length === 0) return;

        const target_label = ergo_labels
          .filter((label) =>
            event.code === 'ArrowRight'
              ? label.start_frame > frame_slider_value
              : label.end_frame < frame_slider_value,
          )
          .sort((left, right) =>
            event.code === 'ArrowRight'
              ? left.start_frame - right.start_frame
              : right.end_frame - left.end_frame,
          )[0];

        if (!target_label) return;
        const target_frame = Math.max(
          0,
          Math.min(frame_count - 1, event.code === 'ArrowRight' ? target_label.start_frame : target_label.end_frame),
        );
        pause();
        set_frame_slider_value(target_frame);
        go_to_frame(target_frame);
        return;
      }

      if (hotkey_profile === HotkeyProfile.RULA_PROFILE) {
        const result = resolve_rula_hotkey(rula_hotkey_state, {
          key: event.key,
          code: event.code,
        });
        if (result.command && result.command.type !== 'reset' && !selected_motion) {
          event.preventDefault();
          warning('Load motion file for labeling');
          return;
        }
        if (result.command?.type === 'save') {
          event.preventDefault();
          set_rula_save_requested(true);
          set_rula_hotkey_state(INITIAL_RULA_HOTKEY_STATE);
          return;
        }
        if (result.command?.type === 'select-primary' || result.command?.type === 'toggle-optional') {
          event.preventDefault();
          const frame_label =
            range === null && !is_editing_label
              ? ergo_labels.find(
                  (label) =>
                    label.ergo_method === 'RULA' &&
                    frame_slider_value >= label.start_frame &&
                    frame_slider_value <= label.end_frame,
                )
              : undefined;
          if (frame_label?.id) start_edit_label(frame_label.id);
          const selection = frame_label ? get_rula_selection_from_label(frame_label) : rula_selected;
          set_rula_selected(apply_rula_hotkey_command(selection, result.command));
          set_rula_hotkey_state(result.state);
          return;
        }
        if (result.command?.type === 'select-category' || result.command?.type === 'reset') {
          event.preventDefault();
          set_rula_hotkey_state(result.state);
          return;
        }
      }

      if (hotkey_profile === HotkeyProfile.OWAS_PROFILE) {
        const result = resolve_owas_hotkey(owas_hotkey_state, {
          key: event.key,
          code: event.code,
        });
        if (result.command && result.command.type !== 'reset' && !selected_motion) {
          event.preventDefault();
          warning('Load motion file for labeling');
          return;
        }
        if (result.command?.type === 'save') {
          event.preventDefault();
          set_owas_save_requested(true);
          set_owas_hotkey_state(INITIAL_OWAS_HOTKEY_STATE);
          return;
        }
        if (result.command?.type === 'select-feature') {
          event.preventDefault();
          const frame_label =
            range === null && !is_editing_label
              ? ergo_labels.find(
                  (label) =>
                    label.ergo_method === 'OWAS' &&
                    frame_slider_value >= label.start_frame &&
                    frame_slider_value <= label.end_frame,
                )
              : undefined;
          if (frame_label?.id) start_edit_label(frame_label.id);
          const selection = frame_label ? get_owas_selection_from_label(frame_label) : owas_selected;
          set_owas_selected(apply_owas_hotkey_command(selection, result.command));
          set_owas_hotkey_state(result.state);
          return;
        }
        if (result.command?.type === 'select-category' || result.command?.type === 'reset') {
          event.preventDefault();
          set_owas_hotkey_state(result.state);
          return;
        }
      }

      if (
        (hotkey_profile === HotkeyProfile.RULA_PROFILE || hotkey_profile === HotkeyProfile.OWAS_PROFILE) &&
        frame_count
      ) {
        const last_frame = Math.max(0, frame_count - 1);

        if (event.shiftKey && (event.code === 'ArrowLeft' || event.code === 'ArrowRight')) {
          event.preventDefault();
          const direction = event.code === 'ArrowRight' ? 1 : -1;
          const adjust_start = event.ctrlKey;

          if (!range) {
            const next_frame = Math.max(0, Math.min(last_frame, frame_slider_value + direction * 10));
            if (next_frame === frame_slider_value) return;
            set_range([
              Math.min(frame_slider_value, next_frame),
              Math.max(frame_slider_value, next_frame),
            ]);
            pause();
            set_frame_slider_value(next_frame);
            go_to_frame(next_frame);
            return;
          }

          const next_range = [...range] as [number, number];
          const edge_index = adjust_start ? 0 : 1;
          const minimum = adjust_start ? 0 : range[0];
          const maximum = adjust_start ? range[1] : last_frame;
          const next_frame = Math.max(minimum, Math.min(maximum, range[edge_index] + direction * 10));
          if (next_frame === range[edge_index]) return;
          next_range[edge_index] = next_frame;
          set_range(next_range);
          pause();
          set_frame_slider_value(next_frame);
          go_to_frame(next_frame);
          return;
        }

        if (event.ctrlKey && (event.code === 'ArrowLeft' || event.code === 'ArrowRight')) {
          event.preventDefault();
          const direction = event.code === 'ArrowRight' ? 1 : -1;
          const anchor_frame = range
            ? direction > 0
              ? range[1]
              : range[0]
            : frame_slider_value;
          const next_frame = Math.max(0, Math.min(last_frame, anchor_frame + direction * 10));
          if (next_frame === anchor_frame) return;
          set_range(
            direction > 0
              ? [range?.[0] ?? anchor_frame, next_frame]
              : [next_frame, range?.[1] ?? anchor_frame],
          );
          pause();
          set_frame_slider_value(next_frame);
          go_to_frame(next_frame);
          return;
        }

      }

      if (event.code === 'KeyS') {
        event.preventDefault();
        stop();
        go_to_frame(0);
        set_frame_slider_value(0);
      }

      if (event.code === 'KeyB') {
        if (!frame_count) return;
        event.preventDefault();
        const random_frame = Math.floor(Math.random() * frame_count);
        pause();
        set_frame_slider_value(random_frame);
        go_to_frame(random_frame);
      }

      if (event.code === 'KeyR') {
        event.preventDefault();
        reset_engine();
        set_selected_motion(null);
        set_frame_slider_value(0);
        set_range(null);
        clear_slider_label_list();
        set_rula_hotkey_state(INITIAL_RULA_HOTKEY_STATE);
        set_owas_hotkey_state(INITIAL_OWAS_HOTKEY_STATE);
        set_rula_selected(create_empty_rula_selection());
        set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null });
      }

      if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.code === 'ArrowRight') {
        event.preventDefault();
        if (!frame_count) return;
        const hold_started_at = arrow_hold_started_at.current.ArrowRight ?? event.timeStamp;
        const step = event.timeStamp - hold_started_at >= 1000 ? 10 : 1;
        const next_frame = Math.min(Math.max(0, frame_count - 1), frame_slider_value + step);
        pause();
        set_frame_slider_value(next_frame);
        go_to_frame(next_frame);
        return;
      }

      if (!event.ctrlKey && !event.altKey && !event.shiftKey && event.code === 'ArrowLeft') {
        event.preventDefault();
        if (!frame_count) return;
        const hold_started_at = arrow_hold_started_at.current.ArrowLeft ?? event.timeStamp;
        const step = event.timeStamp - hold_started_at >= 1000 ? 10 : 1;
        const previous_frame = Math.max(0, frame_slider_value - step);
        pause();
        set_frame_slider_value(previous_frame);
        go_to_frame(previous_frame);
        return;
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

    function handle_key_up(event: KeyboardEvent): void {
      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        delete arrow_hold_started_at.current[event.code];
      }
    }

    function handle_window_blur(): void {
      arrow_hold_started_at.current = {};
    }

    window.addEventListener('keydown', handle_key_down);
    window.addEventListener('keyup', handle_key_up);
    window.addEventListener('blur', handle_window_blur);
    return () => {
      window.removeEventListener('keydown', handle_key_down);
      window.removeEventListener('keyup', handle_key_up);
      window.removeEventListener('blur', handle_window_blur);
    };
  }, [
    clear_slider_label_list,
    ergo_labels,
    is_editing_label,
    frame_count,
    frame_slider_value,
    go_to_frame,
    pause,
    play_pause,
    print_scene_components,
    range,
    hotkey_profile,
    rula_selected,
    owas_selected,
    reset_engine,
    set_selected_motion,
    set_frame_slider_value,
    set_is_review_rending_active,
    set_owas_selected,
    start_edit_label,
    set_range,
    set_rula_selected,
    rula_hotkey_state,
    set_rula_hotkey_state,
    owas_hotkey_state,
    set_owas_hotkey_state,
    set_rula_save_requested,
    set_owas_save_requested,
    set_hotkey_profile,
    stop,
    selected_motion,
    warning,
  ]);

  return null;
}
