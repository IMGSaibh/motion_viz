export enum HotkeyProfile {
  PLAY_PROFILE = 'PLAY_PROFILE',
  RULA_PROFILE = 'RULA_PROFILE',
}

export const HOTKEY_PROFILE: Readonly<Record<HotkeyProfile, string>> = {
  [HotkeyProfile.PLAY_PROFILE]: 'Profile: Play',
  [HotkeyProfile.RULA_PROFILE]: 'Profile: RULA',
};

export const INITIAL_HOTKEY_PROFILE: HotkeyProfile = HotkeyProfile.PLAY_PROFILE;

export function toggle_hotkey_profile(hotkey_profile: HotkeyProfile): HotkeyProfile {
  return hotkey_profile === HotkeyProfile.PLAY_PROFILE ? HotkeyProfile.RULA_PROFILE : HotkeyProfile.PLAY_PROFILE;
}
