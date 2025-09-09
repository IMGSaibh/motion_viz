import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { PresenterSlider } from '@/components/presenter/presenter_slider';
import { useRef, useEffect, useCallback, useMemo, useState } from 'react';
import {
  use_set_range_slider_value_cxt,
  use_range_slider_value_cxt,
  use_std_slider_value_cxt,
  use_set_std_slider_value_cxt,
  use_add_label_ctx,
  use_remove_label_cxt,
  use_clear_label_list_ctx,
  use_label_cxt,
} from '@/context/context_slider_label_list';
import { Box, Slider } from '@mui/material';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { hook_save_labels_to_json } from '@/hooks/hook_upload_motion_files';
import { use_snackbar_ctx } from '@/context/context_snackbar';
import { PresenterLabelListUI } from '@/components/presenter/presenter_label_list_ui';
export type Label = { id: string; label: string; range: [number, number]; framecount: number };
export const lable_list: Label[] = [];

export function ContainerBottomUI() {
  const {
    frame_count,
    current_frame,
    selected_motion,
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

  const markers = use_label_cxt();

  const std_slider_reference = useRef<HTMLSpanElement | null>(null);
  const std_slider_value = use_std_slider_value_cxt();
  const set_std_slider_value = use_set_std_slider_value_cxt();

  const range_slider_reference = useRef<HTMLSpanElement | null>(null);
  const range_slider_value = use_range_slider_value_cxt();
  const set_range = use_set_range_slider_value_cxt();

  const label_id = useRef<number>(lable_list.length + 1);
  const add_label = use_add_label_ctx();
  const hook_save_labels = hook_save_labels_to_json();
  const remove_label = use_remove_label_cxt();
  const clear_label_list = use_clear_label_list_ctx();

  const preview_render_img_ref = useRef<HTMLImageElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const seqRef = useRef(0);

  const [gridMinorEvery, setGridMinorEvery] = useState(10);
  const [gridMajorEvery, setGridMajorEvery] = useState(50);

  const { success, error } = use_snackbar_ctx();

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
        set_range([std_slider_value, range_slider_value[1]]);
      }
      if (e.code === 'Digit2' && e.location === 0) {
        set_range([range_slider_value[0], std_slider_value]);
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
    range_slider_value,
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
          if (seqRef.current !== mySeq) return;
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

  const range_slider_props = useMemo(
    () => ({
      label_slider_range: range_slider_value,
      label_slider_framecount: frame_count,
      label_slider_reference: range_slider_reference,
    }),
    [range_slider_value, frame_count],
  );

  const add_label_on_click = useCallback(
    (label_button?: string) => {
      const id = String(label_id.current++);
      const label = label_button ?? `Label_${id}`;

      const fc = Math.max(0, frame_count ?? 0);
      const clamp = (v: number) => Math.max(0, Math.min(v, Math.max(0, fc)));

      let [a, b] = range_slider_value;
      a = clamp(a);
      b = clamp(b);
      if (a > b) [a, b] = [b, a];

      // TODO:  Fallback: wenn Range noch [0,0] und wir einen aktuellen Frame haben, nimm den
      const value: [number, number] =
        a === 0 && b === 0 && (current_frame ?? 0) > 0 ? [clamp(current_frame!), clamp(current_frame!)] : [a, b];

      add_label({ id, from: value[0], to: value[1], label });
    },
    [range_slider_value, frame_count, current_frame, add_label],
  );

  const label_list_on_click = useCallback(
    (id: string) => {
      remove_label(id);
    },
    [remove_label],
  );

  const clear_label_list_on_click = useCallback(() => {
    label_id.current = 1;
    clear_label_list();
  }, [clear_label_list]);

  const labels_list: Label[] = useMemo(() => {
    const fc = Math.max(0, frame_count ?? 0);
    return markers.map((m) => ({
      id: m.id,
      label: m.label ?? `Label_${m.id}`,
      range: [m.from, m.to] as [number, number],
      framecount: fc,
    }));
  }, [markers, frame_count]);

  // saves lable list to backend
  const on_save_click = useCallback(() => {
    if (!selected_motion) return;

    const labels_map = markers.map((m) => {
      const startframe = Math.min(m.from, m.to);
      const endframe = Math.max(m.from, m.to);
      return { startframe, endframe };
    });

    const motion_name = (selected_motion.split(/[/\\]/).pop() ?? selected_motion).trim();

    // TODO: check hook and api function to implement them with same convention
    hook_save_labels.mutate(
      { motion_name, labels: labels_map },
      {
        onSuccess: (respond: any) => {
          if (respond.message) success(respond.message);
          if (respond.warning) error(respond.warning);
        },
        onError: (err: any) => error(err?.message || 'Saving labels failed'),
      },
    );
  }, [markers, selected_motion, hook_save_labels]);

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

  return (
    <Box
      sx={(theme) => ({
        position: 'absolute',
        width: '100%',
        bottom: '0vw',
        p: '1rem',
        bgcolor: theme.palette.background.paper,
      })}
    >
      <PresenterLabelButtons onClick={add_label_on_click}></PresenterLabelButtons>

      <PresenterSlider
        {...range_slider_props}
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
      <PresenterLabelListUI
        slider_lables={labels_list}
        slider_list_on_click={label_list_on_click}
        slider_list_clear_on_click={clear_label_list_on_click}
        save_labels_on_click={on_save_click}
      />
    </Box>
  );
}
