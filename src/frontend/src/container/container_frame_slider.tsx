import { use_three_js_engine_ctx } from '@/context/context_three_js_engine';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  use_slider_frame_cxt,
  use_set_slider_frame_cxt,
  use_clear_label_list_ctx,
  use_set_range_slider_value_cxt,
  use_unselect_rula_cxt,
  use_unselect_owas_cxt,
  use_range_slider_value_cxt,
} from '@/context/context_slider_label_list';
import { PresenterFrameSlider } from '@/components/presenter/presenter_frame_slider';
import type { Range } from '@/domain/datatypes';

export function ContainerFrameSlider() {
  const frame_slider_track_reference = useRef<HTMLDivElement | null>(null);
  const frame_slider_track_scrubbing_reference = useRef(false);
  const [frame_slider_track_hovered_frame, set_frame_slider_track_hovered_frame] = useState<number | null>(null);
  const frame_slider_range = use_range_slider_value_cxt();

  const slider_frame_ctx = use_slider_frame_cxt();
  const set_slider_frame = use_set_slider_frame_cxt();
  const set_range = use_set_range_slider_value_cxt();
  const unselect_rula = use_unselect_rula_cxt();
  const unselect_owas = use_unselect_owas_cxt();

  const clear_slider_label_list = use_clear_label_list_ctx();

  const preview_render_img_ref = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  const {
    frame_count,
    current_frame,
    go_to_frame,
    stop,
    pause,
    reset_engine,
    play_pause,
    print_scene_components,
    get_thumbnail_for_frame,
    cleanup_player,
    cleanup_loop,
    cleanup_thumbnail_render,
    is_playing,
  } = use_three_js_engine_ctx();

  const on_click_play_toggle = useCallback(() => {
    play_pause();
  }, [play_pause]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        play_pause();
      }

      if (e.code === 'KeyS') {
        stop();
        go_to_frame(0);
        set_slider_frame(0);
      }
      if (e.code === 'KeyR') {
        reset_engine();
        set_slider_frame(0);
        set_range([0, 1]);
        clear_slider_label_list();
        unselect_owas();
        unselect_rula();
      }
      if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (!frame_count) return;
        const maxIdx = Math.max(0, frame_count - 1);
        const nextFrame = Math.min(maxIdx, slider_frame_ctx + 1);
        pause();
        set_slider_frame(nextFrame);
        go_to_frame(nextFrame);
      }

      if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (!frame_count) return;
        const prevFrame = Math.max(0, slider_frame_ctx - 1);
        pause();
        set_slider_frame(prevFrame);
        go_to_frame(prevFrame);
      }
      if (e.code === 'KeyD') print_scene_components();

      if (e.code === 'KeyA') {
        e.preventDefault();
        set_range([slider_frame_ctx, frame_slider_range[1]]);
      }
      if (e.code === 'KeyE') {
        e.preventDefault();
        set_range([frame_slider_range[0], slider_frame_ctx]);
      }
      if (e.code === 'Digit1' && e.location === 0) {
        set_range([slider_frame_ctx, frame_slider_range[1]]);
      }
      if (e.code === 'Digit2' && e.location === 0) {
        set_range([frame_slider_range[0], slider_frame_ctx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    play_pause,
    stop,
    go_to_frame,
    print_scene_components,
    frame_count,
    slider_frame_ctx,
    set_slider_frame,
    cleanup_loop,
    cleanup_player,
    cleanup_thumbnail_render,
  ]);

  useEffect(() => {
    if (!frame_count) return;

    // do not override during scrubbing
    if (frame_slider_track_scrubbing_reference.current) return;

    if (!is_playing) return;

    set_slider_frame(current_frame);
  }, [current_frame, frame_count, is_playing, set_slider_frame]);

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
      set_slider_frame(clamped_frame);
      pause();
      go_to_frame(clamped_frame);
    },
    [frame_count, pause, go_to_frame, set_slider_frame],
  );

  const on_mouse_down_slider_track = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!frame_count) return;
      frame_slider_track_scrubbing_reference.current = true;
      const frame = compute_slider_track_frame(e.clientX);
      update_slider_track_frame_tick(frame);
      pause();
    },
    [frame_count, compute_slider_track_frame, update_slider_track_frame_tick, is_playing, pause],
  );

  const on_mouse_move_slider_track = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!frame_count) return;
      const frame_idx = compute_slider_track_frame(e.clientX);
      set_frame_slider_track_hovered_frame(frame_idx);
      if (frame_slider_track_scrubbing_reference.current) {
        update_slider_track_frame_tick(frame_idx);
      }

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
          if (seqRef.current !== mySeq) return;
          if (preview_render_img_ref.current && data_url) {
            preview_render_img_ref.current.src = data_url;
          }
        });
      });
    },
    [frame_count, compute_slider_track_frame, update_slider_track_frame_tick, get_thumbnail_for_frame],
  );

  const on_mouse_up_slider_track = useCallback(() => {
    frame_slider_track_scrubbing_reference.current = false;
  }, []);

  const on_mouse_leave_slider_track = useCallback(() => {
    frame_slider_track_scrubbing_reference.current = false;
    set_frame_slider_track_hovered_frame(null);
    if (preview_render_img_ref.current) {
      preview_render_img_ref.current.style.display = 'none';
      preview_render_img_ref.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  const frame_slider_track_props = useMemo(
    () => ({
      slider_frame: slider_frame_ctx,
      frame_count: frame_count ?? 0,
      frame_slider_range: frame_slider_range as Range,
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
      slider_frame_ctx,
      frame_count,
      frame_slider_range,
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
