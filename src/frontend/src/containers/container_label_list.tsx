import { useCallback, useRef, useMemo } from 'react';
import { useThreeJSEngine } from '@/context/context_three_js_engine';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { PresenterSliderList } from '@/components/presenter/presenter_slider_list';

import {
  use_slider_range_cxt,
  use_add_label_ctx,
  use_remove_label_cxt,
  use_clear_label_list_ctx,
  use_label_cxt,
} from '@/context/context_slider_label_list';

export type SliderLabel = { id: string; label: string; range: [number, number]; framecount: number };
export const slider_lables: SliderLabel[] = [];

export function ContainerSliderList() {
  const slider_range = use_slider_range_cxt();
  const markers = use_label_cxt();
  const slider_label_id = useRef<number>(slider_lables.length + 1);

  const { frame_count, current_frame } = useThreeJSEngine();

  const add_slider_label = use_add_label_ctx();
  const remove_slider_label = use_remove_label_cxt();
  const clear_slider_label_list = use_clear_label_list_ctx();

  const slider_list_on_click = useCallback(
    (id: string) => {
      remove_slider_label(id);
    },
    [remove_slider_label],
  );

  const add_slider_label_on_click = useCallback(
    (label_button?: string) => {
      const id = String(slider_label_id.current++);
      const label = label_button ?? `Label_${id}`;

      const fc = Math.max(0, frame_count ?? 0);
      const clamp = (v: number) => Math.max(0, Math.min(v, Math.max(0, fc)));

      let [a, b] = slider_range;
      a = clamp(a);
      b = clamp(b);
      if (a > b) [a, b] = [b, a];

      // TODO:  Fallback: wenn Range noch [0,0] und wir einen aktuellen Frame haben, nimm den
      const value: [number, number] =
        a === 0 && b === 0 && (current_frame ?? 0) > 0 ? [clamp(current_frame!), clamp(current_frame!)] : [a, b];

      add_slider_label({ id, from: value[0], to: value[1], label });
    },
    [slider_range, frame_count, current_frame, add_slider_label],
  );

  const slider_list_on_click_clear_list = useCallback(() => {
    slider_label_id.current = 1;
    clear_slider_label_list();
  }, [clear_slider_label_list]);

  const slider_labels: SliderLabel[] = useMemo(() => {
    const fc = Math.max(0, frame_count ?? 0);
    return markers.map((m) => ({
      id: m.id,
      label: m.label ?? `Label_${m.id}`,
      range: [m.from, m.to] as [number, number],
      framecount: fc,
    }));
  }, [markers, frame_count]);

  return (
    <>
      <PresenterLabelButtons onAnyLabelClick={add_slider_label_on_click}></PresenterLabelButtons>

      <PresenterSliderList
        slider_lables={slider_labels}
        slider_list_on_click={slider_list_on_click}
        slider_list_clear_on_click={slider_list_on_click_clear_list}
      />
    </>
  );
}
