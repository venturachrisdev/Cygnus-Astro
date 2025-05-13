import Axios from 'axios';

import { getApiUrl } from './hosts';

export const setFramingSource = async (source: string = 'SKYATLAS') => {
  try {
    await Axios.get(`${await getApiUrl()}/framing/set-source?source=${source}`);
  } catch (e: Error | any) {
    console.log(e.response.data);
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

export const framingSlew = async (center: boolean = false) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/framing/slew?${center ? 'slew_option=Center' : ''}`,
    );
  } catch (e) {
    console.log('Error setting framing', e);
  }
};
