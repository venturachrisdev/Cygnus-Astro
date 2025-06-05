import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { NGCObject } from './ngc.store';

interface FavoritesList {
  name: string;
  targets: NGCObject[];
}

interface FavoritesStore {
  lists: FavoritesList[];
  set: (options: Partial<FavoritesStore>) => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set) => ({
      lists: [],
      set: (options) => set({ ...options }),
    }),
    {
      name: 'Cygnus__Favorites',
      partialize: (state) => ({
        lists: state.lists,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
