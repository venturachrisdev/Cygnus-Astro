import { useFocuserStore } from "@/stores/focuser.store";
import { API_FOCUSER_INFO, API_FOCUSER_MOVE, API_URL, sleep } from "./constants";
import Axios from 'axios';
import { useCameraStore } from "@/stores/camera.store";

export const getFocuserInfo = async () => {
  const focuserState = useFocuserStore.getState();
  try {
    const response = (await Axios.get(`${API_URL}/${API_FOCUSER_INFO}`)).data;

    focuserState.set({
      isConnected: response.Response.Connected,
      isMoving: response.Response.IsMoving,
      position: response.Response.Position,
      stepSize: response.Response.StepSize || 100,
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting focuser', e);
  }
};

export const moveFocuser = async (position: number) => {
  const focuserState = useFocuserStore.getState();
  const cameraState = useCameraStore.getState();

  cameraState.set({ canCapture: false });

  try {
    console.log('Moving focuser', position, focuserState.position, focuserState.stepSize);
    await Axios.get(`${API_URL}/${API_FOCUSER_MOVE}?position=${position}`);

    await sleep(1000);
    let focuser = await getFocuserInfo();

    while (focuser.IsSettling || focuser.IsMoving) {
      console.log('Waiting for focuser to stop moving');
      await sleep(500);
      focuser = await getFocuserInfo();
    };

    await sleep(3000);
    await getFocuserInfo();
  } catch (e) {
    console.log('Error getting focuser', e);
  }

  cameraState.set({ canCapture: true });
};

export const moveFocuserUp = async () => {
  const focuser = await getFocuserInfo();
  const position = focuser.Position;
  const stepSize = focuser.StepSize || 100;

  await moveFocuser(position + stepSize);
};

export const moveFocuserDown = async () => {
  const focuser = await getFocuserInfo();
  const position = focuser.Position;
  const stepSize = focuser.StepSize || 100;

  await moveFocuser(position - stepSize);
};