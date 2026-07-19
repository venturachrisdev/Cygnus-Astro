import Axios from 'axios';

import {
  connectFocuser,
  disconnectFocuser,
  getFocuserInfo,
  getLastAutoFocus,
  listFocuserDevices,
  moveFocuser,
  moveFocuserDown,
  moveFocuserUp,
  rescanFocuserDevices,
  startAutofocus,
} from '@/actions/focuser';
import { useCameraStore } from '@/stores/camera.store';
import { useFocuserStore } from '@/stores/focuser.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({
    data: { Response: { Position: 5000, StepSize: 100, Connected: true } },
  });
});

describe('getFocuserInfo', () => {
  it('maps the response into the focuser store and defaults step size', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: {
          DeviceId: 'foc-1',
          DisplayName: 'Focuser',
          Connected: true,
          IsMoving: false,
          Temperature: 12,
          Position: 4200,
          StepSize: 0,
        },
      },
    });

    const result = await getFocuserInfo();

    const state = useFocuserStore.getState();
    expect(state.currentDevice).toEqual({ id: 'foc-1', name: 'Focuser' });
    expect(state.position).toBe(4200);
    expect(state.stepSize).toBe(100);
    expect(result.DeviceId).toBe('foc-1');
  });
});

describe('getLastAutoFocus', () => {
  it('stores a new autofocus run', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: {
          Filter: 'L',
          Duration: '00:02:00',
          Timestamp: '2026-07-18T00:00:00Z',
          Method: 'STARHFR',
          Temperature: 10,
          PreviousFocusPoint: { Position: 1, Error: 0, Value: 2 },
          CalculatedFocusPoint: { Position: 3, Error: 0, Value: 4 },
          InitialFocusPoint: { Position: 5, Error: 0, Value: 6 },
          RSquares: { Quadratic: 0.9, Hyperbolic: 0.95 },
          MeasurePoints: [{ Position: 1, Value: 2, Error: 0 }],
        },
      },
    });

    await getLastAutoFocus();

    const run = useFocuserStore.getState().lastAutoFocusRun;
    expect(run?.filter).toBe('L');
    expect(run?.date).toBe('2026-07-18T00:00:00Z');
    expect(run?.points).toHaveLength(1);
  });
});

describe('focuser device management', () => {
  it('lists devices', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: [{ Id: 'f1', DisplayName: 'A' }] },
    });
    await listFocuserDevices();
    expect(useFocuserStore.getState().devices).toEqual([
      { id: 'f1', name: 'A' },
    ]);
  });

  it('rescans devices and refreshes info', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: [] } });
    await rescanFocuserDevices();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/focuser/rescan',
    );
  });

  it('connects using the selected device id', async () => {
    useFocuserStore.getState().set({ currentDevice: { id: 'f9', name: 'F9' } });
    await connectFocuser();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/focuser/connect',
      { params: { to: 'f9' } },
    );
  });

  it('disconnects', async () => {
    await disconnectFocuser();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/focuser/disconnect',
    );
  });
});

describe('focuser movement', () => {
  it('starts autofocus and flags the store', async () => {
    await startAutofocus();
    expect(useFocuserStore.getState().isAutofocusing).toBe(true);
  });

  it('moves to an absolute position and re-enables capture', async () => {
    await moveFocuser(4321);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/focuser/move?position=4321',
    );
    expect(useCameraStore.getState().canCapture).toBe(true);
  });

  it('steps up by the current step size', async () => {
    await moveFocuserUp();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/focuser/move?position=5100',
    );
  });

  it('steps down by the current step size', async () => {
    await moveFocuserDown();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/focuser/move?position=4900',
    );
  });
});
