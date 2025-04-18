import { create } from 'zustand';

export interface CameraStore {
  image: string | null;
  isConnected: boolean;
  isCapturing: boolean;
  isLoading: boolean;
  canCapture: boolean;
  countdown: number;
  loop: boolean;
  cooling: boolean;
  dewHeater: boolean;
  temperature: number;
  duration: number;

  set: (options: Partial<CameraStore>) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  image: null,
  isConnected: false,
  isCapturing: false,
  isLoading: false,
  canCapture: true,
  countdown: 0,
  loop: false,
  cooling: false,
  dewHeater: false,
  temperature: 0,
  duration: 1,

  set: (options) => set({ ...options }),
}));
