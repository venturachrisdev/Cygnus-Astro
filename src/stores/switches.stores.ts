import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface ReadableSwitch extends Device {
  value: number;
}

interface WritableSwitch extends ReadableSwitch {
  minValue: number;
  maxValue: number;
  targetValue: number;
  stepSize: number;
}

interface SwitchesStore {
  isConnected: false;

  currentDevice: Device | null;
  devices: Device[];
  readSwitches: ReadableSwitch[];
  writeSwitches: WritableSwitch[];

  set: (options: Partial<SwitchesStore>) => void;
}

export const useSwitchesStore = create<SwitchesStore>((set) => ({
  isConnected: false,
  currentDevice: null,
  devices: [],
  readSwitches: [],
  writeSwitches: [],

  set: (options) => set({ ...options }),
}));
