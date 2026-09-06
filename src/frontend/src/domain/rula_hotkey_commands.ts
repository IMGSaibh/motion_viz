import type { RulaCategory } from '@/domain/datatypes';

// is the neutral start state of the Hotkey Automaton.
// nothing is selected, and the user can open a category or commit a label.
export enum RulaHotkeyContext {
  ROOT = 'ROOT',
}

export type RulaHotkeyContextValue = RulaHotkeyContext | RulaCategory;

export type RulaHotkeyState = {
  context: RulaHotkeyContextValue;
};

export const INITIAL_RULA_HOTKEY_STATE: RulaHotkeyState = {
  context: RulaHotkeyContext.ROOT,
};
