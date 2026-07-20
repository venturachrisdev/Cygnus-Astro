import { create } from 'zustand';

export interface LiveStackImageRef {
  target: string;
  filter: string;
}

export interface LiveStackImageInfo {
  IsMonochrome: boolean;
  StackCount: number | null;
  RedStackCount: number | null;
  GreenStackCount: number | null;
  BlueStackCount: number | null;
  Filter: string;
  Target: string;
}

interface LivestackStore {
  isRunning: boolean;
  status: string;

  availableImages: LiveStackImageRef[];

  currentImage: string | null;
  currentImageInfo: LiveStackImageInfo | null;
  isLoadingImage: boolean;

  selectedTarget: string | null;
  selectedFilter: string | null;

  set: (options: Partial<LivestackStore>) => void;
}

export const useLivestackStore = create<LivestackStore>((set) => ({
  isRunning: false,
  status: 'stopped',

  availableImages: [],

  currentImage: null,
  currentImageInfo: null,
  isLoadingImage: false,

  selectedTarget: null,
  selectedFilter: null,

  set: (options) => set({ ...options }),
}));
