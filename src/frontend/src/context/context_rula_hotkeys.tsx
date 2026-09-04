import { createContext, useContext, useState } from 'react';
import { INITIAL_RULA_HOTKEY_STATE, type RulaHotkeyState } from '@/domain/rula_hotkey_commands';
import { HotkeyProfile, INITIAL_HOTKEY_PROFILE } from '@/domain/hotkey_profile';

type RulaHotkeyContextValue = {
  rula_hotkey_state: RulaHotkeyState;
  set_rula_hotkey_state: React.Dispatch<React.SetStateAction<RulaHotkeyState>>;
  hotkeyMode: HotkeyProfile;
  set_hotkeyMode: React.Dispatch<React.SetStateAction<HotkeyProfile>>;
};

const rula_hotkey_context = createContext<RulaHotkeyContextValue | null>(null);

export function RulaHotkeyProvider({ children }: { children: React.ReactNode }) {
  const [rula_hotkey_state, set_rula_hotkey_state] = useState<RulaHotkeyState>(INITIAL_RULA_HOTKEY_STATE);
  const [hotkeyMode, set_hotkeyMode] = useState<HotkeyProfile>(INITIAL_HOTKEY_PROFILE);
  return (
    <rula_hotkey_context.Provider value={{ rula_hotkey_state, set_rula_hotkey_state, hotkeyMode, set_hotkeyMode }}>
      {children}
    </rula_hotkey_context.Provider>
  );
}

export function use_rula_hotkey_context(): RulaHotkeyContextValue {
  const context = useContext(rula_hotkey_context);
  if (!context) throw new Error('use_rula_hotkey_context must be used within a RulaHotkeyProvider');
  return context;
}
