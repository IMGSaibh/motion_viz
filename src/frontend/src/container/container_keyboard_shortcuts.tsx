import { useEffect } from 'react';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import { use_clear_label_list_ctx } from '@/context/context_slider_label_list';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { create_empty_rula_selection } from '@/domain/label_logic';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import { HotkeyProfile, toggle_hotkey_profile } from '@/domain/hotkey_profile';

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
  const { hotkey_profile, set_hotkey_profile } = use_rula_hotkey_context();
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
      if (event.code === 'Tab') {
        event.preventDefault();
        set_hotkey_profile(toggle_hotkey_profile(hotkey_profile));
        return;
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

    window.addEventListener('keydown', handle_key_down);
    return () => window.removeEventListener('keydown', handle_key_down);
  }, [
    clear_slider_label_list,
    frame_count,
    frame_slider_value,
    go_to_frame,
    pause,
    play_pause,
    print_scene_components,
    range,
    hotkey_profile,
    rula_selected,
    reset_engine,
    set_selected_motion,
    set_frame_slider_value,
    set_is_review_rending_active,
    set_owas_selected,
    set_range,
    set_rula_selected,
    set_hotkey_profile,
    stop,
  ]);

  return null;
}
