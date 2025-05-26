import Axios from 'axios';

import { useFlatPanelStore } from '@/stores/flatpanel.store';

import { getApiUrl } from './hosts';

export const getFlatPanelInfo = async () => {
  const flatPanelState = useFlatPanelStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/flatdevice/info`)
    ).data;

    if (response.Response?.DeviceId) {
      flatPanelState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    flatPanelState.set({
      isConnected: response.Response.Connected,
      coverState: response.Response.CoverState,
      lightOn: response.Response.LightOn,
      brightness: response.Response.Brightness,
      minBrightness: response.Response.MinBrightness,
      maxBrightness: response.Response.MaxBrightness,
    });
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const listFlatPanelDevices = async () => {
  const flatPanelState = useFlatPanelStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/flatdevice/list-devices`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    flatPanelState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const rescanFlatPanelDevices = async () => {
  const flatPanelState = useFlatPanelStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/flatdevice/rescan`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    flatPanelState.set({ devices });
    await getFlatPanelInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const connectFlatPanel = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/equipment/flatdevice/connect`, {
      params: {
        to: id,
      },
    });
    await getFlatPanelInfo();
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const disconnectFlatPanel = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/flatdevice/disconnect`);
    await getFlatPanelInfo();
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const setFlatPanelLight = async (on: boolean) => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/flatdevice/set-light`, {
      params: { on },
    });
    await getFlatPanelInfo();
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const setFlatPanelCover = async (closed: boolean) => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/flatdevice/set-cover`, {
      params: { closed },
    });
    await getFlatPanelInfo();
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};

export const setFlatPanelBrightness = async (brightness: number) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/equipment/flatdevice/set-brightness`,
      {
        params: { brightness },
      },
    );
    await getFlatPanelInfo();
  } catch (e) {
    console.log('Error getting flat panel', e);
  }
};
