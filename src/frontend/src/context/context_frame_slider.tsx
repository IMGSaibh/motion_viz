import { createContext, useState, useContext } from 'react';
import type { Range } from '@/domain/datatypes';

type FrameSliderContext = {
  frame_slider_value: number;
  set_frame_slider_value: (frame_idx: number) => void;
  range: Range | null;
  set_range: (range: Range | null) => void;
};
const frame_slider_context = createContext<FrameSliderContext | null>(null);

/**
 * Provides the playhead value and transient frame range shared by slider-related features.
 *
 * Keep only serializable UI state that multiple distant components require in this context.
 * Three.js playback remains in the engine context, label collections in the label context,
 * and pointer-event handling in `ContainerFrameSlider`.
 */
export function FrameSliderContexProvider({ children }: { children: React.ReactNode }) {
  const [frame_slider_value, set_frame_slider_value] = useState(0);
  // null means that no explicit range is selected. Consumers then treat the current frame as a one-frame target.
  const [range, set_range] = useState<Range | null>(null);

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
