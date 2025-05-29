import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface WeatherStore {
  isConnected: boolean;

  currentDevice: Device | null;
  devices: Device[];

  cloudCover: number;
  dewPoint: number;
  humidity: number;
  pressure: number;
  rainRate: number;
  skyBrightness: number;
  skyQuality: number;
  skyTemperature: number;
  starFWHM: number;
  temperature: number;
  windDirection: number;
  windGust: number;
  windSpeed: number;

  set: (options: Partial<WeatherStore>) => void;
}

export const useWeatherStore = create<WeatherStore>((set) => ({
  isConnected: false,
  currentDevice: null,
  devices: [],

  cloudCover: 0,
  dewPoint: 0,
  humidity: 0,
  pressure: 0,
  rainRate: 0,
  skyBrightness: 0,
  skyQuality: 0,
  skyTemperature: 0,
  starFWHM: 0,
  temperature: 0,
  windDirection: 0,
  windGust: 0,
  windSpeed: 0,

  set: (options) => set({ ...options }),
}));
