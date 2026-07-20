import { create } from 'zustand';

export type FlatsMode =
  | 'auto-exposure'
  | 'auto-brightness'
  | 'skyflat'
  | 'trained-flat'
  | 'trained-dark-flat';

interface FlatsStore {
  isRunning: boolean;

  /* flats/status fields as reported by NINA */
  state: string;
  totalIterations: number;
  completedIterations: number;

  /* wizard selection */
  mode: FlatsMode;

  /*
    Last-used parameter values. Numeric params are kept as strings because
    they back TextInput fields and must preserve in-progress input like a
    trailing decimal point; they are converted to numbers when a run starts.
  */
  count: string;
  minExposure: string;
  maxExposure: string;
  histogramMean: string;
  meanTolerance: string;
  brightness: string;
  minBrightness: string;
  maxBrightness: string;
  exposureTime: string;
  filterId: string;
  binning: string;
  dither: boolean;
  keepClosed: boolean;

  set: (options: Partial<FlatsStore>) => void;
}

export const useFlatsStore = create<FlatsStore>((set) => ({
  isRunning: false,

  state: '',
  totalIterations: 0,
  completedIterations: 0,

  mode: 'auto-exposure',

  count: '10',
  minExposure: '',
  maxExposure: '',
  histogramMean: '',
  meanTolerance: '',
  brightness: '',
  minBrightness: '',
  maxBrightness: '',
  exposureTime: '',
  filterId: '',
  binning: '',
  dither: false,
  keepClosed: false,

  set: (options) => set({ ...options }),
}));
