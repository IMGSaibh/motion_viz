import { Chip } from '@mui/material';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import { HOTKEY_PROFILE, HotkeyProfile } from '@/domain/hotkey_profile';

export function WidgetHotkeyProfile() {
  const { hotkey_profile } = use_rula_hotkey_context();

  return (
    <Chip
      label={HOTKEY_PROFILE[hotkey_profile]}
      color={hotkey_profile === HotkeyProfile.PLAY_PROFILE ? 'default' : 'primary'}
      size="small"
    />
  );
}
