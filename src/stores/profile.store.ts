import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface Horizon {
  altitudes: number[];
  azimuths: number[];
}

interface ProfileStore {
  isLoading: boolean;

  profiles: Device[];
  activeProfile: Device | null;
  description: string;
  lastUsed: string;

  horizon: Horizon;

  set: (options: Partial<ProfileStore>) => void;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  isLoading: false,

  profiles: [],
  activeProfile: null,
  description: '',
  lastUsed: '',

  horizon: { altitudes: [], azimuths: [] },

  set: (options) => set({ ...options }),
}));
