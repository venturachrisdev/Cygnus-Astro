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
  rainRate: string;
  skyBrightness: string;
  skyQuality: string;
  skyTemperature: string;
  starFWHM: string;
  temperature: number;
  windDirection: number;
  windGust: string;
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
  rainRate: '',
  skyBrightness: '',
  skyQuality: '',
  skyTemperature: '',
  starFWHM: '',
  temperature: 0,
  windDirection: 0,
  windGust: '',
  windSpeed: 0,

  set: (options) => set({ ...options }),
}));
