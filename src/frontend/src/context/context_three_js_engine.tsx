import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ThreeJSEngine } from '@/threeJS/three_js_manager';

type ThreeJSEngineContext = {
  threejs_scene_ref: React.RefObject<HTMLDivElement | null>;

  selected_motion: string | null;
  set_selected_motion: (file: string | null) => void;

  frame_count: number;
  current_frame: number;
  go_to_frame: (frame_idx: number) => void;
  play_pause: () => void;
  stop: () => void;
  pause: () => void;

  load_motion_file: (file: string) => Promise<void>;
  cleanup_player: () => void;
  cleanup_loop: () => void;
  cleanup_thumbnail_render: () => void;
  print_scene_components: () => void;
  get_thumbnail_for_frame: (i: number) => Promise<string | null>;
  // is_playing: () => boolean;
  is_playing: boolean;
};

const three_js_engine_context = createContext<ThreeJSEngineContext | null>(null);

export function ThreeJSEngineProvider({ children }: { children: React.ReactNode }) {
  const threejs_scene_ref = useRef<HTMLDivElement | null>(null);
  const threejs_mngr_ref = useRef<ThreeJSEngine | null>(null);
  const [selected_motion, set_selected_motion] = useState<string | null>(null);
  const [frame_count, set_frame_count] = useState(0);
  const [current_frame, set_current_frame] = useState(0);
  const [is_playing, set_is_playing] = useState(false);

  const sync_is_playing = useCallback(() => {
    set_is_playing(threejs_mngr_ref.current?.is_playing?.() ?? false);
  }, []);

  // start engine at App-Start
  useEffect(() => {
    if (!threejs_scene_ref.current) return;
    const three_manager = new ThreeJSEngine(threejs_scene_ref.current);
    threejs_mngr_ref.current = three_manager;
    three_manager.start_engine_cycle();

    return () => {
      threejs_mngr_ref.current?.stop_engine_cycle?.();
      threejs_mngr_ref.current?.dispose?.();
      threejs_mngr_ref.current = null;
    };
  }, []);

  const load_motion_file = useCallback(
    async (file: string) => {
      if (!threejs_mngr_ref.current) return; // Engine not ready

      threejs_mngr_ref.current.cleanup_player?.();
      threejs_mngr_ref.current.cleanup_loop?.();
      threejs_mngr_ref.current.cleanup_thumbnail_render?.();

      await threejs_mngr_ref.current.load_motionfile_and_player(file);

      const framecount = threejs_mngr_ref.current.get_frame_count?.() ?? 0;
      set_frame_count(framecount);

      const player = threejs_mngr_ref.current.get_current_player?.();
      player?.set_on_frame_changed_callback?.((idx: number) => {
        set_current_frame(idx);
      });
      sync_is_playing();
    },
    [sync_is_playing],
  );

  const get_thumbnail_for_frame = useCallback(
    (idx: number) => threejs_mngr_ref.current?.get_thumbnail_for_frame?.(idx) ?? Promise.resolve(null),
    [],
  );
  // const play_pause = useCallback(() => threejs_mngr_ref.current?.play_pause?.(), []);
  const play_pause = useCallback(() => {
    threejs_mngr_ref.current?.play_pause?.();
    sync_is_playing();
  }, [sync_is_playing]);
  const go_to_frame = useCallback((idx: number) => threejs_mngr_ref.current?.go_to_frame?.(idx), []);
  const stop = useCallback(() => {
    threejs_mngr_ref.current?.pause?.();
    threejs_mngr_ref.current?.go_to_frame?.(0);
    set_current_frame(0);
    sync_is_playing();
  }, [sync_is_playing]);
  const pause = useCallback(() => {
    threejs_mngr_ref.current?.pause?.();
    sync_is_playing();
  }, [sync_is_playing]);

  const cleanup_player = useCallback(() => threejs_mngr_ref.current?.cleanup_player?.(), []);
  const cleanup_loop = useCallback(() => threejs_mngr_ref.current?.cleanup_loop?.(), []);
  const cleanup_thumbnail_render = useCallback(() => threejs_mngr_ref.current?.cleanup_thumbnail_render?.(), []);
  const print_scene_components = useCallback(() => threejs_mngr_ref.current?.print_scene_components?.(), []);

  // const is_playing = useCallback(() => threejs_mngr_ref.current?.is_playing?.() ?? false, []);

  const value = useMemo<ThreeJSEngineContext>(
    () => ({
      threejs_scene_ref,

      selected_motion,
      set_selected_motion,

      frame_count,
      current_frame,

      load_motion_file,
      go_to_frame,
      play_pause,
      stop,
      pause,

      cleanup_player,
      cleanup_loop,
      cleanup_thumbnail_render,
      print_scene_components,
      get_thumbnail_for_frame,
      is_playing,
    }),
    [
      selected_motion,
      frame_count,
      current_frame,
      load_motion_file,
      go_to_frame,
      play_pause,
      stop,
      pause,
      cleanup_player,
      cleanup_loop,
      cleanup_thumbnail_render,
      print_scene_components,
      get_thumbnail_for_frame,
      is_playing,
    ],
  );

  return <three_js_engine_context.Provider value={value}>{children}</three_js_engine_context.Provider>;
}

export const useThreeJSEngine = () => {
  const ctx = useContext(three_js_engine_context);
  if (!ctx) throw new Error('useThreeJSEngine must be used within a ThreeJSEngineProvider');
  return ctx;
};
