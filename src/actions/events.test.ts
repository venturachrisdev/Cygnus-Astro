import Axios from 'axios';

const socketInstances: Array<{
  connect: jest.Mock;
  disconnect: jest.Mock;
  send: jest.Mock;
}> = [];

jest.mock('@/services/web-socket.service', () => ({
  WebSocketService: jest.fn().mockImplementation(() => {
    const instance = {
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn(),
    };
    socketInstances.push(instance);
    return instance;
  }),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn().mockResolvedValue(undefined),
  AndroidImportance: { HIGH: 4 },
}));

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

// eslint-disable-next-line import/first
import * as Notifications from 'expo-notifications';

// eslint-disable-next-line import/first
import {
  disconnectActivityEventsSocket,
  fetchEventHistory,
  handleActivityEvent,
  initializeActivityEventsSocket,
} from '@/actions/events';
// eslint-disable-next-line import/first
import { useEventsStore } from '@/stores/events.store';

const activitySocket = socketInstances[0];

if (!activitySocket) {
  throw new Error('WebSocketService mock did not capture the events socket');
}

const mockedGet = Axios.get as jest.Mock;
const mockedScheduleNotificationAsync =
  Notifications.scheduleNotificationAsync as jest.Mock;

beforeEach(() => {
  useEventsStore.getState().set({ events: [] });
  mockedGet.mockReset();
  mockedScheduleNotificationAsync.mockClear();
});

describe('activity events socket lifecycle', () => {
  it('connects to the events socket and requests notification permissions', async () => {
    await initializeActivityEventsSocket();

    expect(activitySocket.connect).toHaveBeenCalledWith(
      '/v2/socket',
      handleActivityEvent,
    );
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('disconnects the events socket', () => {
    disconnectActivityEventsSocket();
    expect(activitySocket.disconnect).toHaveBeenCalledTimes(1);
  });
});

describe('handleActivityEvent', () => {
  it('adds a known event to the store with its friendly label', () => {
    handleActivityEvent({ Response: { Event: 'IMAGE-SAVE' } });

    const { events } = useEventsStore.getState();
    expect(events).toHaveLength(1);
    expect(events[0]?.event).toBe('IMAGE-SAVE');
    expect(events[0]?.label).toBe('Image saved');
  });

  it('falls back to the raw event name for an unknown event', () => {
    handleActivityEvent({ Response: { Event: 'SOME-FUTURE-EVENT' } });

    const { events } = useEventsStore.getState();
    expect(events[0]?.label).toBe('SOME-FUTURE-EVENT');
  });

  it('ignores messages with no Event field', () => {
    handleActivityEvent({ Response: {} });
    handleActivityEvent({});

    expect(useEventsStore.getState().events).toHaveLength(0);
  });

  it('schedules a notification for events in the notify set', () => {
    handleActivityEvent({ Response: { Event: 'SEQUENCE-FINISHED' } });

    expect(mockedScheduleNotificationAsync).toHaveBeenCalledWith({
      content: { title: 'Sequence finished', body: '' },
      trigger: null,
    });
  });

  it('does not schedule a notification for events outside the notify set', () => {
    handleActivityEvent({ Response: { Event: 'MOUNT-CONNECTED' } });

    expect(mockedScheduleNotificationAsync).not.toHaveBeenCalled();
  });
});

describe('fetchEventHistory', () => {
  it('maps the response array into the store, newest first', async () => {
    /* The plugin serializes Time as an ISO date string, not an epoch
       number - these fixtures mirror that so the sort is exercised
       against the real shape of the data. */
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: [
          { Event: 'MOUNT-CONNECTED', Time: '2026-07-20T21:00:00' },
          { Event: 'IMAGE-SAVE', Time: '2026-07-20T21:02:00' },
          { Event: 'GUIDER-START', Time: '2026-07-20T21:01:00' },
        ],
      },
    });

    await fetchEventHistory();

    const { events } = useEventsStore.getState();
    expect(events.map((e) => e.event)).toEqual([
      'IMAGE-SAVE',
      'GUIDER-START',
      'MOUNT-CONNECTED',
    ]);
    expect(events[0]?.label).toBe('Image saved');
  });

  it('returns undefined and does not throw on request failure', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network error'));

    const result = await fetchEventHistory();

    expect(result).toBeUndefined();
  });
});
