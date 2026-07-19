/* eslint-disable no-await-in-loop */
import Axios from 'axios';

import { useCameraStore } from '@/stores/camera.store';

import {
  API_CAMERA_ABORT,
  API_CAMERA_CAPTURE,
  API_CAMERA_CONNECT,
  API_CAMERA_DISCONNECT,
  API_CAMERA_INFO,
  API_CAMERA_LIST,
  API_CAMERA_RESCAN,
  sleep,
} from './constants';
import { getApiUrl } from './hosts';

export const getCameraInfo = async () => {
  const cameraState = useCameraStore.getState();
  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_CAMERA_INFO}`)
    ).data;

    if (response.Response?.DeviceId) {
      cameraState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    cameraState.set({
      temperature: response.Response.Temperature,
      exposureEndTime: response.Response.ExposureEndTime,
      cooling: response.Response.CoolerOn,
      dewHeater: response.Response.DewHeaterOn,
      isConnected: response.Response.Connected,
      gain: response.Response.Gain,
      offset: response.Response.Offset,
      pixelSize: response.Response.PixelSize,
      isExposing: response.Response.IsExposing,
      readoutModes: response.Response.ReadoutModes,
      readoutMode: response.Response.ReadoutMode,
    });

    if (cameraState.exposureEndTime) {
      const now = new Date();
      const endTime = new Date(cameraState.exposureEndTime);
      const countdown = Math.ceil((endTime.getTime() - now.getTime()) / 1000);

      if (countdown > 0) {
        cameraState.set({ countdown });
      } else {
        cameraState.set({ countdown: -1 });
      }
    }

    if (cameraState.customGain === null) {
      cameraState.set({ customGain: response.Response.Gain });
    }

    if (cameraState.customOffset === null) {
      cameraState.set({ customOffset: response.Response.Offset });
    }

    return response.Response;
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const listCameraDevices = async () => {
  const mountState = useCameraStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_CAMERA_LIST}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    mountState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const rescanCameraDevices = async () => {
  const mountState = useCameraStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_CAMERA_RESCAN}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    mountState.set({ devices });
    await getCameraInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const connectCamera = async () => {
  try {
    const cameraState = useCameraStore.getState();
    const id = cameraState.currentDevice?.id;

    if (!id) {
      console.log('No camera ID', cameraState.currentDevice);
      return;
    }

    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/${API_CAMERA_CONNECT}`, {
      params: {
        to: id,
      },
    });
    await getCameraInfo();
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const disconnectCamera = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_CAMERA_DISCONNECT}`);
    await getCameraInfo();
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const getCapturedImage = async () => {
  try {
    const response = (
      await Axios.get(
        `${await getApiUrl()}/${API_CAMERA_CAPTURE}?getResult=true&quality=70&scale=0.5&resize=true`,
      )
    ).data;
    return response.Response;
  } catch (e) {
    console.log('Error getting image from camera', e);
  }
};

export const abortCaptureImage = async () => {
  try {
    console.log('Aborting capture');
    await Axios.get(`${await getApiUrl()}/${API_CAMERA_ABORT}`);
  } catch (e) {
    console.log('Error aborting capture', e);
  }
};

export const sendCapture = async (duration: number, solve: boolean = false) => {
  try {
    /* Deliberately do NOT set save: the Advanced API always writes the capture
       to a temp file that getResult reads back, so the preview works without it.
       save would additionally enqueue the image into NINA's image history, which
       must stay reserved for sequence images (otherwise snapshots pollute the
       sequence gallery). */
    await Axios.get(
      `${await getApiUrl()}/${API_CAMERA_CAPTURE}?duration=${duration}&gain=0&solve=${
        solve ? 'true' : 'false'
      }`,
    );
  } catch (e) {
    console.log('Error sending capture', e);
  }
};

export const getCapturedImageWithRetries = async () => {
  const cameraState = useCameraStore.getState();

  cameraState.set({ isLoading: true });
  let response = await getCapturedImage();

  /* Poll getResult until the capture finishes. The response is the string
     "Capture already in progress" while the exposure/processing is still running,
     so keep going for ~15s to cover slower sensors and downloads without relying
     on the saved-to-history path. */
  let retries = 0;
  while (
    response &&
    (typeof response === 'string' || !response.Image) &&
    retries < 60
  ) {
    await sleep(250);
    response = await getCapturedImage();
    retries += 1;
  }

  cameraState.set({
    isLoading: false,
    countdown: 0,
  });

  if (response?.Image) {
    cameraState.set({
      image: response?.Image,
    });
  }

  if (cameraState.isCapturing && cameraState.loop) {
    captureImage();
  } else {
    cameraState.set({ isCapturing: false });
  }
};

export const captureImage = async () => {
  const cameraState = useCameraStore.getState();
  console.log('Capturing...');
  useCameraStore.getState().set({ isCapturing: true });

  try {
    // do {
    console.log(
      'Current Duration',
      cameraState.duration,
      cameraState.platesolve,
    );
    await sendCapture(cameraState.duration, cameraState.platesolve);

    if (cameraState.duration <= 1) {
      await getCapturedImageWithRetries();
    }
  } catch (e) {
    console.log('Error capturing image', e);
    cameraState.set({
      isCapturing: false,
      countdown: 0,
      isLoading: false,
    });
  }
};

export const coolCamera = async (
  temperature: number,
  cancel: boolean = false,
) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/equipment/camera/cool?minutes=-1&temperature=${temperature}${
        cancel ? '&cancel=true' : ''
      }`,
    );
    await getCameraInfo();
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const warmCamera = async (cancel: boolean = false) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/equipment/camera/warm?minutes=-1${
        cancel ? '&cancel=true' : ''
      }`,
    );
    await getCameraInfo();
  } catch (e) {
    console.log('Error getting camera', e);
  }
};
