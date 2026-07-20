import Axios from 'axios';

import { useLivestackStore } from '@/stores/livestack.store';

import { getApiUrl } from './hosts';
import { fetchStreamedImage } from './image';

export const getLivestackStatus = async () => {
  const livestackState = useLivestackStore.getState();

  try {
    const response = (await Axios.get(`${await getApiUrl()}/livestack/status`))
      .data;

    livestackState.set({
      status: response.Response,
      isRunning: response.Response === 'running',
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting live stack status', e);
    return undefined;
  }
};

export const start = async () => {
  const livestackState = useLivestackStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/livestack/start`);
    await getLivestackStatus();
  } catch (e) {
    console.log('Error starting live stack', e);
    livestackState.set({ isRunning: false });
  }
};

export const stop = async () => {
  const livestackState = useLivestackStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/livestack/stop`);
    await getLivestackStatus();
  } catch (e) {
    console.log('Error stopping live stack', e);
    livestackState.set({ isRunning: false });
  }
};

export const listAvailableLivestackImages = async () => {
  const livestackState = useLivestackStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/livestack/image/available`)
    ).data;

    const availableImages = (response.Response ?? []).map((image: any) => ({
      target: image.Target,
      filter: image.Filter,
    }));

    livestackState.set({ availableImages });

    return response.Response;
  } catch (e) {
    console.log('Error getting live stack images', e);
    return undefined;
  }
};

export const getLivestackImage = async (target: string, filter: string) => {
  const livestackState = useLivestackStore.getState();

  try {
    const image = await fetchStreamedImage(
      `${await getApiUrl()}/livestack/image/${target}/${filter}`,
      { resize: true, quality: 90, scale: 0.7 },
    );

    livestackState.set({ currentImage: image });

    return image;
  } catch (e) {
    console.log('Error getting live stack image', e);

    return null;
  }
};

export const getLivestackImageInfo = async (target: string, filter: string) => {
  const livestackState = useLivestackStore.getState();

  try {
    const response = (
      await Axios.get(
        `${await getApiUrl()}/livestack/image/${target}/${filter}/info`,
      )
    ).data;

    if (response.Response && response.StatusCode === 200) {
      livestackState.set({ currentImageInfo: response.Response });

      return response.Response;
    }

    return null;
  } catch (e) {
    console.log('Error getting live stack image info', e);

    return null;
  }
};
