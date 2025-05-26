import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface FlatPanelStore {
  isConnected: boolean;

  currentDevice: Device | null;
  devices: Device[];

  coverState: string;
  lightOn: boolean;
  brightness: number;
  minBrightness: number;
  maxBrightness: number;

  set: (options: Partial<FlatPanelStore>) => void;
}

export const useFlatPanelStore = create<FlatPanelStore>((set) => ({
  isConnected: false,
  currentDevice: null,
  devices: [],

  coverState: '',
  lightOn: false,
  brightness: 0,
  minBrightness: 0,
  maxBrightness: 0,

  set: (options) => set({ ...options }),
}));
