import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface DomeStore {
  isConnected: boolean;

  currentDevice: Device | null;
  devices: Device[];

  shutterStatus: string;
  isParked: boolean;
  isHome: boolean;
  isSlewing: boolean;
  isFollowing: boolean;
  isSynchronized: boolean;

  azimuth: number;

  set: (options: Partial<DomeStore>) => void;
}

export const useDomeStore = create<DomeStore>((set) => ({
  isConnected: false,
  currentDevice: null,
  devices: [],

  shutterStatus: '',
  isParked: false,
  isHome: false,
  isSlewing: false,
  isFollowing: false,
  isSynchronized: false,

  azimuth: 0,

  set: (options) => set({ ...options }),
}));
