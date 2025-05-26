import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface SafetyMonitorStore {
  isConnected: boolean;
  isSafe: boolean;

  currentDevice: Device | null;
  devices: Device[];

  set: (options: Partial<SafetyMonitorStore>) => void;
}

export const useSafetyMonitorStore = create<SafetyMonitorStore>((set) => ({
  isConnected: false,
  currentDevice: null,
  devices: [],
  isSafe: false,

  set: (options) => set({ ...options }),
}));
