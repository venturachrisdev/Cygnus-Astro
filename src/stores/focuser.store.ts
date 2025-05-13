import { create } from 'zustand';

import type { Device } from '@/actions/constants';

interface FocusPoint {
  position: number;
  value: number;
  error: number;
}

interface AutoFocusRun {
  filter: string;
  date: string;
  temperature: number;
  method: string;
  duration: string;

  calculatedFocusPoint: FocusPoint;
  previousFocusPoint: FocusPoint;
  initialFocusPoint: FocusPoint;

  quadraticR2: number;
  hyperbolicR2: number;

  points: FocusPoint[];
}

interface FocuserStore {
  isConnected: boolean;
  isMoving: boolean;
  position: number;
  stepSize: number;
  temperature: number;
  isAutofocusing: boolean;
  lastAutoFocusRun: AutoFocusRun | null;

  currentDevice: Device | null;
  devices: Device[];

  set: (options: Partial<FocuserStore>) => void;
}

export const useFocuserStore = create<FocuserStore>((set) => ({
  isConnected: false,
  isMoving: false,
  position: 0,
  stepSize: 0,
  temperature: 0,
  currentDevice: null,
  devices: [],
  isAutofocusing: false,
  lastAutoFocusRun: null,

  set: (options) => set({ ...options }),
}));
