import Axios from 'axios';
import { API_CAMERA_ABORT, API_CAMERA_CAPTURE, API_CAMERA_INFO, API_URL, sleep } from './constants';
import { useCameraStore } from '@/stores/camera.store';

export const getCameraInfo = async () => {
  const cameraState = useCameraStore.getState();
  try {
    console.log("Getting camera info");
    const response = (await Axios.get(`${API_URL}/${API_CAMERA_INFO}`)).data;
    cameraState.set({
      temperature: response.Response.Temperature,
      cooling: response.Response.CoolerOn,
      dewHeater: response.Response.DewHeaterOn,
      isConnected: response.Response.Connected,
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting camera', e);
  }
};

export const runCountdown = async () => {
  const cameraState = useCameraStore.getState();

  if (cameraState.duration >= 1) {
    for (let i = cameraState.duration; i >= 0; i -= 1) {
      cameraState.set({ countdown: i });
      if (!cameraState.isCapturing) {
        cameraState.set({ countdown: 0 });
        return;
      }
      await sleep(1000);
    }
  }
}

export const getCapturedImage = async () => {
  try {
    const response = (await (Axios.get(`${API_URL}/${API_CAMERA_CAPTURE}?getResult=true&quality=70&scale=0.5&resize=true&autoPrepare=true`))).data;
    return response.Response;
  } catch (e) {
    console.log('Error getting image from camera', e);
  }
}

export const abortCaptureImage = async () => {
  try {
    console.log('Aborting capture');
    await Axios.get(`${API_URL}/${API_CAMERA_ABORT}`);
  } catch (e) {
    console.log('Error aborting capture', e);
  }
};

export const sendCapture = async (duration: number) => {
  try {
    await Axios.get(`${API_URL}/${API_CAMERA_CAPTURE}?duration=${duration}&gain=0&solve=false`);
  } catch (e) {
    console.log('Error sending capture', e);
  }
}

export const captureImage = async () => {
    const cameraState = useCameraStore.getState();
    console.log('Capturing...');
    useCameraStore.getState().set({ isCapturing: true });

    try {
      do {
        console.log('Current Duration', cameraState.duration);
        await sendCapture(cameraState.duration);

        await runCountdown();

        if (useCameraStore.getState().isCapturing) {
          cameraState.set({ isLoading: true });
          let response = await getCapturedImage();

          while (typeof response === "string" || !response.Image) {
            console.log('Retrying capture');
            response = await getCapturedImage();
            await sleep(250);
          }

          cameraState.set({ isLoading: false });
          cameraState.set({ countdown: 0 });
          cameraState.set({ image: response.Image });
        }
      } while (useCameraStore.getState().loop && useCameraStore.getState().isCapturing);

      cameraState.set({ isCapturing: false });

    } catch (e) {
      console.log('Error capturing image', e);
    }
  }