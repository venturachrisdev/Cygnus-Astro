import Axios from 'axios';

import { useDomeStore } from '@/stores/dome.store';

import { getApiUrl } from './hosts';
import { parseNaNValue } from './weather';

export const getDomeInfo = async () => {
  const domeState = useDomeStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/dome/info`)
    ).data;

    if (response.Response?.DeviceId) {
      domeState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    domeState.set({
      isConnected: response.Response.Connected,
      shutterStatus: response.Response.ShutterStatus,
      isParked: response.Response.AtPark,
      isHome: response.Response.AtHome,
      isSlewing: response.Response.Slewing,
      isFollowing: response.Response.IsFollowing,
      isSynchronized: response.Response.IsSynchronized,
      azimuth: parseNaNValue(response.Response.Azimuth),
    });
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const listDomeDevices = async () => {
  const domeState = useDomeStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/dome/list-devices`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    domeState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const rescanDomeDevices = async () => {
  const domeState = useDomeStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/dome/rescan`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    domeState.set({ devices });
    await getDomeInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const connectDome = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/equipment/dome/connect`, {
      params: {
        to: id,
      },
    });
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const disconnectDome = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/disconnect`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const openDomeShutter = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/open`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const closeDomeShutter = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/close`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const stopDome = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/stop`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const setDomePark = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/set-park-position`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const parkDome = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/park`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const homeDome = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/home`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const syncDome = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/sync`);
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};

export const setDomeFollow = async (enabled: boolean) => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/dome/set-follow`, {
      params: {
        enabled,
      },
    });
    await getDomeInfo();
  } catch (e) {
    console.log('Error getting dome', e);
  }
};
