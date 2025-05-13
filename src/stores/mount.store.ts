import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface MountStore {
  isConnected: boolean;
  isParked: boolean;
  isSlewing: boolean;
  isHome: boolean;
  isTracking: boolean;
  trackingMode: string | null;
  siderealTime: string;
  latitude: number;
  longitude: number;
  elevation: number;
  sideOfPier: string;
  ra: string;
  dec: string;
  timeToMeridianFlip: number;
  epoch: string;

  currentDevice: Device | null;
  devices: Device[];
  set: (options: Partial<MountStore>) => void;
}

export const useMountStore = create<MountStore>((set) => ({
  isConnected: false,
  isParked: false,
  isSlewing: false,
  isHome: false,
  isTracking: false,
  trackingMode: null,
  devices: [],
  currentDevice: null,
  siderealTime: '',
  latitude: 0,
  longitude: 0,
  elevation: 0,
  sideOfPier: '',
  ra: '',
  dec: '',
  timeToMeridianFlip: 0,
  epoch: '',

  set: (options) => set({ ...options }),
}));
