import Axios from 'axios';

import { useRotatorStore } from '@/stores/rotator.store';

import { getApiUrl } from './hosts';

export const getRotatorInfo = async () => {
  const rotatorState = useRotatorStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/rotator/info`)
    ).data;

    if (response.Response?.DeviceId) {
      rotatorState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    rotatorState.set({
      isConnected: response.Response.Connected,
      isMoving: response.Response.isMoving,
      stepSize: response.Response.StepSize,
      position: response.Response.Position,
    });
  } catch (e) {
    console.log('Error getting rotator', e);
  }
};

export const listRotatorDevices = async () => {
  const rotatorState = useRotatorStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/rotator/list-devices`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    rotatorState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting rotator', e);
  }
};

export const rescanRotatorDevices = async () => {
  const rotatorState = useRotatorStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/rotator/rescan`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    rotatorState.set({ devices });
    await getRotatorInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting rotator', e);
  }
};

export const connectRotator = async () => {
  try {
    const rotatorState = useRotatorStore.getState();
    const id = rotatorState.currentDevice?.id;

    if (!id) {
      return;
    }
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/equipment/rotator/connect`, {
      params: {
        to: id,
      },
    });
    await getRotatorInfo();
  } catch (e) {
    console.log('Error getting rotator', e);
  }
};

export const disconnectRotator = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/rotator/disconnect`);
    await getRotatorInfo();
  } catch (e) {
    console.log('Error getting rotator', e);
  }
};

export const moveRotator = async (position: number) => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/rotator/move`, {
      params: {
        position,
      },
    });
    await getRotatorInfo();
  } catch (e) {
    console.log('Error getting rotator', e);
  }
};
