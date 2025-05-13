import { create } from 'zustand';

interface AlertsStore {
  message: string | null;
  type: 'error' | 'info' | 'warning' | 'success' | null;

  set: (options: Partial<AlertsStore>) => void;
}

export const useAlertsStore = create<AlertsStore>((set) => ({
  message: null,
  type: null,

  set: (options) => set({ ...options }),
}));
