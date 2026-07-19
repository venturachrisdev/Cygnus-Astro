import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface TPPAStore {
  isRunning: boolean;
  isPaused: boolean;
  didPlatesolveFail: boolean;

  status: string | null;
  progress: number;

  altitudeError: number;
  azimuthError: number;
  totalError: number;

  // start-alignment settings sent in the JSON payload
  startFromCurrentPosition: boolean;
  targetDistance: number;

  set: (options: Partial<TPPAStore>) => void;
}

export const useTPPAStore = create<TPPAStore>()(
  persist(
    (set) => ({
      isRunning: false,
      isPaused: false,
      didPlatesolveFail: false,

      status: null,
      progress: 0,

      altitudeError: 0,
      azimuthError: 0,
      totalError: 0,

      // matches the TPPA plugin's own defaults
      startFromCurrentPosition: false,
      targetDistance: 10,

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
        startFromCurrentPosition: state.startFromCurrentPosition,
        targetDistance: state.targetDistance,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
