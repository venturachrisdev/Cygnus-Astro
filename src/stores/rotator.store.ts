import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface RotatorStore {
  isConnected: boolean;
  isMoving: boolean;
  position: number;
  stepSize: number;

  currentDevice: Device | null;
  devices: Device[];

  set: (options: Partial<RotatorStore>) => void;
}

export const useRotatorStore = create<RotatorStore>((set) => ({
  isConnected: false,
  isMoving: false,
  currentDevice: null,
  position: 0,
  stepSize: 0,
  devices: [],

  set: (options) => set({ ...options }),
}));
