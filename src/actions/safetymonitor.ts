import Axios from 'axios';

import { useSafetyMonitorStore } from '@/stores/safetymonitor.store';

import { getApiUrl } from './hosts';

export const getSafetyMonitorInfo = async () => {
  const safetyMonitorState = useSafetyMonitorStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/safetymonitor/info`)
    ).data;

    if (response.Response?.DeviceId) {
      safetyMonitorState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    safetyMonitorState.set({
      isConnected: response.Response.Connected,
      isSafe: response.Response.IsSafe,
    });
  } catch (e) {
    console.log('Error getting safety monitor', e);
  }
};

export const listSafetyMonitorDevices = async () => {
  const safetyMonitorState = useSafetyMonitorStore.getState();

  try {
    const response = (
      await Axios.get(
        `${await getApiUrl()}/equipment/safetymonitor/list-devices`,
      )
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    safetyMonitorState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting safety monitor', e);
  }
};

export const rescanSafetyMonitorDevices = async () => {
  const safetyMonitorState = useSafetyMonitorStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/safetymonitor/rescan`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    safetyMonitorState.set({ devices });
    await getSafetyMonitorInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting safety monitor', e);
  }
};

export const connectSafetyMonitor = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/equipment/safetymonitor/connect`, {
      params: {
        to: id,
      },
    });
    await getSafetyMonitorInfo();
  } catch (e) {
    console.log('Error getting safety monitor', e);
  }
};

export const disconnectSafetyMonitor = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/safetymonitor/disconnect`);
    await getSafetyMonitorInfo();
  } catch (e) {
    console.log('Error getting safety monitor', e);
  }
};
