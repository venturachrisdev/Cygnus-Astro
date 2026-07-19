import Axios from 'axios';

import {
  closeDomeShutter,
  connectDome,
  disconnectDome,
  getDomeInfo,
  homeDome,
  listDomeDevices,
  openDomeShutter,
  parkDome,
  rescanDomeDevices,
  setDomeFollow,
  setDomePark,
  slewDome,
  stopDome,
  syncDome,
} from '@/actions/dome';
import { useDomeStore } from '@/stores/dome.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

const domeInfoResponse = {
  data: {
    Response: {
      DeviceId: 'dome-1',
      DisplayName: 'Test Dome',
      Connected: true,
      ShutterStatus: 'Open',
      AtPark: false,
      AtHome: true,
      Slewing: false,
      IsFollowing: true,
      IsSynchronized: true,
      Azimuth: '123.5',
    },
  },
};

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
});

describe('getDomeInfo', () => {
  it('maps the API response into the dome store', async () => {
    mockedGet.mockResolvedValueOnce(domeInfoResponse);

    await getDomeInfo();

    const state = useDomeStore.getState();
    expect(state.currentDevice).toEqual({ id: 'dome-1', name: 'Test Dome' });
    expect(state.isConnected).toBe(true);
    expect(state.shutterStatus).toBe('Open');
    expect(state.isHome).toBe(true);
    expect(state.azimuth).toBe(123.5);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/info',
    );
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getDomeInfo()).resolves.toBeUndefined();
  });
});

describe('listDomeDevices', () => {
  it('maps the device list into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: [
          { Id: 'd1', DisplayName: 'A' },
          { Id: 'd2', DisplayName: 'B' },
        ],
      },
    });

    const result = await listDomeDevices();

    expect(useDomeStore.getState().devices).toEqual([
      { id: 'd1', name: 'A' },
      { id: 'd2', name: 'B' },
    ]);
    expect(result).toHaveLength(2);
  });
});

describe('dome commands', () => {
  it('call their matching endpoints', async () => {
    await openDomeShutter();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/open',
    );

    await closeDomeShutter();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/close',
    );

    await stopDome();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/stop',
    );

    await parkDome();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/park',
    );

    await homeDome();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/home',
    );

    await syncDome();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/sync',
    );

    await setDomePark();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/set-park-position',
    );

    await disconnectDome();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/disconnect',
    );

    await rescanDomeDevices();
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/rescan',
    );
  });

  it('passes the azimuth parameter when slewing', async () => {
    await slewDome(180);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/slew',
      { params: { azimuth: 180 } },
    );
  });

  it('passes the enabled parameter when setting follow', async () => {
    await setDomeFollow(true);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/set-follow',
      { params: { enabled: true } },
    );
  });

  it('connects using the selected device id', async () => {
    useDomeStore
      .getState()
      .set({ currentDevice: { id: 'dome-9', name: 'D9' } });

    await connectDome();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/equipment/dome/connect',
      { params: { to: 'dome-9' } },
    );
  });
});
