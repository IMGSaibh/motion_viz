import { useCallback, useRef, useState } from 'react';
import { PresenterSliderList, SliderListEntry } from '@/components/presenter/presenter_slider_list';
import { PresenterLabelButtons } from '@/components/presenter/presenter_label_buttons';
import { useThreeJSEngine } from '@/context/context_three_js_engine';
import {
  use_slider_range_context,
  use_add_visited_context,
  use_remove_visited_context,
  use_clear_visited_context,
} from '@/context/context_slider_slider_list';

export const SLIDER_ITEMS: SliderListEntry[] = [];

export function ContainerSliderList() {
  const [items, setItems] = useState<SliderListEntry[]>(SLIDER_ITEMS);
  const next_id = useRef<number>(SLIDER_ITEMS.length + 1);

  const range = use_slider_range_context(); // [start, end] – changes on slider-drag
  const { frame_count, current_frame } = useThreeJSEngine();

  const addVisited = use_add_visited_context();
  const removeVisited = use_remove_visited_context();
  const clearVisited = use_clear_visited_context();

  const handle_widget_slider_list_on_click = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((it) => it.id !== id));
      removeVisited(id); // NEW: remove from visited
    },
    [removeVisited],
  );

  const widget_slider_list_add_slider_item = useCallback(
    (labelFromButton?: string) => {
      const id = String(next_id.current++);
      const label = labelFromButton ?? `Label_${id}`;

      const fc = Math.max(0, frame_count ?? 0);
      const clamp = (v: number) => Math.max(0, Math.min(v, Math.max(0, fc)));

      let [a, b] = range;
      a = clamp(a);
      b = clamp(b);
      if (a > b) [a, b] = [b, a];

      // Fallback: wenn Range noch [0,0] und wir einen aktuellen Frame haben, nimm den
      const value: [number, number] =
        a === 0 && b === 0 && (current_frame ?? 0) > 0 ? [clamp(current_frame!), clamp(current_frame!)] : [a, b];

      setItems((prev) => [...prev, { id, label, value, framecount: fc }]);
      // NEW: als visited-Bereich speichern
      addVisited({ id, from: value[0], to: value[1] });
    },
    [range, frame_count, current_frame, setItems],
  );

  const handle_widget_slider_list_on_cick_clear_list = useCallback(() => {
    setItems([]);
    next_id.current = 1;
    clearVisited(); // NEW
  }, [clearVisited]);

  return (
    <>
      {/* <PresenterLabelButtons onAnyLabelClick={widget_slider_list_add_slider_item}></PresenterLabelButtons>

      <PresenterSliderList
        slider_list_items={items}
        widget_slider_list_on_click={handle_widget_slider_list_on_click}
        handle_widget_slider_list_on_cick_clear_list={handle_widget_slider_list_on_cick_clear_list}
      />
 */}

      <PresenterLabelButtons onAnyLabelClick={widget_slider_list_add_slider_item}></PresenterLabelButtons>

      <PresenterSliderList
        slider_list_items={items}
        widget_slider_list_on_click={handle_widget_slider_list_on_click}
        handle_widget_slider_list_on_cick_clear_list={handle_widget_slider_list_on_cick_clear_list}
      />
    </>
  );
}
