import { createContext, useContext, useState } from 'react';
import { HotkeyProfile, INITIAL_HOTKEY_PROFILE } from '@/domain/hotkey_profile';
import { INITIAL_RULA_HOTKEY_STATE } from '@/domain/rula_hotkey_commands';
import type { RulaHotkeyState } from '@/domain/rula_hotkey_commands';
import { INITIAL_OWAS_HOTKEY_STATE } from '@/domain/owas_hotkey_commands';
import type { OwasHotkeyState } from '@/domain/owas_hotkey_commands';

type RulaHotkeyContextValue = {
  hotkey_profile: HotkeyProfile;
  set_hotkey_profile: React.Dispatch<React.SetStateAction<HotkeyProfile>>;
  rula_save_requested: boolean;
  set_rula_save_requested: React.Dispatch<React.SetStateAction<boolean>>;
  rula_hotkey_state: RulaHotkeyState;
  set_rula_hotkey_state: React.Dispatch<React.SetStateAction<RulaHotkeyState>>;
  owas_save_requested: boolean;
  set_owas_save_requested: React.Dispatch<React.SetStateAction<boolean>>;
  owas_hotkey_state: OwasHotkeyState;
  set_owas_hotkey_state: React.Dispatch<React.SetStateAction<OwasHotkeyState>>;
};

const rula_hotkey_context = createContext<RulaHotkeyContextValue | null>(null);

export function RulaHotkeyProvider({ children }: { children: React.ReactNode }) {
  const [hotkey_profile, set_hotkey_profile] = useState<HotkeyProfile>(INITIAL_HOTKEY_PROFILE);
  const [rula_save_requested, set_rula_save_requested] = useState(false);
  const [rula_hotkey_state, set_rula_hotkey_state] = useState<RulaHotkeyState>(INITIAL_RULA_HOTKEY_STATE);
  const [owas_save_requested, set_owas_save_requested] = useState(false);
  const [owas_hotkey_state, set_owas_hotkey_state] = useState<OwasHotkeyState>(INITIAL_OWAS_HOTKEY_STATE);
  return (
    <rula_hotkey_context.Provider
      value={{
        hotkey_profile,
        set_hotkey_profile,
        rula_save_requested,
        set_rula_save_requested,
        rula_hotkey_state,
        set_rula_hotkey_state,
        owas_save_requested,
        set_owas_save_requested,
        owas_hotkey_state,
        set_owas_hotkey_state,
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
