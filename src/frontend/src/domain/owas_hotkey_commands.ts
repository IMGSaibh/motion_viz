import type { OwasCategory, OwasSelection } from '@/domain/datatypes';

export enum OwasHotkeyContext {
  ROOT = 'ROOT',
}

export type OwasHotkeyState = {
  context: OwasHotkeyContext | OwasCategory;
};

export const INITIAL_OWAS_HOTKEY_STATE: OwasHotkeyState = {
  context: OwasHotkeyContext.ROOT,
};

export type OwasHotkeyCommand =
  | { type: 'select-category'; category: OwasCategory }
  | { type: 'select-feature'; category: OwasCategory; featureId: number }
  | { type: 'save' }
  | { type: 'reset' };

export type OwasHotkeyInput = {
  key: string;
  code?: string;
};

export type OwasHotkeyResult = {
  state: OwasHotkeyState;
  command?: OwasHotkeyCommand;
};

const OWAS_CATEGORIES: readonly OwasCategory[] = ['CAT_BACK', 'CAT_ARMS', 'CAT_LEGS', 'CAT_LOAD'];

const FEATURE_COUNT: Readonly<Record<OwasCategory, number>> = {
  CAT_BACK: 4,
  CAT_ARMS: 3,
  CAT_LEGS: 7,
  CAT_LOAD: 3,
};

function get_digit(key: string, code?: string): number | null {
  const codeDigit = code?.match(/^Digit([1-8])$/)?.[1];
  const digit = Number(codeDigit ?? key);
  return Number.isInteger(digit) && digit >= 1 && digit <= 8 ? digit : null;
}

export function resolve_owas_hotkey(state: OwasHotkeyState, input: OwasHotkeyInput): OwasHotkeyResult {
  if (input.key === 'Escape') return { state: INITIAL_OWAS_HOTKEY_STATE, command: { type: 'reset' } };
  if (input.key === 'Enter') return { state, command: { type: 'save' } };

  const digit = get_digit(input.key, input.code);
  if (digit === null) return { state };

  if (state.context === OwasHotkeyContext.ROOT) {
    if (digit > OWAS_CATEGORIES.length) return { state };
    const category = OWAS_CATEGORIES[digit - 1];
    return { state: { context: category }, command: { type: 'select-category', category } };
  }

  const category = state.context;
  if (digit > FEATURE_COUNT[category]) return { state };
  return { state, command: { type: 'select-feature', category, featureId: digit } };
}

export function apply_owas_hotkey_command(selection: OwasSelection, command: OwasHotkeyCommand): OwasSelection {
  if (command.type !== 'select-feature') return selection;
  return { ...selection, [command.category]: command.featureId };
}