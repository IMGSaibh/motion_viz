import { useEffect } from 'react';
import { use_ergo_methods_cxt } from '@/context/contex_ergo_methods';
import { use_frame_slider_context } from '@/context/context_frame_slider';
import { use_clear_label_list_ctx } from '@/context/context_slider_label_list';
import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { create_empty_rula_selection } from '@/domain/label_logic';

/** Coordinates application-wide keyboard input with shared state and the Three.js engine. */
export function ContainerKeyboardShortcuts(): null {
  const { frame_slider_value, range, set_frame_slider_value, set_range } = use_frame_slider_context();
  const { set_owas_selected, set_rula_selected } = use_ergo_methods_cxt();
  const clear_slider_label_list = use_clear_label_list_ctx();
  const { frame_count, go_to_frame, pause, play_pause, print_scene_components, reset_engine, stop } =
    use_three_js_engine_ctx();

  useEffect(() => {
    function handle_key_down(event: KeyboardEvent): void {
      if (event.code === 'Space') {
        play_pause();
      }

      if (event.code === 'KeyS') {
        stop();
        go_to_frame(0);
        set_frame_slider_value(0);
      }

      if (event.code === 'KeyR') {
        reset_engine();
        set_frame_slider_value(0);
        set_range(null);
        clear_slider_label_list();
        set_rula_selected(create_empty_rula_selection());
        set_owas_selected({ CAT_BACK: null, CAT_ARMS: null, CAT_LEGS: null, CAT_LOAD: null });
      }

      if (event.code === 'ArrowRight') {
        event.preventDefault();
        if (!frame_count) return;
        const next_frame = Math.min(Math.max(0, frame_count - 1), frame_slider_value + 1);
        pause();
        set_frame_slider_value(next_frame);
        go_to_frame(next_frame);
      }

      if (event.code === 'ArrowLeft') {
        event.preventDefault();
        if (!frame_count) return;
        const previous_frame = Math.max(0, frame_slider_value - 1);
        pause();
        set_frame_slider_value(previous_frame);
        go_to_frame(previous_frame);
      }

      if (event.code === 'KeyD') {
        print_scene_components();
      }

      if (event.code === 'Escape') {
        set_range(null);
      }

      if (event.code === 'KeyA' || (event.code === 'Digit1' && event.location === 0)) {
        if (event.code === 'KeyA') event.preventDefault();
        set_range([frame_slider_value, range?.[1] ?? frame_slider_value]);
      }

      if (event.code === 'KeyE' || (event.code === 'Digit2' && event.location === 0)) {
        if (event.code === 'KeyE') event.preventDefault();
        set_range([range?.[0] ?? frame_slider_value, frame_slider_value]);
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
    reset_engine,
    set_frame_slider_value,
    set_owas_selected,
    set_range,
    set_rula_selected,
    stop,
  ]);

  return null;
}
