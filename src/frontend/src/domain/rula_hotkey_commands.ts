import type { RulaCategory, RulaSelection } from '@/domain/datatypes';

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

export type RulaHotkeyCommand =
  | { type: 'select-category'; category: RulaCategory }
  | { type: 'select-primary'; category: RulaCategory; featureId: number }
  | { type: 'toggle-optional'; category: RulaCategory; featureId: number }
  | { type: 'save' }
  | { type: 'reset' };

export type RulaHotkeyInput = {
  key: string;
  code?: string;
};

export type RulaHotkeyResult = {
  state: RulaHotkeyState;
  command?: RulaHotkeyCommand;
};

const RULA_CATEGORIES: readonly RulaCategory[] = [
  'CAT_UPPERARM',
  'CAT_LOWERARM',
  'CAT_WRIST',
  'CAT_NECK',
  'CAT_TRUNK',
  'CAT_LEGS',
];

const PRIMARY_FEATURE_COUNT: Readonly<Record<RulaCategory, number>> = {
  CAT_UPPERARM: 5,
  CAT_LOWERARM: 3,
  CAT_WRIST: 3,
  CAT_NECK: 4,
  CAT_TRUNK: 4,
  CAT_LEGS: 1,
};

const OPTIONAL_FEATURE_IDS: Readonly<Partial<Record<RulaCategory, readonly number[]>>> = {
  CAT_UPPERARM: [6, 7, 8],
  CAT_WRIST: [4],
  CAT_NECK: [5, 6],
  CAT_TRUNK: [5, 6],
};

function get_digit(key: string, code?: string): number | null {
  const codeDigit = code?.match(/^Digit([1-8])$/)?.[1];
  const digit = Number(codeDigit ?? key);
  return Number.isInteger(digit) && digit >= 1 && digit <= 8 ? digit : null;
}

export function resolve_rula_hotkey(state: RulaHotkeyState, input: RulaHotkeyInput): RulaHotkeyResult {
  if (input.key === 'Escape') return { state: INITIAL_RULA_HOTKEY_STATE, command: { type: 'reset' } };
  if (input.key === 'Enter') return { state, command: { type: 'save' } };

  const digit = get_digit(input.key, input.code);
  if (digit === null) return { state };

  if (state.context === RulaHotkeyContext.ROOT && digit > 6) return { state };

  if (state.context === RulaHotkeyContext.ROOT) {
    return {
      state: { context: RULA_CATEGORIES[digit - 1] },
      command: { type: 'select-category', category: RULA_CATEGORIES[digit - 1] },
    };
  }

  const category = state.context;
  const primaryFeatureCount = PRIMARY_FEATURE_COUNT[category];
  if (digit <= primaryFeatureCount) {
    return { state, command: { type: 'select-primary', category, featureId: digit } };
  }

  if (OPTIONAL_FEATURE_IDS[category]?.includes(digit)) {
    return {
      state,
      command: { type: 'toggle-optional', category, featureId: digit },
    };
  }

  return { state };
}

function hasOptionalFeatures(
  category: RulaCategory,
): category is 'CAT_UPPERARM' | 'CAT_WRIST' | 'CAT_NECK' | 'CAT_TRUNK' {
  return category !== 'CAT_LOWERARM' && category !== 'CAT_LEGS';
}

export function apply_rula_hotkey_command(selection: RulaSelection, command: RulaHotkeyCommand): RulaSelection {
  if (command.type === 'select-primary') {
    if (hasOptionalFeatures(command.category)) {
      return {
        ...selection,
        [command.category]: { ...selection[command.category], feature_id: command.featureId },
      };
    }
    return { ...selection, [command.category]: command.featureId };
  }

  if (command.type === 'toggle-optional' && hasOptionalFeatures(command.category)) {
    const categorySelection = selection[command.category];
    const optionalFeatureIds = categorySelection.optional_feature_ids.includes(command.featureId)
      ? categorySelection.optional_feature_ids.filter((id) => id !== command.featureId)
      : [...categorySelection.optional_feature_ids, command.featureId];
    return {
      ...selection,
      [command.category]: { ...categorySelection, optional_feature_ids: optionalFeatureIds },
    };
  }

  return selection;
}
