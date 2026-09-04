import { Chip } from '@mui/material';
import { use_rula_hotkey_context } from '@/context/context_rula_hotkeys';
import { HOTKEY_MODE } from '@/domain/hotkey_mode';

export function WidgetHotkeyMode() {
  const { hotkeyMode: mode } = use_rula_hotkey_context();

  return <Chip label={HOTKEY_MODE[mode]} color={mode === 'RULA_LABELING' ? 'primary' : 'default'} size="small" />;
}
