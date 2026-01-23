import { createContext, useState, useContext } from 'react';

type FrameSliderContext = {
  current_frame_slider_value: number;
  set_slider_frame: (frame_idx: number) => void;
};
const frame_slider_context = createContext<FrameSliderContext | null>(null);

export function FrameSliderContexProvider({ children }: { children: React.ReactNode }) {
  const [slider_frame, set_slider_frame] = useState(0);
  // TODO: use memoized default value if needed
  const value: FrameSliderContext = {
    current_frame_slider_value: slider_frame,
    set_slider_frame,
  };
  return <frame_slider_context.Provider value={value}>{children}</frame_slider_context.Provider>;
}

export const use_frame_slider_context = () => {
  const ctx = useContext(frame_slider_context);
  if (!ctx) throw new Error('use_frame_slider_context must be used within a ThreeJSEngineProvider');
  return ctx;
};
