import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface GuidingUnit {
  pixels: number;
  arcseconds: number;
}

export interface RMSError {
  RA: GuidingUnit;
  Dec: GuidingUnit;
  total: GuidingUnit;
}

export interface RMSGraph {
  id: number;
  raDistance: number;
  decDistance: number;
  dither: boolean;
}

interface GuiderStore {
  isConnected: boolean;
  isGuiding: boolean;
  error: RMSError | null;
  pixelScale: number;
  graph: RMSGraph[];

  currentDevice: Device | null;
  devices: Device[];

  set: (options: Partial<GuiderStore>) => void;
}

export const useGuiderStore = create<GuiderStore>((set) => ({
  isConnected: false,
  isGuiding: false,
  error: null,
  pixelScale: 0,
  graph: [],

  currentDevice: null,
  devices: [],

  set: (options) => set({ ...options }),
}));
