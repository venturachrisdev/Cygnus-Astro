import Axios from 'axios';

import { useGuiderStore } from '@/stores/guider.store';

import {
  API_GUIDER_CONNECT,
  API_GUIDER_DISCONNECT,
  API_GUIDER_INFO,
  API_GUIDER_LIST,
  API_GUIDER_RESCAN,
  API_GUIDER_START,
  API_GUIDER_STOP,
} from './constants';
import { getApiUrl } from './hosts';

export const getGuiderInfo = async () => {
  const guiderState = useGuiderStore.getState();
  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_GUIDER_INFO}`)
    ).data;

    if (response.Response?.DeviceId) {
      guiderState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    guiderState.set({
      isConnected: response.Response.Connected,
      isGuiding: response.Response.State === 'Guiding',
      pixelScale: response.Response.PixelScale,
      error: {
        RA: {
          pixels: response.Response.RMSError?.RA?.Pixel,
          arcseconds: response.Response.RMSError?.RA?.Arcseconds,
        },
        Dec: {
          pixels: response.Response.RMSError?.Dec?.Pixel,
          arcseconds: response.Response.RMSError?.Dec?.Arcseconds,
        },
        total: {
          pixels: response.Response.RMSError?.Total?.Pixel,
          arcseconds: response.Response.RMSError?.Total?.Arcseconds,
        },
      },
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const listGuiderDevices = async () => {
  const guiderState = useGuiderStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_GUIDER_LIST}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    guiderState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const rescanGuiderDevices = async () => {
  const guiderState = useGuiderStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_GUIDER_RESCAN}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    guiderState.set({ devices });
    await getGuiderInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const connectGuider = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/${API_GUIDER_CONNECT}`, {
      params: {
        to: id,
      },
    });
    await getGuiderInfo();
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const disconnectGuider = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_GUIDER_DISCONNECT}`);
    await getGuiderInfo();
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const startGuiding = async (calibrate: boolean = false) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/${API_GUIDER_START}?${
        calibrate ? 'calibrate=true' : ''
      }`,
    );
    await getGuiderInfo();
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const stopGuiding = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_GUIDER_STOP}`);
    await getGuiderInfo();
  } catch (e) {
    console.log('Error getting guider', e);
  }
};

export const getGuidingGraph = async () => {
  const guiderState = useGuiderStore.getState();
  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/guider/graph`)
    ).data;

    if (response.Response.GuideSteps) {
      guiderState.set({
        graph: response.Response.GuideSteps.map((guide: any) => ({
          id: guide.Id,
          raDistance: guide.RADistanceRawDisplay,
          decDistance: guide.DECDistanceRawDisplay,
          dither: guide.Dither !== 'NaN',
        })),
      });
    }

    return response.Response;
  } catch (e) {
    console.log('Error getting guider', e);
  }
};
