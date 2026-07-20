import { create } from 'zustand';

import { ApplicationTab } from '@/stores/config.store';

export interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  member: string;
  line: string;
  message: string;
}

interface ApplicationStore {
  currentTab: ApplicationTab;
  plugins: string[];
  logs: LogEntry[];
  ninaVersion: string | null;

  screenshot: string | null;
  isScreenshotLoading: boolean;

  set: (options: Partial<ApplicationStore>) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  currentTab: ApplicationTab.EQUIPMENT,
  plugins: [],
  logs: [],
  ninaVersion: null,

  screenshot: null,
  isScreenshotLoading: false,

  set: (options) => set({ ...options }),
}));
