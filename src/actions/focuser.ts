import Axios from 'axios';

import { useCameraStore } from '@/stores/camera.store';
import { useFocuserStore } from '@/stores/focuser.store';

import {
  API_FOCUSER_AUTOFOCUS,
  API_FOCUSER_CONNECT,
  API_FOCUSER_DISCONNECT,
  API_FOCUSER_INFO,
  API_FOCUSER_LIST,
  API_FOCUSER_MOVE,
  API_FOCUSER_RESCAN,
} from './constants';
import { getApiUrl } from './hosts';

export const getFocuserInfo = async () => {
  const focuserState = useFocuserStore.getState();
  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_FOCUSER_INFO}`)
    ).data;

    if (response.Response?.DeviceId) {
      focuserState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    focuserState.set({
      isConnected: response.Response.Connected,
      isMoving: response.Response.IsMoving,
      temperature: response.Response.Temperature,
      position: response.Response.Position,
      stepSize: response.Response.StepSize || 100,
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const getLastAutoFocus = async () => {
  const focuserState = useFocuserStore.getState();
  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/focuser/last-af`)
    ).data;

    if (
      response.Response &&
      focuserState.lastAutoFocusRun?.date !== response.Response.Timestamp
    ) {
      focuserState.set({
        isAutofocusing: false,
        lastAutoFocusRun: {
          filter: response.Response.Filter,
          duration: response.Response.Duration,
          previousFocusPoint: {
            position: response.Response.PreviousFocusPoint.Position,
            error: response.Response.PreviousFocusPoint.Error,
            value: response.Response.PreviousFocusPoint.Value,
          },
          calculatedFocusPoint: {
            position: response.Response.CalculatedFocusPoint.Position,
            error: response.Response.CalculatedFocusPoint.Error,
            value: response.Response.CalculatedFocusPoint.Value,
          },
          initialFocusPoint: {
            position: response.Response.InitialFocusPoint.Position,
            error: response.Response.InitialFocusPoint.Error,
            value: response.Response.InitialFocusPoint.Value,
          },
          method: response.Response.Method,
          date: response.Response.Timestamp,
          temperature: response.Response.Temperature,
          quadraticR2: response.Response.RSquares?.Quadratic,
          hyperbolicR2: response.Response.RSquares?.Hyperbolic,
          points: response.Response.MeasurePoints.map((point: any) => ({
            position: point.Position,
            value: point.Value,
            error: point.Error,
          })),
        },
      });
    }

    return response.Response;
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const listFocuserDevices = async () => {
  const focuserState = useFocuserStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_FOCUSER_LIST}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    focuserState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const rescanFocuserDevices = async () => {
  const focuserState = useFocuserStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_FOCUSER_RESCAN}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    focuserState.set({ devices });
    await getFocuserInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const connectFocuser = async () => {
  try {
    const focuserState = useFocuserStore.getState();
    const id = focuserState.currentDevice?.id;

    if (!id) {
      return;
    }
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/${API_FOCUSER_CONNECT}`, {
      params: {
        to: id,
      },
    });
    await getFocuserInfo();
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const disconnectFocuser = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_FOCUSER_DISCONNECT}`);
    await getFocuserInfo();
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const startAutofocus = async (cancel: boolean = false) => {
  const focuserState = useFocuserStore.getState();
  try {
    await Axios.get(
      `${await getApiUrl()}/${API_FOCUSER_AUTOFOCUS}?${
        cancel ? 'cancel=true' : ''
      }`,
    );
    focuserState.set({ isAutofocusing: !cancel });
    await getFocuserInfo();
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const moveFocuser = async (position: number) => {
  const focuserState = useFocuserStore.getState();
  const cameraState = useCameraStore.getState();

  cameraState.set({ canCapture: false });

  try {
    console.log(
      'Moving focuser',
      position,
      focuserState.position,
      focuserState.stepSize,
    );
    await Axios.get(
      `${await getApiUrl()}/${API_FOCUSER_MOVE}?position=${position}`,
    );
    await getFocuserInfo();
  } catch (e) {
    console.log('Error getting focuser', e);
  }

  cameraState.set({ canCapture: true });
};

export const moveFocuserUp = async () => {
  const focuser = await getFocuserInfo();
  if (focuser && focuser.Position) {
    const position = focuser.Position;
    const stepSize = focuser.StepSize || 100;

    await moveFocuser(position + stepSize);
  }
};

export const moveFocuserDown = async () => {
  const focuser = await getFocuserInfo();
  if (focuser && focuser.Position) {
    const position = focuser.Position;
    const stepSize = focuser.StepSize || 100;

    await moveFocuser(position - stepSize);
  }
};
