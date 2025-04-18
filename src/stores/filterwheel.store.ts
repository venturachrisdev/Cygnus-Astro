import { create } from 'zustand';

export interface Filter {
  id: number;
  name: string;
}

interface FilterWheelStore {
  isConnected: false;
  isMoving: false;
  currentFilter: number | null;
  availableFilters: Filter[];

  set: (options: Partial<FilterWheelStore>) => void;
}

export const useFilterWheelStore = create<FilterWheelStore>((set) => ({
  isConnected: false,
  currentFilter: null,
  availableFilters: [],
  isMoving: false,

  set: (options) => set({ ...options }),
}));
