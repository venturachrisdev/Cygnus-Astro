import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Device } from '@/actions/constants';

export const NINAConfigMap: Record<string, string> = {
  'astrometry.latitude': 'AstrometrySettings-Latitude',
  'astrometry.longitude': 'AstrometrySettings-Longitude',
  'astrometry.elevation': 'AstrometrySettings-Elevation',
  'telescope.focalLength': 'TelescopeSettings-FocalLength',
  'telescope.focalRatio': 'TelescopeSettings-FocalRatio',
  'telescope.name': 'TelescopeSettings-Name',
};

interface EventLog {
  message: string;
  time: string;
}

export enum ApplicationTab {
  EQUIPMENT = 'equipment',
  SKY_ATLAS = 'skyatlas',
  FRAMING = 'framing',
  FLAT_WIZARD = 'flatwizard',
  SEQUENCER = 'sequencer',
  IMAGING = 'imaging',
  OPTIONS = 'options',
}

export interface ProfileConfig {
  astrometry: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  telescope: {
    name: string | null;
    focalLength: number;
    focalRatio: number;
  };
  snapshot: {
    duration: number;
  };
}

interface ConfigStore {
  isLoading: boolean;
  isConnected: boolean;
  apiVersion: string | null;

  currentDevice: Device | null;
  devices: Device[];
  profiles: Device[];
  currentProfile: Device | null;
  logs: EventLog[];

  config: ProfileConfig;
  draftConfig: ProfileConfig;

  set: (options: Partial<ConfigStore>) => void;
}

const profileConfigInitialState: ProfileConfig = {
  astrometry: {
    latitude: 0,
    longitude: 0,
    elevation: 0,
  },
  telescope: {
    name: null,
    focalLength: 0,
    focalRatio: 0,
  },
  snapshot: {
    duration: 0,
  },
};

export const useConfigStore = create<ConfigStore>()(
  persist(
    (set) => ({
      isLoading: false,
      isConnected: false,
      currentDevice: null,
      apiVersion: null,
      devices: [],
      profiles: [],
      currentProfile: null,
      logs: [],

      config: profileConfigInitialState,
      draftConfig: profileConfigInitialState,

      set: (options) => set({ ...options }),
    }),
    {
      name: 'Cygnus__Config',
      partialize: (state) => ({
        currentDevice: state.currentDevice,
      }),
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
