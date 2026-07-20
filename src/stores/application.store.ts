import { create } from 'zustand';

export interface LogEntry {
  timestamp: string;
  level: string;
  source: string;
  member: string;
  line: string;
  message: string;
}

interface ApplicationStore {
  logs: LogEntry[];
  ninaVersion: string | null;

  screenshot: string | null;
  isScreenshotLoading: boolean;

  set: (options: Partial<ApplicationStore>) => void;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  logs: [],
  ninaVersion: null,

  screenshot: null,
  isScreenshotLoading: false,

  set: (options) => set({ ...options }),
}));
