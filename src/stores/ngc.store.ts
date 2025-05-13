import { create } from 'zustand';

export interface NGCObject {
  id: string;
  names: string;
  ra: string;
  dec: string;
  type: string;
}

interface NGCStore {
  isRunning: boolean;
  results: NGCObject[];
  selectedObject: NGCObject | null;

  set: (options: Partial<NGCStore>) => void;
}

export const useNGCStore = create<NGCStore>((set) => ({
  isRunning: false,
  results: [],
  selectedObject: null,

  set: (options) => set({ ...options }),
}));
