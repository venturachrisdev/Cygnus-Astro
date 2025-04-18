import Axios from 'axios';
import { API_FILTERWHEEL_CHANGE, API_FILTERWHEEL_INFO, API_URL, sleep } from './constants';
import { useCameraStore } from '@/stores/camera.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { getFocuserInfo } from './focuser';

export const getFilterWheelInfo = async () => {
  const filterWheelState = useFilterWheelStore.getState();

  try {
    const response = (await Axios.get(`${API_URL}/${API_FILTERWHEEL_INFO}`)).data;
    filterWheelState.set({
      isConnected: response.Response.Connected,
      isMoving: response.Response.IsMoving,
      currentFilter: response.Response.SelectedFilter?.Id,
      availableFilters: response.Response.AvailableFilters.map((filter: any) => ({
        id: filter.Id,
        name: filter.Name,
      })),
    });

  } catch (e) {
    console.log("Error getting filter wheel", e);
  }
};

export const changeFilter = async (filter: number) => {
  const cameraState = useCameraStore.getState();
  cameraState.set({ canCapture: false });

  try {
    console.log('Changing filter', filter);
    await Axios.get(`${API_URL}/${API_FILTERWHEEL_CHANGE}?filterId=${filter}`);

    do {
      await sleep(1000);
      await getFilterWheelInfo();
      console.log('Waiting for filter wheel to stop moving');
    } while(useFilterWheelStore.getState().isMoving);


    await getFocuserInfo();
    cameraState.set({ canCapture: true });
  } catch (e) {
    console.log('Error changing filter', e);
  }

  cameraState.set({ canCapture: true });
};
