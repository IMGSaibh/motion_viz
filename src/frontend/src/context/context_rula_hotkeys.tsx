import { createContext, useContext, useState } from 'react';
import { HotkeyProfile, INITIAL_HOTKEY_PROFILE } from '@/domain/hotkey_profile';

type RulaHotkeyContextValue = {
  hotkey_profile: HotkeyProfile;
  set_hotkey_profile: React.Dispatch<React.SetStateAction<HotkeyProfile>>;
};

const rula_hotkey_context = createContext<RulaHotkeyContextValue | null>(null);

export function RulaHotkeyProvider({ children }: { children: React.ReactNode }) {
  const [hotkey_profile, set_hotkey_profile] = useState<HotkeyProfile>(INITIAL_HOTKEY_PROFILE);
  return (
    <rula_hotkey_context.Provider
      value={{
        hotkey_profile,
        set_hotkey_profile,
      }}
    >
      {children}
    </rula_hotkey_context.Provider>
  );
}

export function use_rula_hotkey_context(): RulaHotkeyContextValue {
  const context = useContext(rula_hotkey_context);
  if (!context) throw new Error('use_rula_hotkey_context must be used within a RulaHotkeyProvider');
  return context;
}
