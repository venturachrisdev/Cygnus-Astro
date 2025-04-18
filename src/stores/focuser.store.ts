import { create } from 'zustand';

interface FocuserStore {
  isConnected: boolean;
  isMoving: boolean;
  position: number;
  stepSize: number;
  temperature: number;

  set: (options: Partial<FocuserStore>) => void;
}

export const useFocuserStore = create<FocuserStore>((set) => ({
  isConnected: false,
  isMoving: false,
  position: 0,
  stepSize: 0,
  temperature: 0,

  set: (options) => set({ ...options }),
}));
