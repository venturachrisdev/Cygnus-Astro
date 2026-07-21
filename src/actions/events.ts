import Axios from 'axios';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { WebSocketService } from '@/services/web-socket.service';
import type { ActivityEvent } from '@/stores/events.store';
import { useEventsStore } from '@/stores/events.store';

import { getApiUrl } from './hosts';

const activityEventsSocket = new WebSocketService();

/* Foreground notifications are silent by default in Expo unless a handler is set. */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const EVENT_LABELS: Record<string, string> = {
  'IMAGE-SAVE': 'Image saved',
  'AUTOFOCUS-FINISHED': 'Autofocus finished',
  'MOUNT-BEFORE-FLIP': 'Meridian flip starting',
  'MOUNT-AFTER-FLIP': 'Meridian flip complete',
  'SEQUENCE-STARTING': 'Sequence starting',
  'SEQUENCE-FINISHED': 'Sequence finished',
  'SEQUENCE-ENTITY-FAILED': 'Sequence step failed',
  'GUIDER-START': 'Guiding started',
  'GUIDER-STOP': 'Guiding stopped',
  'ERROR-AF': 'Autofocus error',
  'ERROR-PLATESOLVE': 'Plate solve error',
};

const NOTIFY_EVENTS = new Set<string>([
  'IMAGE-SAVE',
  'AUTOFOCUS-FINISHED',
  'MOUNT-BEFORE-FLIP',
  'MOUNT-AFTER-FLIP',
  'SEQUENCE-STARTING',
  'SEQUENCE-FINISHED',
  'SEQUENCE-ENTITY-FAILED',
  'GUIDER-START',
  'GUIDER-STOP',
  'ERROR-AF',
  'ERROR-PLATESOLVE',
]);

const getEventLabel = (event: string): string => EVENT_LABELS[event] ?? event;

const notifyForEvent = (label: string) => {
  Notifications.scheduleNotificationAsync({
    content: { title: label, body: '' },
    trigger: null,
  });
};

export const handleActivityEvent = (message: any) => {
  const event = message?.Response?.Event;

  if (!event) {
    return;
  }

  const label = getEventLabel(event);

  useEventsStore.getState().addEvent({
    id: `${Date.now()}-${Math.random()}`,
    event,
    label,
    time: Date.now(),
  });

  if (NOTIFY_EVENTS.has(event)) {
    notifyForEvent(label);
  }
};

export const initializeActivityEventsSocket = async () => {
  activityEventsSocket.connect('/v2/socket', handleActivityEvent);

  try {
    const { granted } = await Notifications.requestPermissionsAsync();

    /* Android 8+ drops notifications that are not posted to a channel. */
    if (granted && Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'N.I.N.A. activity',
        importance: Notifications.AndroidImportance.HIGH,
      });
    }
  } catch (e) {
    console.log('Error setting up notifications', e);
  }
};

export const disconnectActivityEventsSocket = () => {
  activityEventsSocket.disconnect();
};

export const fetchEventHistory = async () => {
  try {
    const response = (await Axios.get(`${await getApiUrl()}/event-history`))
      .data;

    const events: ActivityEvent[] = (response.Response ?? []).map(
      (item: any) => ({
        id: `${item.Time}-${item.Event}-${Math.random()}`,
        event: item.Event,
        label: getEventLabel(item.Event),
        /* the plugin serializes Time as an ISO date string, not an epoch number */
        time: new Date(item.Time).getTime(),
      }),
    );

    events.sort((a, b) => b.time - a.time);

    useEventsStore.getState().set({ events });

    return events;
  } catch (e) {
    console.log('Error getting event history', e);
  }

  return undefined;
};
