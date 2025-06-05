import GetLocation from 'react-native-get-location';

import { useAlertsStore } from '@/stores/alerts.store';
import { useConfigStore } from '@/stores/config.store';

export const fetchGPSLocation = async () => {
  const alertState = useAlertsStore.getState();
  const configState = useConfigStore.getState();

  try {
    const location = await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

    configState.set({
      draftConfig: {
        ...configState.draftConfig,
        astrometry: {
          latitude: Number(location.latitude.toPrecision(6)) || 0,
          longitude: Number(location.longitude.toPrecision(6)) || 0,
          elevation: Number(location.altitude.toPrecision(6)) || 0,
        },
      },
    });
    alertState.set({
      message: 'GPS Coordinates retrieved successfully!',
      type: 'success',
    });
  } catch (error: Error | any) {
    const { code, message } = error;
    console.warn(code, message);
    alertState.set({
      message: 'Unable to fetch GPS coordinates. Please try again.',
      type: 'error',
    });
  }
};
