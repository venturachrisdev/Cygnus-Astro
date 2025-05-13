import { create } from 'zustand';

import type { Device } from '@/actions/constants';

export interface Filter {
  id: number;
  name: string;
}

interface FilterWheelStore {
  isConnected: false;
  isMoving: false;
  currentFilter: number | null;
  availableFilters: Filter[];

  currentDevice: Device | null;
  devices: Device[];

  set: (options: Partial<FilterWheelStore>) => void;
}

export const useFilterWheelStore = create<FilterWheelStore>((set) => ({
  isConnected: false,
  currentFilter: null,
  availableFilters: [],
  isMoving: false,
  currentDevice: null,
  devices: [],

  set: (options) => set({ ...options }),
}));
