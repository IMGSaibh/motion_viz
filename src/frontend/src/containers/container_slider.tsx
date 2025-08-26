import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { PresenterSlider } from '@/components/presenter/presenter_slider';
import { use_set_range_context, use_slider_range_context } from '@/context/context_slider_sliderlist';

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

  const preview_render_img_ref = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  const label_slider_range = use_slider_range_context();
  const set_range = use_set_range_context();

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

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
        set_range([0, 1]);
      }
      if (e.code === 'KeyR') {
        go_to_frame(0);
        reset();
        set_std_slider_value(0);
      }
      if (e.code === 'KeyP') print_scene_components();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [go_to_frame, play_pause, stop, frame_count]);

  const std_slider_on_mouse_leave = useCallback(() => {
    if (preview_render_img_ref.current) {
      preview_render_img_ref.current.style.display = 'none';
      preview_render_img_ref.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  const std_slider_on_change = useCallback(
    (e: Event, value: number) => {
      stop();
      go_to_frame(value);
      set_std_slider_value(value);
    },
    [stop, go_to_frame],
  );

  const label_slider_on_change = useCallback(
    (e: Event, value: number | number[], active_idx: number) => {
      const rect = label_slider_reference.current?.getBoundingClientRect();
      if (!rect || !frame_count) return;

      if (Array.isArray(value) && value.length === 2) {
        const idx = value[active_idx];
        const percent = frame_count > 1 ? idx / (frame_count - 1) : 0;
        let css_style_left = percent * rect.width;
        css_style_left += 45;

        // for storing values per saved label
        set_range([value[0], value[1]]);

        if (preview_render_img_ref.current) {
          preview_render_img_ref.current.style.display = 'block';
          preview_render_img_ref.current.style.position = 'absolute';
          preview_render_img_ref.current.style.left = `${css_style_left}px`;
          preview_render_img_ref.current.style.top = `-230px`;
          preview_render_img_ref.current.style.zIndex = '0';
          preview_render_img_ref.current.style.border = '1px solid #000';
        }

        const mySeq = ++seqRef.current;
        get_thumbnail_for_frame(idx).then((data_url) => {
          if (seqRef.current !== mySeq) return;
          if (preview_render_img_ref.current && data_url) preview_render_img_ref.current.src = data_url;
        });
      }
    },
    [frame_count, get_thumbnail_for_frame],
  );

  const label_slider_on_mouse_leave = useCallback(() => {
    if (preview_render_img_ref.current) {
      preview_render_img_ref.current.style.display = 'none';
      preview_render_img_ref.current.removeAttribute('src');
    }
    seqRef.current++;
  }, []);

  const std_slider_props = useMemo(
    () => ({
      std_slider_value,
      std_slider_framecount: frame_count,
      std_slider_reference,
      std_slider_on_change,
      std_slider_on_mouse_leave,
    }),
    [std_slider_value, frame_count, std_slider_on_change, std_slider_on_mouse_leave],
  );

  const label_slider_props = useMemo(
    () => ({
      label_slider_range,
      label_slider_framecount: frame_count,
      label_slider_reference,
      label_slider_on_change,
      label_slider_on_mouse_leave,
    }),
    [label_slider_range, frame_count, label_slider_on_change, label_slider_on_mouse_leave],
  );

  return (
    <>
      <PresenterSlider {...label_slider_props} {...std_slider_props} />
      <img ref={preview_render_img_ref} alt="" />
    </>
  );
}
