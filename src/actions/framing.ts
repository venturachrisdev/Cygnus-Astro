import Axios from 'axios';

import { useAlertsStore } from '@/stores/alerts.store';
import { useNGCStore } from '@/stores/ngc.store';

import { getApiUrl } from './hosts';

export const setFramingSource = async (source: string = 'SKYATLAS') => {
  try {
    await Axios.get(`${await getApiUrl()}/framing/set-source?source=${source}`);
  } catch (e: Error | any) {
    console.log('Error setting framing', e);
  }
};

export const setFramingCoordinates = async (
  raInDegrees: number,
  decInDegrees: number,
) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/framing/set-coordinates?RAangle=${raInDegrees}&DECAngle=${decInDegrees}`,
    );
  } catch (e) {
    console.log('Error setting framing', e);
  }
};

export const framingSlew = async (
  center: boolean = false,
  waitForResult: boolean = false,
) => {
  const ngcState = useNGCStore.getState();
  const alertState = useAlertsStore.getState();

  ngcState.set({
    isRunning: true,
  });

  try {
    await Axios.get(`${await getApiUrl()}/framing/slew`, {
      params: {
        waitForResult,
        slew_option: center ? 'Center' : undefined,
      },
      timeout: 1000 * 60 * 5, // 5 mins
    });

    ngcState.set({
      isRunning: false,
    });
  } catch (e) {
    console.log('Error setting framing', e);

    ngcState.set({
      isRunning: false,
    });
    alertState.set({
      message: 'Unable to frame target',
      type: 'error',
    });
  }
};
