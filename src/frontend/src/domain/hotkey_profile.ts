export enum HotkeyProfile {
  PLAY_PROFILE = 'PLAY_PROFILE',
  RULA_PROFILE = 'RULA_PROFILE',
  OWAS_PROFILE = 'OWAS_PROFILE',
}

export const HOTKEY_PROFILE: Readonly<Record<HotkeyProfile, string>> = {
  [HotkeyProfile.PLAY_PROFILE]: 'Profile: Play',
  [HotkeyProfile.RULA_PROFILE]: 'Profile: RULA',
  [HotkeyProfile.OWAS_PROFILE]: 'Profile: OWAS',
};

export const INITIAL_HOTKEY_PROFILE: HotkeyProfile = HotkeyProfile.RULA_PROFILE;

export function toggle_hotkey_profile(hotkey_profile: HotkeyProfile): HotkeyProfile {
  if (hotkey_profile === HotkeyProfile.PLAY_PROFILE) return HotkeyProfile.RULA_PROFILE;
  if (hotkey_profile === HotkeyProfile.RULA_PROFILE) return HotkeyProfile.OWAS_PROFILE;
  return HotkeyProfile.PLAY_PROFILE;
}
