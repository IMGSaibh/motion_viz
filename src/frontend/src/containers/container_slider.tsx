import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { PresenterSlider } from '@/components/presenter/presenter_slider';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  use_set_range_cxt,
  use_slider_range_cxt,
  use_std_slider_value_cxt,
  use_set_std_slider_value_cxt,
} from '@/context/context_slider_label_list';
import { Slider } from '@mui/material';
export function ContainerSlider() {
  const {
    frame_count,
    current_frame,
    go_to_frame,
    stop,
    pause,
    play_pause,
    print_scene_components,
    get_thumbnail_for_frame,
    cleanup_player,
    cleanup_loop,
    cleanup_thumbnail_render,
  } = useThreeJSEngine();

  const std_slider_reference = useRef<HTMLSpanElement | null>(null);
  const label_slider_reference = useRef<HTMLSpanElement | null>(null);

  const label_slider_range = use_slider_range_cxt();
  const set_range = use_set_range_cxt();

  const std_slider_value = use_std_slider_value_cxt();
  const set_std_slider_value = use_set_std_slider_value_cxt();

  const preview_render_img_ref = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  const [gridMinorEvery, setGridMinorEvery] = useState(10);
  const [gridMajorEvery, setGridMajorEvery] = useState(50);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  useEffect(() => {
    set_std_slider_value(current_frame ?? 0);
  }, [current_frame, set_std_slider_value]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') play_pause();
      if (e.code === 'KeyS') {
        stop();
        go_to_frame(0);
        set_range([0, 1]);
        set_std_slider_value(0);
      }
      if (e.code === 'KeyR') {
        stop();
        go_to_frame(0);
        cleanup_player();
        cleanup_loop();
        cleanup_thumbnail_render();
        set_range([0, 1]);
        set_std_slider_value(0);
      }
      if (e.code === 'KeyD') print_scene_components();
      if (e.code === 'Digit1' && e.location === 0) {
        set_range([std_slider_value, label_slider_range[1]]);
      }
      if (e.code === 'Digit2' && e.location === 0) {
        set_range([label_slider_range[0], std_slider_value]);
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
    std_slider_value,
    label_slider_range,
    set_range,
    set_std_slider_value,
  ]);

  const std_slider_on_change = useCallback(
    (e: Event, value: number | number[]) => {
      if (!Array.isArray(value)) {
        set_std_slider_value(value);
        pause();
        go_to_frame(value);
      }
    },
    [pause, go_to_frame, set_std_slider_value],
  );

  const std_slider_on_pointer_move = useCallback(
    (e: React.PointerEvent<HTMLSpanElement>) => {
      const rect = std_slider_reference.current?.getBoundingClientRect();
      if (!rect || !frame_count) return;

      const x = e.clientX - rect.left;
      const ratio = Math.min(1, Math.max(0, x / rect.width));
      const idx = Math.round(ratio * Math.max(0, frame_count - 1));

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const mySeq = ++seqRef.current;

      rafRef.current = requestAnimationFrame(() => {
        let css_left = ratio * rect.width + 50;
        if (preview_render_img_ref.current) {
          preview_render_img_ref.current.style.display = 'block';
          preview_render_img_ref.current.style.left = `${css_left}px`;
        }

        get_thumbnail_for_frame(idx).then((data_url) => {
          if (seqRef.current !== mySeq) return; // Race-Guard
          if (preview_render_img_ref.current && data_url) {
            preview_render_img_ref.current.src = data_url;
          }
        });
      });
    },
    [frame_count, get_thumbnail_for_frame],
  );

  const std_slider_on_mouse_leave = useCallback(() => {
    if (preview_render_img_ref.current) {
      preview_render_img_ref.current.style.display = 'none';
      preview_render_img_ref.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  // major auf Vielfaches von minor snappen
  const snapMajor = useCallback((minor: number, major: number) => {
    if (major < minor) return minor;
    const k = Math.max(1, Math.round(major / minor));
    return k * minor;
  }, []);

  const onMinorChange: NonNullable<React.ComponentProps<typeof Slider>['onChange']> = (_e, v) => {
    if (Array.isArray(v)) return;
    const minor = Math.max(1, Math.floor(v));
    setGridMinorEvery(minor);
    setGridMajorEvery((prev) => snapMajor(minor, prev));
  };

  const onMajorChange: NonNullable<React.ComponentProps<typeof Slider>['onChange']> = (_e, v) => {
    if (Array.isArray(v)) return;
    const majorRaw = Math.max(1, Math.floor(v));
    setGridMajorEvery(snapMajor(gridMinorEvery, majorRaw));
  };

  const std_slider_props = useMemo(
    () => ({
      std_slider_value,
      std_slider_framecount: frame_count,
      std_slider_reference,
      std_slider_on_change,
      std_slider_on_mouse_leave,
      std_slider_on_pointer_move,
    }),
    [std_slider_value, frame_count, std_slider_on_change, std_slider_on_mouse_leave, std_slider_on_pointer_move],
  );

  const label_slider_props = useMemo(
    () => ({
      label_slider_range,
      label_slider_framecount: frame_count,
      label_slider_reference,
    }),
    [label_slider_range, frame_count],
  );

  return (
    <>
      <PresenterSlider
        {...label_slider_props}
        {...std_slider_props}
        gridMinorEvery={gridMinorEvery}
        gridMajorEvery={gridMajorEvery}
        onGridMinorChange={onMinorChange}
        onGridMajorChange={onMajorChange}
      />
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
  );
}
