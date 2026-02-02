import { createContext, useState, useContext } from 'react';
import type { Range } from '@/domain/datatypes';

type FrameSliderContext = {
  frame_slider_value: number;
  set_frame_slider_value: (frame_idx: number) => void;
  range: Range;
  set_range: (range: Range) => void;
};
const frame_slider_context = createContext<FrameSliderContext | null>(null);

export function FrameSliderContexProvider({ children }: { children: React.ReactNode }) {
  const [frame_slider_value, set_frame_slider_value] = useState(0);
  const [range, set_range] = useState<Range>([0, 0]);
  // TODO: use memoized default value if needed
  const value: FrameSliderContext = {
    frame_slider_value,
    set_frame_slider_value,
    range,
    set_range,
  };
  return <frame_slider_context.Provider value={value}>{children}</frame_slider_context.Provider>;
}

export const use_frame_slider_context = () => {
  const ctx = useContext(frame_slider_context);
  if (!ctx) throw new Error('use_frame_slider_context must be used within a FrameSliderContexProvider');
  return ctx;
};
