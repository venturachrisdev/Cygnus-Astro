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

// eslint-disable-next-line import/first
import {
  disconnectEventsSocket,
  disconnectTPPASocket,
  handleTPPAEventMessage,
  handleTPPAMessage,
  initializeEventsSocket,
  initializeTPPASocket,
  pauseTPPAAlignment,
  resumeTPPAAlignment,
  startTPPAAlignment,
  stopTPPAAlignment,
} from '@/actions/tppa';
// eslint-disable-next-line import/first
import { useTPPAStore } from '@/stores/tppa.store';

// tppa.ts constructs the TPPA socket first, then the events socket.
const tppaSocket = socketInstances[0];
const eventsSocket = socketInstances[1];

if (!tppaSocket || !eventsSocket) {
  throw new Error('WebSocketService mock did not capture both sockets');
}

describe('tppa socket actions', () => {
  it('connects the TPPA and events sockets to their endpoints', () => {
    const onMessage = jest.fn();
    initializeTPPASocket(onMessage);
    initializeEventsSocket(onMessage);

    expect(tppaSocket.connect).toHaveBeenCalledWith('/v2/tppa', onMessage);
    expect(eventsSocket.connect).toHaveBeenCalledWith('/v2/socket', onMessage);
  });

  it('disconnects each socket', () => {
    disconnectTPPASocket();
    disconnectEventsSocket();

    expect(tppaSocket.disconnect).toHaveBeenCalledTimes(1);
    expect(eventsSocket.disconnect).toHaveBeenCalledTimes(1);
  });

  it('sends alignment commands as JSON payloads over the TPPA socket', () => {
    stopTPPAAlignment();
    pauseTPPAAlignment();
    resumeTPPAAlignment();

    expect(tppaSocket.send).toHaveBeenCalledWith({ Action: 'stop-alignment' });
    expect(tppaSocket.send).toHaveBeenCalledWith({ Action: 'pause-alignment' });
    expect(tppaSocket.send).toHaveBeenCalledWith({
      Action: 'resume-alignment',
    });
  });

  it('stops before starting a new alignment', () => {
    tppaSocket.send.mockClear();
    startTPPAAlignment();

    expect(tppaSocket.send).toHaveBeenNthCalledWith(1, {
      Action: 'stop-alignment',
    });
    expect(tppaSocket.send).toHaveBeenNthCalledWith(2, {
      Action: 'start-alignment',
    });
  });

  it('includes start-alignment settings in the JSON payload', () => {
    tppaSocket.send.mockClear();
    startTPPAAlignment({
      StartFromCurrentPosition: true,
      TargetDistance: 15,
    });

    expect(tppaSocket.send).toHaveBeenNthCalledWith(2, {
      Action: 'start-alignment',
      StartFromCurrentPosition: true,
      TargetDistance: 15,
    });
  });
});

describe('handleTPPAMessage', () => {
  beforeEach(() => {
    tppaSocket.send.mockClear();
    useTPPAStore.getState().set({
      isRunning: false,
      isPaused: false,
      status: null,
      progress: 0,
      altitudeError: 0,
      azimuthError: 0,
      totalError: 0,
    });
  });

  it('resets errors and marks running on "started procedure"', () => {
    useTPPAStore.getState().set({ totalError: 9, status: 'stale' });
    handleTPPAMessage({ Response: 'started procedure' });

    const state = useTPPAStore.getState();
    expect(state.isRunning).toBe(true);
    expect(state.isPaused).toBe(false);
    expect(state.totalError).toBe(0);
    expect(state.status).toBeNull();
  });

  it('marks not running on "stopped procedure"', () => {
    useTPPAStore.getState().set({ isRunning: true });
    handleTPPAMessage({ Response: 'stopped procedure' });
    expect(useTPPAStore.getState().isRunning).toBe(false);
  });

  it('toggles pause on "paused"/"resumed procedure"', () => {
    handleTPPAMessage({ Response: 'paused procedure' });
    expect(useTPPAStore.getState().isPaused).toBe(true);
    handleTPPAMessage({ Response: 'resumed procedure' });
    expect(useTPPAStore.getState().isPaused).toBe(false);
  });

  it('records an alignment-error measurement and pauses the run', () => {
    handleTPPAMessage({
      Response: { AzimuthError: 0.1, AltitudeError: 0.2, TotalError: 0.3 },
    });

    const state = useTPPAStore.getState();
    expect(state.azimuthError).toBe(0.1);
    expect(state.altitudeError).toBe(0.2);
    expect(state.totalError).toBe(0.3);
    expect(state.isPaused).toBe(true);
    expect(tppaSocket.send).toHaveBeenCalledWith({ Action: 'pause-alignment' });
  });

  it('records the new progress message (Status/Progress)', () => {
    handleTPPAMessage({
      Response: { Status: 'Solving', Progress: 0.75 },
    });

    const state = useTPPAStore.getState();
    expect(state.status).toBe('Solving');
    expect(state.progress).toBe(0.75);
    expect(state.isRunning).toBe(true);
    expect(tppaSocket.send).not.toHaveBeenCalled();
  });

  it('does not throw on a malformed message', () => {
    expect(() =>
      // @ts-expect-error - exercising a null Response the socket should never send
      handleTPPAMessage({ Response: null }),
    ).not.toThrow();
  });
});

describe('handleTPPAEventMessage', () => {
  beforeEach(() => {
    useTPPAStore.getState().set({ didPlatesolveFail: false });
  });

  it('flags a platesolve failure', () => {
    handleTPPAEventMessage({ Response: { Event: 'ERROR-PLATESOLVE' } });
    expect(useTPPAStore.getState().didPlatesolveFail).toBe(true);
  });

  it('ignores other events and missing Response without throwing', () => {
    handleTPPAEventMessage({ Response: { Event: 'MOUNT-CONNECTED' } });
    expect(useTPPAStore.getState().didPlatesolveFail).toBe(false);
    expect(() => handleTPPAEventMessage({})).not.toThrow();
  });
});
