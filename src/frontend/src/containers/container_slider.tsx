import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { PresenterSlider } from '@/components/presenter/presenter_slider';

export function ContainerSlider() {
  const {
    frame_count,
    current_frame,
    go_to_frame,
    stop,
    play_pause,
    print_scene_components,
    get_thumbnail_for_frame,
    reset,
  } = useThreeJSEngine();

  const std_slider_reference = useRef<HTMLSpanElement | null>(null);
  const label_slider_reference = useRef<HTMLSpanElement | null>(null);
  const [std_slider_value, set_std_slider_value] = useState<number>(0);
  const [label_slider_range, set_label_slider_range] = useState<[number, number]>([0, 10]);

  // control thumbnail via DOM  (no State-Thrash)
  const hoverImgRef = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  useEffect(() => {
    set_std_slider_value(current_frame ?? 0);
  }, [current_frame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') play_pause();
      if (e.code === 'KeyS') {
        stop();
        go_to_frame(0);
        set_std_slider_value(0);
        set_label_slider_range([0, 1]);
      }
      if (e.code === 'KeyR') {
        go_to_frame(0);
        reset();
        set_std_slider_value(0);
        set_label_slider_range([0, 1]);
      }
      if (e.code === 'KeyP') print_scene_components();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [go_to_frame, play_pause, stop, frame_count]);

  // hover thumbnail without State-Thrash, with rAF + Stale-Guard
  const update_preview_thumbnail = useCallback(
    (clientX: number) => {
      const rect = std_slider_reference.current?.getBoundingClientRect();
      if (!rect || !frame_count || frame_count < 2) return;

      const pct = Math.max(0, Math.min((clientX - rect.left) / rect.width, 1));
      const idx = Math.round(pct * (frame_count - 1));

      // set DOM-position
      if (hoverImgRef.current) {
        const x = pct * rect.width;
        hoverImgRef.current.style.display = 'block';
        hoverImgRef.current.style.position = 'absolute';
        hoverImgRef.current.style.left = `${x}px`;
        hoverImgRef.current.style.top = `650px`;
        hoverImgRef.current.style.zIndex = '0';
        hoverImgRef.current.style.border = '1px solid #000';
      }

      const mySeq = ++seqRef.current;
      get_thumbnail_for_frame(idx).then((dataUrl) => {
        if (seqRef.current !== mySeq) return;
        if (hoverImgRef.current && dataUrl) hoverImgRef.current.src = dataUrl;
      });
    },
    [frame_count, get_thumbnail_for_frame],
  );

  const handle_std_slider_on_mouse_move = useCallback(
    (e: React.MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => update_preview_thumbnail(e.clientX));
    },
    [update_preview_thumbnail],
  );

  const handle_std_slider_on_mouse_leave = useCallback(() => {
    if (hoverImgRef.current) {
      hoverImgRef.current.style.display = 'none';
      hoverImgRef.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  const handle_std_slider_on_change = useCallback(
    (_e: Event, value: number) => {
      stop();
      go_to_frame(value);
      set_std_slider_value(value);
    },
    [stop, go_to_frame],
  );

  const handle_label_slider_on_change = useCallback(
    (_e: Event, value: number | number[], active_idx: number) => {
      const rect = label_slider_reference.current?.getBoundingClientRect();
      if (!rect || !frame_count) return;

      if (Array.isArray(value) && value.length === 2) {
        set_label_slider_range([value[0], value[1]]);
        const idx = value[active_idx];
        const pct = frame_count > 1 ? idx / (frame_count - 1) : 0;
        const x = pct * rect.width;

        if (hoverImgRef.current) {
          hoverImgRef.current.style.display = 'block';
          hoverImgRef.current.style.position = 'absolute';
          hoverImgRef.current.style.left = `${x}px`;
          hoverImgRef.current.style.top = `650px`;
          hoverImgRef.current.style.zIndex = '0';
          hoverImgRef.current.style.border = '1px solid #000';
        }

        const mySeq = ++seqRef.current;
        get_thumbnail_for_frame(idx).then((dataUrl) => {
          if (seqRef.current !== mySeq) return;
          if (hoverImgRef.current && dataUrl) hoverImgRef.current.src = dataUrl;
        });
      }
    },
    [frame_count, get_thumbnail_for_frame],
  );

  const handle_label_slider_on_mouse_leave = useCallback(() => {
    if (hoverImgRef.current) {
      hoverImgRef.current.style.display = 'none';
      hoverImgRef.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  const std_slider_props = useMemo(
    () => ({
      std_slider_value,
      std_slider_framecount: frame_count,
      std_slider_reference,
      std_slider_on_change: handle_std_slider_on_change,
      std_slider_on_mouse_move: handle_std_slider_on_mouse_move,
      std_slider_on_mouse_leave: handle_std_slider_on_mouse_leave,
    }),
    [
      std_slider_value,
      frame_count,
      handle_std_slider_on_change,
      handle_std_slider_on_mouse_move,
      handle_std_slider_on_mouse_leave,
    ],
  );

  const label_slider_props = useMemo(
    () => ({
      label_slider_value: label_slider_range,
      label_slider_framecount: frame_count,
      label_slider_reference,
      label_slider_on_change: handle_label_slider_on_change,
      label_slider_on_mouse_leave: handle_label_slider_on_mouse_leave,
    }),
    [label_slider_range, frame_count, handle_label_slider_on_change, handle_label_slider_on_mouse_leave],
  );

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );
  return (
    <>
      <PresenterSlider {...label_slider_props} {...std_slider_props} />
      <img ref={hoverImgRef} alt="" />
    </>
  );
}
