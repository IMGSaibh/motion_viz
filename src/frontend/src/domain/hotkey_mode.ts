export type HotkeyMode = 'PLAY_MODE' | 'RULA_LABELING';

export const HOTKEY_MODE: Readonly<Record<HotkeyMode, string>> = {
  PLAY_MODE: 'Mode: Play',
  RULA_LABELING: 'Mode: Labeling',
};

export const INITIAL_HOTKEY_MODE: HotkeyMode = 'PLAY_MODE';

export function toggle_hotkey_profile(hotkey_mode: HotkeyMode): HotkeyMode {
  return hotkey_mode === 'PLAY_MODE' ? 'RULA_LABELING' : 'PLAY_MODE';
}
