import Axios from 'axios';

import {
  changeProfileValue,
  getHorizon,
  getProfiles,
  showProfile,
  switchProfile,
} from '@/actions/profile';
import { useProfileStore } from '@/stores/profile.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
  useProfileStore.getState().set({
    profiles: [],
    activeProfile: null,
    description: '',
    lastUsed: '',
    horizon: { altitudes: [], azimuths: [] },
  });
});

describe('getProfiles', () => {
  it('maps the profile list into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: [
          { Id: 'p1', Name: 'Rig A' },
          { Id: 'p2', Name: 'Rig B' },
        ],
      },
    });

    const result = await getProfiles();

    expect(useProfileStore.getState().profiles).toEqual([
      { id: 'p1', name: 'Rig A' },
      { id: 'p2', name: 'Rig B' },
    ]);
    expect(result).toHaveLength(2);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/show',
      { params: { active: false } },
    );
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getProfiles()).resolves.toBeUndefined();
    expect(useProfileStore.getState().isLoading).toBe(false);
  });
});

describe('showProfile', () => {
  it('maps the active profile into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: {
          Id: 'p1',
          Name: 'Rig A',
          Description: 'Backyard rig',
          LastUsed: '2026-07-20T00:00:00Z',
        },
      },
    });

    await showProfile();

    const state = useProfileStore.getState();
    expect(state.activeProfile).toEqual({ id: 'p1', name: 'Rig A' });
    expect(state.description).toBe('Backyard rig');
    expect(state.lastUsed).toBe('2026-07-20T00:00:00Z');
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/show',
      { params: { active: true } },
    );
  });
});

describe('switchProfile', () => {
  it('switches then refreshes the list and active profile', async () => {
    await switchProfile('p2');

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/switch',
      { params: { profileid: 'p2' } },
    );
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/show',
      { params: { active: false } },
    );
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/show',
      { params: { active: true } },
    );
  });
});

describe('changeProfileValue', () => {
  it('passes the setting path and new value', async () => {
    await changeProfileValue('CameraSettings-PixelSize', '3.76');

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/change-value',
      { params: { settingpath: 'CameraSettings-PixelSize', newValue: '3.76' } },
    );
  });
});

describe('getHorizon', () => {
  it('maps altitudes and azimuths into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: {
          Altitudes: [10, 20, 30],
          Azimuths: [0, 120, 240],
        },
      },
    });

    await getHorizon();

    expect(useProfileStore.getState().horizon).toEqual({
      altitudes: [10, 20, 30],
      azimuths: [0, 120, 240],
    });
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/profile/horizon',
    );
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getHorizon()).resolves.toBeUndefined();
  });
});
