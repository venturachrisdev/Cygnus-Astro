import Axios from 'axios';

import { useFlatsStore } from '@/stores/flats.store';

import { getApiUrl } from './hosts';

/*
  Every field is optional. Omitted params fall back to the values trained in
  the active NINA profile (the plugin only overrides a setting when the query
  param is present), so callers should leave a field out rather than send an
  empty value.
*/
export interface AutoExposureFlatsParams {
  count?: number;
  minExposure?: number;
  maxExposure?: number;
  histogramMean?: number;
  meanTolerance?: number;
  brightness?: number;
  filterId?: number;
  binning?: string;
  gain?: number;
  offset?: number;
  exposureTime?: number;
  keepClosed?: boolean;
}

export interface AutoBrightnessFlatsParams {
  count?: number;
  minBrightness?: number;
  maxBrightness?: number;
  histogramMean?: number;
  meanTolerance?: number;
  filterId?: number;
  binning?: string;
  gain?: number;
  offset?: number;
  exposureTime?: number;
  keepClosed?: boolean;
}

export interface SkyFlatsParams {
  count?: number;
  minExposure?: number;
  maxExposure?: number;
  histogramMean?: number;
  meanTolerance?: number;
  dither?: boolean;
  filterId?: number;
  binning?: string;
  gain?: number;
  offset?: number;
}

export interface TrainedFlatParams {
  count?: number;
  filterId?: number;
  binning?: string;
  gain?: number;
  offset?: number;
  keepClosed?: boolean;
}

export const startAutoExposureFlats = async (
  params: AutoExposureFlatsParams,
) => {
  const flatsState = useFlatsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/flats/auto-exposure`, { params });
    flatsState.set({ isRunning: true, state: 'Running' });
  } catch (e) {
    console.log('Error starting auto-exposure flats', e);
  }
};

export const startAutoBrightnessFlats = async (
  params: AutoBrightnessFlatsParams,
) => {
  const flatsState = useFlatsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/flats/auto-brightness`, { params });
    flatsState.set({ isRunning: true, state: 'Running' });
  } catch (e) {
    console.log('Error starting auto-brightness flats', e);
  }
};

export const startSkyFlats = async (params: SkyFlatsParams) => {
  const flatsState = useFlatsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/flats/skyflat`, { params });
    flatsState.set({ isRunning: true, state: 'Running' });
  } catch (e) {
    console.log('Error starting sky flats', e);
  }
};

export const startTrainedFlat = async (params: TrainedFlatParams) => {
  const flatsState = useFlatsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/flats/trained-flat`, { params });
    flatsState.set({ isRunning: true, state: 'Running' });
  } catch (e) {
    console.log('Error starting trained flat', e);
  }
};

export const startTrainedDarkFlat = async (params: TrainedFlatParams) => {
  const flatsState = useFlatsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/flats/trained-dark-flat`, { params });
    flatsState.set({ isRunning: true, state: 'Running' });
  } catch (e) {
    console.log('Error starting trained dark flat', e);
  }
};

export const getFlatsStatus = async () => {
  const flatsState = useFlatsStore.getState();

  try {
    const response = (await Axios.get(`${await getApiUrl()}/flats/status`))
      .data;

    flatsState.set({
      state: response.Response.State,
      totalIterations: response.Response.TotalIterations,
      completedIterations: response.Response.CompletedIterations,
      isRunning: response.Response.State === 'Running',
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting flats status', e);
    return undefined;
  }
};

export const stopFlats = async () => {
  const flatsState = useFlatsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/flats/stop`);
    flatsState.set({ isRunning: false, state: 'Finished' });
  } catch (e) {
    console.log('Error stopping flats', e);
  }
};
