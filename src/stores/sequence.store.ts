import { create } from 'zustand';

export interface ImageDetails {
  index: number;
  image: string | null;
  hfr: number;
  mean: number;
  date: string;
  duration: number;
  filter: string;
}

interface SequenceStore {
  isRunning: boolean;
  isLoadingImages: boolean;
  images: ImageDetails[];
  sequence: any[];

  set: (options: Partial<SequenceStore>) => void;
}

export const useSequenceStore = create<SequenceStore>((set) => ({
  isRunning: false,
  isLoadingImages: false,
  images: [],
  sequence: [],

  set: (options) => set({ ...options }),
}));
