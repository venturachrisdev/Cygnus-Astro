import Axios from 'axios';

import { useCameraStore } from '@/stores/camera.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';

import {
  API_FILTERWHEEL_CHANGE,
  API_FILTERWHEEL_CONNECT,
  API_FILTERWHEEL_DISCONNECT,
  API_FILTERWHEEL_INFO,
  API_FILTERWHEEL_LIST,
  API_FILTERWHEEL_RESCAN,
} from './constants';
import { getFocuserInfo } from './focuser';
import { getApiUrl } from './hosts';

export const getFilterWheelInfo = async () => {
  const filterWheelState = useFilterWheelStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_FILTERWHEEL_INFO}`)
    ).data;
    filterWheelState.set({
      isConnected: response.Response.Connected,
      isMoving: response.Response.IsMoving,
      currentFilter: response.Response.SelectedFilter?.Id,
      availableFilters: response.Response.AvailableFilters.map(
        (filter: any) => ({
          id: filter.Id,
          name: filter.Name,
        }),
      ),
      currentDevice: {
        id: response.Response.DeviceId,
        name: response.Response.DisplayName,
      },
    });
  } catch (e) {
    console.log('Error getting filter wheel', e);
  }
};

export const changeFilter = async (filter: number) => {
  const cameraState = useCameraStore.getState();
  cameraState.set({ canCapture: false });

  try {
    console.log('Changing filter', filter);
    await Axios.get(
      `${await getApiUrl()}/${API_FILTERWHEEL_CHANGE}?filterId=${filter}`,
    );
    await getFocuserInfo();
    cameraState.set({ canCapture: true });
  } catch (e) {
    console.log('Error changing filter', e);
  }

  cameraState.set({ canCapture: true });
};

export const listFilterWheelDevices = async () => {
  const filterWheelState = useFilterWheelStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_FILTERWHEEL_LIST}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    filterWheelState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting filter wheel', e);
  }
};

export const rescanFilterWheelDevices = async () => {
  const filterWheelState = useFilterWheelStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_FILTERWHEEL_RESCAN}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    filterWheelState.set({ devices });
    await getFilterWheelInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting filter wheel', e);
  }
};

export const connectFilterWheel = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/${API_FILTERWHEEL_CONNECT}?to=${id}`);
    await getFilterWheelInfo();
  } catch (e) {
    console.log('Error getting filter wheel', e);
  }
};

export const disconnectFilterWheel = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_FILTERWHEEL_DISCONNECT}`);
    await getFilterWheelInfo();
  } catch (e) {
    console.log('Error getting filter wheel', e);
  }
};
