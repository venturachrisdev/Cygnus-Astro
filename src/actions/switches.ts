import Axios from 'axios';

import { useSwitchesStore } from '@/stores/switches.stores';

import { getApiUrl } from './hosts';

export const getSwitchesInfo = async () => {
  const switchState = useSwitchesStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/switch/info`)
    ).data;

    if (response.Response?.DeviceId) {
      switchState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    switchState.set({
      isConnected: response.Response.Connected,
      readSwitches: response.Response.ReadonlySwitches?.map((sw: any) => ({
        id: sw.Id,
        name: sw.Name,
        value: sw.Value,
      })),
      writeSwitches: response.Response.WritableSwitches?.map((sw: any) => ({
        id: sw.Id,
        name: sw.Name,
        value: sw.Value,
        maxValue: sw.Maximum,
        minValue: sw.Minimum,
        stepValue: sw.StepSize,
        targetValue: sw.TargetValue,
      })),
    });
  } catch (e) {
    console.log('Error getting switch', e);
  }
};

export const setSwitchValue = async (index: number, value: number) => {
  try {
    console.log(
      'SWITCH',
      index,
      value,
      (
        await Axios.get(
          `${await getApiUrl()}/equipment/switch/set?index=${index}&value=${value}`,
        )
      ).data,
    );
    await getSwitchesInfo();
  } catch (e) {
    console.log('Error getting switch', e);
  }
};

export const listSwitchesDevices = async () => {
  const switchesState = useSwitchesStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/switch/list-devices`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    switchesState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting switch', e);
  }
};

export const rescanSwitchesDevices = async () => {
  const switchesState = useSwitchesStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/switch/rescan`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    switchesState.set({ devices });
    await getSwitchesInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting switch', e);
  }
};

export const connectSwitches = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/equipment/switch/connect`, {
      params: {
        to: id,
      },
    });
    await getSwitchesInfo();
  } catch (e) {
    console.log('Error getting switch', e);
  }
};

export const disconnectSwitches = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/switch/disconnect`);
    await getSwitchesInfo();
  } catch (e) {
    console.log('Error getting switch', e);
  }
};
