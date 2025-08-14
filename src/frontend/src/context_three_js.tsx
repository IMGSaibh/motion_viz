import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { ThreeManager } from '@/threeJS/three_js_manager';

type ThreeContextShape = {
  threejs_scene_ref: React.RefObject<HTMLDivElement | null>;
  threejs_mngr_ref: React.RefObject<ThreeManager | null>;

  selected_motion: string | null;
  set_selected_motion: (f: string | null) => void;

  frame_count: number;
  current_frame: number;
  go_to_frame: (i: number) => void;
  play_pause: () => void;
  stop: () => void;
  reload_motion_file: (file: string) => Promise<void>;
  cleanup_player: () => void;
  cleanup_loop: () => void;
  cleanup_thumbnail_render: () => void;
  print_scene_components: () => void;
  get_thumbnail_for_frame: (i: number) => Promise<string | null>;
};

const ThreeContext = createContext<ThreeContextShape | null>(null);

export function ThreeProvider({ children }: { children: React.ReactNode }) {
  const threejs_scene_ref = useRef<HTMLDivElement | null>(null);
  const threejs_mngr_ref = useRef<ThreeManager | null>(null);
  const [selected_motion, set_selected_motion] = useState<string | null>(null);
  const [frame_count, set_frame_count] = useState(0);
  const [current_frame, set_current_frame] = useState(0);
  // start engine at App-Start
  useEffect(() => {
    if (!threejs_scene_ref.current) return;
    const three_manager = new ThreeManager(threejs_scene_ref.current);
    threejs_mngr_ref.current = three_manager;
    three_manager.start_engine_cycle();

    return () => {
      threejs_mngr_ref.current?.stop_engine_cycle?.();
      threejs_mngr_ref.current?.dispose?.();
      threejs_mngr_ref.current = null;
    };
  }, []);

  // Explizites Laden / Neu-Laden einer Datei (ohne Engine neu zu bauen)
  const reload_motion_file = useCallback(async (file: string) => {
    if (!threejs_mngr_ref.current) return; // Engine noch nicht bereit

    // Player/Scene aufräumen – bevorzugt gezielt den Player, Fallback: cleanup_scene
    threejs_mngr_ref.current.cleanup_player?.();
    threejs_mngr_ref.current.cleanup_loop?.();
    threejs_mngr_ref.current.cleanup_thumbnail_render?.();

    await threejs_mngr_ref.current.load_motionfile_and_player(file);

    const fc = threejs_mngr_ref.current.get_frame_count?.() ?? 0;
    set_frame_count(fc);

    const player = threejs_mngr_ref.current.get_current_player?.();
    player?.set_on_frame_changed_callback?.((idx: number) => {
      set_current_frame(idx);
    });
  }, []);
  const get_thumbnail_for_frame = useCallback(
    (i: number) => threejs_mngr_ref.current?.get_thumbnail_for_frame?.(i) ?? Promise.resolve(null),
    [],
  );
  const go_to_frame = useCallback((i: number) => threejs_mngr_ref.current?.go_to_frame?.(i), []);
  const play_pause = useCallback(() => threejs_mngr_ref.current?.play_pause?.(), []);
  const stop = useCallback(() => {
    threejs_mngr_ref.current?.stop?.();
    threejs_mngr_ref.current?.go_to_frame?.(0);
    set_current_frame(0);
    set_frame_count(0);
  }, []);
  const cleanup_player = useCallback(() => threejs_mngr_ref.current?.cleanup_player?.(), []);
  const cleanup_loop = useCallback(() => threejs_mngr_ref.current?.cleanup_loop?.(), []);
  const cleanup_thumbnail_render = useCallback(() => threejs_mngr_ref.current?.cleanup_thumbnail_render?.(), []);
  const print_scene_components = useCallback(() => threejs_mngr_ref.current?.print_scene_components?.(), []);

  return (
    <ThreeContext.Provider
      value={{
        threejs_scene_ref: threejs_scene_ref,
        threejs_mngr_ref: threejs_mngr_ref,

        selected_motion,
        set_selected_motion,
        reload_motion_file,

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
