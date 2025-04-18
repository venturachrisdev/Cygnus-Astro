import { create } from 'zustand';

export interface MountDevice {
  id: string;
  name: string;
}

interface MountStore {
  isConnected: boolean;
  isParked: boolean;
  isSlewing: boolean;
  isHome: boolean;
  isTracking: boolean;
  trackingMode: string | null;
  currentDevice: MountDevice | null;
  devices: MountDevice[];
  setCurrentDevice: (device: MountDevice) => void;
  setMount: (options: Partial<MountStore>) => void;
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

  setCurrentDevice: (device) => set({ currentDevice: device }),
  setMount: (options) => set({ ...options }),
}));
