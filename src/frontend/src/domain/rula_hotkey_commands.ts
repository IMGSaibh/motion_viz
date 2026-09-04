import type { RulaCategory } from '@/domain/datatypes';

export type RulaHotkeyContext = 'ROOT' | RulaCategory;
export type RulaFeatureMode = 'PRIMARY' | 'OPTIONAL';

export type RulaHotkeyState = {
  context: RulaHotkeyContext;
  feature_mode: RulaFeatureMode;
  pending_primary_index: number | null;
  pending_optional_indices: readonly number[];
};

export type RulaHotkeyCommand =
  | { type: 'OPEN_CATEGORY'; category: RulaCategory }
  | { type: 'SELECT_FEATURE'; feature_index: number; optional: boolean }
  | { type: 'ENABLE_OPTIONALS' }
  | { type: 'COMMIT_CATEGORY'; next_context: RulaHotkeyContext }
  | { type: 'COMMIT_LABEL' }
  | { type: 'BACK' };

type CategoryCommandConfig = {
  open_code: string;
  category: RulaCategory;
  primary_count: number;
  optional_count?: number;
  next_context: RulaHotkeyContext;
};

export const RULA_CATEGORY_COMMANDS: readonly CategoryCommandConfig[] = [
  {
    open_code: 'Digit1',
    category: 'CAT_UPPERARM',
    primary_count: 5,
    optional_count: 3,
    next_context: 'CAT_LOWERARM',
  },
  {
    open_code: 'Digit2',
    category: 'CAT_LOWERARM',
    primary_count: 3,
    next_context: 'CAT_WRIST',
  },
  {
    open_code: 'Digit3',
    category: 'CAT_WRIST',
    primary_count: 3,
    optional_count: 1,
    next_context: 'CAT_NECK',
  },
  {
    open_code: 'Digit4',
    category: 'CAT_NECK',
    primary_count: 4,
    optional_count: 2,
    next_context: 'CAT_TRUNK',
  },
  {
    open_code: 'Digit5',
    category: 'CAT_TRUNK',
    primary_count: 4,
    optional_count: 2,
    next_context: 'CAT_LEGS',
  },
  { open_code: 'Digit6', category: 'CAT_LEGS', primary_count: 1, next_context: 'ROOT' },
];

export const INITIAL_RULA_HOTKEY_STATE: RulaHotkeyState = {
  context: 'ROOT',
  feature_mode: 'PRIMARY',
  pending_primary_index: null,
  pending_optional_indices: [],
};

export function resolve_rula_hotkey_command(state: RulaHotkeyState, code: string): RulaHotkeyCommand | null {
  if (code === 'Escape') return { type: 'BACK' };

  if (state.context === 'ROOT') {
    const normalized_code = code.replace('Numpad', 'Digit');
    const category = RULA_CATEGORY_COMMANDS.find((candidate) => candidate.open_code === normalized_code);
    if (category) return { type: 'OPEN_CATEGORY', category: category.category };
    if (code === 'Enter') return { type: 'COMMIT_LABEL' };
    return null;
  }

  const config = RULA_CATEGORY_COMMANDS.find((candidate) => candidate.category === state.context);
  if (!config) return null;
  if (code === 'Tab' && config.optional_count) return { type: 'ENABLE_OPTIONALS' };
  if (code === 'Enter') return { type: 'COMMIT_CATEGORY', next_context: config.next_context };

  const match = /^(?:Digit|Numpad)([1-9])$/.exec(code);
  if (!match) return null;
  const keyed_index = Number(match[1]) - 1;
  const optional = state.feature_mode === 'OPTIONAL';
  const available_count = optional ? (config.optional_count ?? 0) : config.primary_count;
  if (keyed_index >= available_count) return null;
  const feature_index = optional ? config.primary_count + keyed_index : keyed_index;
  return { type: 'SELECT_FEATURE', feature_index, optional };
}

export function transition_rula_hotkey_state(state: RulaHotkeyState, command: RulaHotkeyCommand): RulaHotkeyState {
  switch (command.type) {
    case 'OPEN_CATEGORY':
      return {
        ...state,
        context: command.category,
        feature_mode: 'PRIMARY',
        pending_primary_index: null,
        pending_optional_indices: [],
      };
    case 'SELECT_FEATURE':
      if (!command.optional) return { ...state, pending_primary_index: command.feature_index };
      return {
        ...state,
        pending_optional_indices: state.pending_optional_indices.includes(command.feature_index)
          ? state.pending_optional_indices.filter((index) => index !== command.feature_index)
          : [...state.pending_optional_indices, command.feature_index],
      };
    case 'ENABLE_OPTIONALS':
      return { ...state, feature_mode: 'OPTIONAL' };
    case 'COMMIT_CATEGORY':
      return {
        ...state,
        context: command.next_context,
        feature_mode: 'PRIMARY',
        pending_primary_index: null,
        pending_optional_indices: [],
      };
    case 'COMMIT_LABEL':
      return { ...INITIAL_RULA_HOTKEY_STATE };
    case 'BACK':
      return state.context === 'ROOT'
        ? { ...INITIAL_RULA_HOTKEY_STATE }
        : {
            ...state,
            context: 'ROOT',
            feature_mode: 'PRIMARY',
            pending_primary_index: null,
            pending_optional_indices: [],
          };
  }
}
