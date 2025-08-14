import { useRef, useEffect, useState } from 'react';
import { ThreeJSEngine } from '@/context_three_js';
import { WidgetPresenterSlider } from '@/components/widget_presenter_slider';

export function WidgetContainerSlider() {
  const {
    frame_count,
    current_frame,
    go_to_frame,
    stop,
    play_pause,
    cleanup_player,
    cleanup_loop,
    cleanup_thumbnail_render,
    print_scene_components,
    get_thumbnail_for_frame,
  } = ThreeJSEngine();

  const std_slider_reference = useRef<HTMLSpanElement | null>(null);
  const [std_slider_thumbnail_css, set_std_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [std_slider_thumbnail, set_std_slider_thumbnail] = useState<string | null>(null);
  const [std_slider_value, set_std_slider_value] = useState<number>(0);

  const [labelslider_thumbnail_css, set_label_slider_thumbnail_css] = useState<React.CSSProperties>({});
  const [labelslider_thumbnail, set_label_slider_thumbnail] = useState<string | null>(null);
  const [label_slider_range, set_label_slider_range] = useState<[number, number]>([0, 100]);
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
        set_label_slider_range([0, 0]);
      }
      if (e.code === 'KeyR') {
        stop();
        set_label_slider_range([0, 0]);
        set_std_slider_value(0);
        cleanup_player();
        cleanup_loop();
        cleanup_thumbnail_render();
      }
      if (e.code === 'KeyP') print_scene_components();
    };

    window.addEventListener('keydown', handleKeyDown);
    // set_std_slider_value(current_frame ?? 0);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [go_to_frame, play_pause, stop, frame_count]);

  function handle_std_slider_on_mouse_move(e: React.MouseEvent) {
    const rect = std_slider_reference.current?.getBoundingClientRect();
    if (!rect || !frame_count) return;
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(percent, 1));
    let slider_value = Math.round(percent * frame_count);
    slider_value = Math.max(0, Math.min(slider_value, frame_count - 1));

    get_thumbnail_for_frame(slider_value).then((dataUrl) => {
      set_std_slider_thumbnail_css({
        display: 'block',
        left: (slider_value / frame_count) * rect.width,
        position: 'absolute',
        border: '1px solid #000000',
        top: -220,
        zIndex: 0,
      });
      set_std_slider_thumbnail(dataUrl);
    });
  }

  function handle_std_slider_on_mouse_leave() {
    set_std_slider_thumbnail_css({ display: 'none' });
    set_std_slider_thumbnail(null);
  }

  function handle_std_slider_on_change(_e: Event, value: number) {
    stop();
    go_to_frame(value);
    set_std_slider_value(value);
  }

  function handle_label_slider_on_change(_e: Event, value: number | number[], active_idx: number) {
    const rect = std_slider_reference.current?.getBoundingClientRect();
    if (!rect || !frame_count) return;
    if (Array.isArray(value) && value.length === 2) {
      set_label_slider_range([value[0], value[1]]);
      set_label_slider_thumbnail_css({
        display: 'block',
        left: (value[active_idx] / frame_count) * rect.width,
        position: 'absolute',
        border: '1px solid #000000',
        top: -220,
        zIndex: 0,
      });
      get_thumbnail_for_frame(value[active_idx]).then((dataUrl) => set_label_slider_thumbnail(dataUrl));
    }
  }

  function handle_label_slider_on_mouse_leave() {
    set_label_slider_thumbnail_css({ display: 'none' });
    set_label_slider_thumbnail(null);
  }

  return (
    <>
      <WidgetPresenterSlider
        std_slider_value={std_slider_value}
        std_slider_framecount={frame_count}
        std_slider_reference={std_slider_reference}
        std_slider_on_change={handle_std_slider_on_change}
        std_slider_on_mouse_move={handle_std_slider_on_mouse_move}
        std_slider_on_mouse_leave={handle_std_slider_on_mouse_leave}
        std_slider_thumbnail_css={std_slider_thumbnail_css}
        std_slider_thumbnail={std_slider_thumbnail}
        label_slider_value={label_slider_range}
        label_slider_framecount={frame_count}
        label_slider_on_change={handle_label_slider_on_change}
        label_slider_on_mouse_leave={handle_label_slider_on_mouse_leave}
        label_slider_thumbnail_css={labelslider_thumbnail_css}
        label_slider_thumbnail={labelslider_thumbnail}
      />
    </>
  );
}
