import { create } from 'zustand';

const MAX_EVENTS = 200;

export interface ActivityEvent {
  id: string;
  event: string;
  label: string;
  time: number;
}

interface EventsStore {
  events: ActivityEvent[];

  set: (options: Partial<EventsStore>) => void;
  addEvent: (event: ActivityEvent) => void;
}

export const useEventsStore = create<EventsStore>((set) => ({
  events: [],

  set: (options) => set({ ...options }),
  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, MAX_EVENTS),
    })),
}));
