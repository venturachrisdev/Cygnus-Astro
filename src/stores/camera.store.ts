import { create } from 'zustand';

import type { Device } from '@/actions/constants';

export interface CameraStore {
  image: string | null;
  isConnected: boolean;
  isCapturing: boolean;
  isLoading: boolean;
  canCapture: boolean;
  countdown: number;
  loop: boolean;
  platesolve: boolean;
  cooling: boolean;
  dewHeater: boolean;
  temperature: number;
  duration: number;
  currentDevice: Device | null;
  devices: Device[];
  exposureEndTime: string | null;

  gain: number;
  offset: number;
  pixelSize: number;
  isExposing: boolean;
  readoutModes: string[];
  readoutMode: number;

  customGain: number | null;
  customOffset: number | null;

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
  platesolve: false,
  cooling: false,
  dewHeater: false,
  temperature: 0,
  duration: 1,
  currentDevice: null,
  devices: [],
  gain: 0,
  offset: 0,
  pixelSize: 0,
  isExposing: false,
  readoutModes: [],
  readoutMode: 0,
  customGain: null,
  customOffset: null,
  exposureEndTime: null,

  set: (options) => set({ ...options }),
}));
