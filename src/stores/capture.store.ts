import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface CaptureStore {
  showGuiding: boolean;
  showMountControl: boolean;
  showFocuserControl: boolean;
  showSequenceControl: boolean;

  set: (options: Partial<CaptureStore>) => void;
}

export const useCaptureStore = create<CaptureStore>()(
  persist(
    (set) => ({
      showGuiding: false,
      showFocuserControl: false,
      showMountControl: false,
      showSequenceControl: false,

      set: (options) => set({ ...options }),
    }),
    {
      name: 'Cygnus__Capture',
      partialize: (state) => ({
        showGuiding: state.showGuiding,
        showFocuserControl: state.showFocuserControl,
        showMountControl: state.showMountControl,
        showSequenceControl: state.showSequenceControl,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
