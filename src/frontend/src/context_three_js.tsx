import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ThreeManager } from '@/threeJS/three_js_manager';

type ThreeContextShape = {
  three_js_scene_reference: React.RefObject<HTMLDivElement | null>;
  three_js_mngr_reference: React.RefObject<ThreeManager | null>;

  selected_motion: string | null;
  set_selected_motion: (f: string | null) => void;

  frame_count: number;
  go_to_frame: (i: number) => void;
  play_pause: () => void;
  stop: () => void;
  cleanup_scene: () => void;
  reload_motion: (file: string) => Promise<void>;
};

const ThreeContext = createContext<ThreeContextShape | null>(null);

export function ThreeProvider({ children }: { children: React.ReactNode }) {
  const three_js_scene_reference = useRef<HTMLDivElement | null>(null);
  const three_js_mngr_reference = useRef<ThreeManager | null>(null);
  const [selected_motion, set_selected_motion] = useState<string | null>(null);
  const [frame_count, set_frame_count] = useState(0);

  // start engine at App-Start
  useEffect(() => {
    if (!three_js_scene_reference.current) return;
    const three_manager = new ThreeManager(three_js_scene_reference.current);
    three_js_mngr_reference.current = three_manager;
    three_manager.start_engine_cycle();

    return () => {
      three_js_mngr_reference.current?.stop_engine_cycle?.();
      three_js_mngr_reference.current?.dispose?.();
      three_js_mngr_reference.current = null;
    };
  }, []);

  // Explizites Laden / Neu-Laden einer Datei (ohne Engine neu zu bauen)
  const reload_motion = useCallback(async (file: string) => {
    if (!three_js_mngr_reference.current) return; // Engine noch nicht bereit

    // Player/Scene aufräumen – bevorzugt gezielt den Player, Fallback: cleanup_scene
    // three_js_mngr_reference.current.cleanup_player?.();
    // three_js_mngr_reference.current.cleanup_loop?.();
    // three_js_mngr_reference.current.cleanup_thumbnail_render?.();

    await three_js_mngr_reference.current.load_motionfile_and_player(file);

    const fc = three_js_mngr_reference.current.get_frame_count?.() ?? 0;
    set_frame_count(fc);

    const player = three_js_mngr_reference.current.get_current_player?.();
    player?.set_on_frame_changed_callback?.((_idx: number) => {
      // Optional: hier globalen Current-Frame-State pflegen, falls nötig
      console.log('Player:', player);
    });
  }, []);

  const go_to_frame = useCallback((i: number) => three_js_mngr_reference.current?.go_to_frame?.(i), []);
  const play_pause = useCallback(() => three_js_mngr_reference.current?.play_pause?.(), []);
  const stop = useCallback(() => three_js_mngr_reference.current?.stop?.(), []);
  const cleanup_scene = useCallback(() => three_js_mngr_reference.current?.cleanup_player?.(), []);

  return (
    <ThreeContext.Provider
      value={{
        three_js_scene_reference,
        three_js_mngr_reference,
        selected_motion,
        set_selected_motion,
        frame_count,
        go_to_frame,
        play_pause,
        stop,
        reload_motion,
        cleanup_scene,
      }}
    >
      {children}
    </ThreeContext.Provider>
  );
}

export const ThreeJSEngine = () => {
  const ctx = useContext(ThreeContext);
  if (!ctx) throw new Error('useThree must be used within a ThreeProvider');
  return ctx;
};
