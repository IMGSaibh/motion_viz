import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import { HotkeyProfile } from '@/domain/hotkey_profile';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import { PresenterFrameSlider } from '@/components/presenter/presenter_frame_slider';
import { use_frame_slider_context } from '@/context/context_frame_slider';

/**
 * Connects frame-slider presentation to shared slider state and the Three.js engine.
 *
 * This container owns pointer-event orchestration, scrubbing, and
 * asynchronous thumbnail coordination. It converts those interactions into context and
 * engine commands, then passes render-ready props to `PresenterFrameSlider`. Keep visual
 * styling in presenters/widgets and low-level playback behavior in the motion players.
 */
export function ContainerFrameSlider() {
  // The container translates browser input into engine commands and serializable UI state.
  const frame_slider_track_reference = useRef<HTMLDivElement | null>(null);
  const frame_slider_track_scrubbing_reference = useRef(false);
  const frame_slider_drag_start_reference = useRef<number | null>(null);
  const [frame_slider_track_hovered_frame, set_frame_slider_track_hovered_frame] = useState<number | null>(null);

  const { frame_slider_value, is_review_rending_active, range, set_frame_slider_value, set_range } =
    use_frame_slider_context();
  const { hotkey_profile } = use_rula_hotkey_context();

  const preview_render_img_ref = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  const { frame_count, current_frame, go_to_frame, pause, play_pause, get_thumbnail_for_frame, is_playing } =
    use_three_js_engine_ctx();

  const on_click_play_toggle = useCallback(() => {
    play_pause();
  }, [play_pause]);

  useEffect(() => {
    if (!frame_count) return;

    // Playback may advance the playhead, but it must not override an active user scrub.
    if (frame_slider_track_scrubbing_reference.current) return;

    if (!is_playing && current_frame !== 0) return;

    set_frame_slider_value(current_frame);
  }, [current_frame, frame_count, is_playing, set_frame_slider_value]);

  // we need this for now! otherwise the preview image will stay on the screen
  //  when the user is not hovering over the slider track
  useEffect(() => {
    if (is_review_rending_active) return;

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    seqRef.current++;

    if (preview_render_img_ref.current) {
      preview_render_img_ref.current.style.display = 'none';
      preview_render_img_ref.current.removeAttribute('src');
    }
  }, [is_review_rending_active]);

  const compute_slider_track_frame = useCallback(
    (clientX: number) => {
      const rect = frame_slider_track_reference.current?.getBoundingClientRect();
      if (!rect || !frame_count) return 0;
      const x = clientX - rect.left;
      const width = rect.width || 1;
      const ratio = Math.min(1, Math.max(0, x / width));
      return Math.round(ratio * Math.max(0, frame_count));
    },
    [frame_count],
  );

  const update_slider_track_frame_tick = useCallback(
    (frameIdx: number) => {
      const maxIdx = Math.max(0, (frame_count ?? 0) - 1);
      const clamped_frame = Math.max(0, Math.min(frameIdx, maxIdx));
      set_frame_slider_value(clamped_frame);
      pause();
      go_to_frame(clamped_frame);
    },
    [frame_count, pause, go_to_frame, set_frame_slider_value],
  );

  const on_mouse_down_slider_track = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!frame_count) return;
      frame_slider_track_scrubbing_reference.current = true;
      const frame = compute_slider_track_frame(e.clientX);
      set_range(null);
      frame_slider_drag_start_reference.current =
        e.button === 0 && hotkey_profile === HotkeyProfile.RULA_PROFILE ? frame : null;
      update_slider_track_frame_tick(frame);
    },
    [frame_count, compute_slider_track_frame, hotkey_profile, update_slider_track_frame_tick],
  );

  const on_mouse_move_slider_track = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!frame_count) return;
      const frame_idx = compute_slider_track_frame(e.clientX);
      set_frame_slider_track_hovered_frame(frame_idx);
      if (frame_slider_track_scrubbing_reference.current) {
        update_slider_track_frame_tick(frame_idx);
        const drag_start_frame = frame_slider_drag_start_reference.current;
        if (
          hotkey_profile === HotkeyProfile.RULA_PROFILE &&
          (e.buttons & 1) !== 0 &&
          drag_start_frame !== null &&
          frame_idx !== drag_start_frame
        ) {
          set_range([Math.min(drag_start_frame, frame_idx), Math.max(drag_start_frame, frame_idx)]);
        }
      }

      if (!is_review_rending_active) return;

      const rect = frame_slider_track_reference.current?.getBoundingClientRect();
      if (!rect || !frame_count) return;

      const x = e.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const idx = Math.round(ratio * Math.max(0, frame_count - 1));

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const mySeq = ++seqRef.current;

      rafRef.current = requestAnimationFrame(() => {
        const css_left = ratio * rect.width + 50;
        if (preview_render_img_ref.current) {
          preview_render_img_ref.current.style.display = 'block';
          preview_render_img_ref.current.style.left = `${css_left}px`;
        }

        get_thumbnail_for_frame(idx).then((data_url) => {
          // Ignore thumbnails that completed after a newer hover request.
          if (seqRef.current !== mySeq) return;
          if (preview_render_img_ref.current && data_url) {
            preview_render_img_ref.current.src = data_url;
          }
        });
      });
    },
    [
      frame_count,
      compute_slider_track_frame,
      update_slider_track_frame_tick,
      hotkey_profile,
      set_range,
      get_thumbnail_for_frame,
      is_review_rending_active,
    ],
  );

  const on_mouse_up_slider_track = useCallback(() => {
    frame_slider_track_scrubbing_reference.current = false;
    frame_slider_drag_start_reference.current = null;
  }, []);

  const on_mouse_leave_slider_track = useCallback(() => {
    frame_slider_track_scrubbing_reference.current = false;
    frame_slider_drag_start_reference.current = null;
    set_frame_slider_track_hovered_frame(null);
    if (preview_render_img_ref.current) {
      preview_render_img_ref.current.style.display = 'none';
      preview_render_img_ref.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  const frame_slider_track_props = useMemo(
    () => ({
      frame_slider_value,
      frame_count: frame_count ?? 0,
      frame_slider_range: range as [number, number],
      hover_frame: frame_slider_track_hovered_frame,
      slider_track_ref: frame_slider_track_reference,
      on_mouse_down_slider_track: on_mouse_down_slider_track,
      on_mouse_move_slider_track: on_mouse_move_slider_track,
      on_mouse_up_slider_track: on_mouse_up_slider_track,
      on_mouse_leave_slider_track: on_mouse_leave_slider_track,
      is_playing,
      on_click_play_toggle,
    }),
    [
      frame_slider_value,
      frame_count,
      range,
      frame_slider_track_hovered_frame,
      on_mouse_down_slider_track,
      on_mouse_move_slider_track,
      on_mouse_up_slider_track,
      on_mouse_leave_slider_track,
      is_playing,
      on_click_play_toggle,
    ],
  );

  return (
    <>
      {frame_count && (
        <>
          <PresenterFrameSlider {...frame_slider_track_props} />
          <img
            ref={preview_render_img_ref}
            alt=""
            style={{
              position: 'absolute',
              display: 'none',
              top: -230,
              left: 0,
              zIndex: 1,
              border: '1px solid #000',
              pointerEvents: 'none',
            }}
          />
        </>
      )}
    </>
  );
}
