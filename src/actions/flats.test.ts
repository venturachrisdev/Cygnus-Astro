import Axios from 'axios';

import {
  getFlatsStatus,
  startAutoBrightnessFlats,
  startAutoExposureFlats,
  startSkyFlats,
  startTrainedDarkFlat,
  startTrainedFlat,
  stopFlats,
} from '@/actions/flats';
import { useFlatsStore } from '@/stores/flats.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
  useFlatsStore.getState().set({
    isRunning: false,
    state: '',
    totalIterations: 0,
    completedIterations: 0,
  });
});

describe('startAutoExposureFlats', () => {
  it('hits the auto-exposure endpoint with the params and flags the run', async () => {
    await startAutoExposureFlats({
      count: 20,
      minExposure: 0.5,
      maxExposure: 10,
      histogramMean: 0.5,
      meanTolerance: 0.1,
    });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/auto-exposure',
      {
        params: {
          count: 20,
          minExposure: 0.5,
          maxExposure: 10,
          histogramMean: 0.5,
          meanTolerance: 0.1,
        },
      },
    );
    expect(useFlatsStore.getState().isRunning).toBe(true);
  });
});

describe('startAutoBrightnessFlats', () => {
  it('hits the auto-brightness endpoint with the params', async () => {
    await startAutoBrightnessFlats({
      count: 15,
      minBrightness: 10,
      maxBrightness: 200,
      exposureTime: 2,
    });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/auto-brightness',
      {
        params: {
          count: 15,
          minBrightness: 10,
          maxBrightness: 200,
          exposureTime: 2,
        },
      },
    );
    expect(useFlatsStore.getState().isRunning).toBe(true);
  });
});

describe('startSkyFlats', () => {
  it('hits the skyflat endpoint with the params', async () => {
    await startSkyFlats({ count: 30, dither: true, filterId: 1 });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/skyflat',
      { params: { count: 30, dither: true, filterId: 1 } },
    );
    expect(useFlatsStore.getState().isRunning).toBe(true);
  });
});

describe('startTrainedFlat', () => {
  it('hits the trained-flat endpoint with the params', async () => {
    await startTrainedFlat({ count: 25, filterId: 2, binning: '1x1' });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/trained-flat',
      { params: { count: 25, filterId: 2, binning: '1x1' } },
    );
    expect(useFlatsStore.getState().isRunning).toBe(true);
  });
});

describe('startTrainedDarkFlat', () => {
  it('hits the trained-dark-flat endpoint with the params', async () => {
    await startTrainedDarkFlat({ count: 25, keepClosed: true });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/trained-dark-flat',
      { params: { count: 25, keepClosed: true } },
    );
    expect(useFlatsStore.getState().isRunning).toBe(true);
  });
});

describe('getFlatsStatus', () => {
  it('maps the running status into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: {
          State: 'Running',
          TotalIterations: 20,
          CompletedIterations: 7,
        },
      },
    });

    const result = await getFlatsStatus();

    const state = useFlatsStore.getState();
    expect(state.state).toBe('Running');
    expect(state.totalIterations).toBe(20);
    expect(state.completedIterations).toBe(7);
    expect(state.isRunning).toBe(true);
    expect(result).toEqual({
      State: 'Running',
      TotalIterations: 20,
      CompletedIterations: 7,
    });
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/status',
    );
  });

  it('clears the running flag once NINA reports Finished', async () => {
    useFlatsStore.getState().set({ isRunning: true });
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: {
          State: 'Finished',
          TotalIterations: -1,
          CompletedIterations: -1,
        },
      },
    });

    await getFlatsStatus();

    expect(useFlatsStore.getState().isRunning).toBe(false);
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getFlatsStatus()).resolves.toBeUndefined();
  });
});

describe('stopFlats', () => {
  it('hits the stop endpoint and clears the running flag', async () => {
    useFlatsStore.getState().set({ isRunning: true });

    await stopFlats();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/flats/stop',
    );
    expect(useFlatsStore.getState().isRunning).toBe(false);
  });
});
