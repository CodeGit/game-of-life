import type { ValueOf } from '@/utils/types';

export const MENU_ACTIONS = {
  NEW_GAME: 'new_game',
  END_GAME: 'end_game',
  LOAD_GAME: 'load_game',
  SAVE_GAME: 'save_game',
} as const;

export type MenuAction = ValueOf<typeof MENU_ACTIONS>;
