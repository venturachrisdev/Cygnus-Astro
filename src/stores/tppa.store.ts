import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TPPAStore {
  isRunning: boolean;
  isPaused: boolean;
  didPlatesolveFail: boolean;

  altitudeError: number;
  azimuthError: number;
  totalError: number;

  set: (options: Partial<TPPAStore>) => void;
}

export const useTPPAStore = create<TPPAStore>()(
  persist(
    (set) => ({
      isRunning: false,
      isPaused: false,
      didPlatesolveFail: false,

      altitudeError: 0,
      azimuthError: 0,
      totalError: 0,

      set: (options) => set({ ...options }),
    }),
    {
      name: 'Cygnus__TPPA',
      partialize: (state) => ({
        isRunning: state.isRunning,
        isPaused: state.isPaused,
        altitudeError: state.altitudeError,
        azimuthError: state.azimuthError,
        totalError: state.totalError,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
