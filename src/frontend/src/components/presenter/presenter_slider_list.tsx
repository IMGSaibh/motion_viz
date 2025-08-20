import { WidgetSliderList } from '@/components/widgets/widget_slider_list';
export type SliderListEntry = { id: string; label: string; value: [number, number]; framecount: number };

export const SLIDER_ITEMS: SliderListEntry[] = [
  { id: '1', label: 'Label_1', value: [10, 48], framecount: 999 },
  { id: '2', label: 'Label_2', value: [312, 455], framecount: 999 },
  { id: '3', label: 'Label_3', value: [121, 260], framecount: 999 },
  { id: '4', label: 'Label_4', value: [578, 899], framecount: 999 },
  { id: '5', label: 'Label_5', value: [10, 48], framecount: 999 },
  { id: '6', label: 'Label_6', value: [312, 455], framecount: 999 },
  { id: '7', label: 'Label_7', value: [121, 260], framecount: 999 },
  { id: '8', label: 'Label_8', value: [578, 899], framecount: 999 },
];

export function PresenterSliderList() {
  return <>{<WidgetSliderList items={SLIDER_ITEMS} />}</>;
}
