import Axios from 'axios';

import { useAlertsStore } from '@/stores/alerts.store';
import { useSequenceStore } from '@/stores/sequence.store';

import {
  API_SEQUENCE_START,
  API_SEQUENCE_STATE,
  API_SEQUENCE_STOP,
} from './constants';
import { getApiUrl } from './hosts';

export const getSequenceState = async () => {
  const sequenceState = useSequenceStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_SEQUENCE_STATE}`)
    ).data;
    if (Array.isArray(response.Response)) {
      sequenceState.set({
        isRunning: response.Response.some(
          (seq: any) => seq.Status === 'RUNNING',
        ),
        sequence: response.Response,
      });
    }

    return response.Response;
  } catch (e) {
    console.log('Error getting sequence', e);
  }
};

export const startSequence = async () => {
  const sequenceState = useSequenceStore.getState();
  const alertState = useAlertsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/${API_SEQUENCE_START}`);
    await getSequenceState();
    if (sequenceState.isRunning) {
      alertState.set({ message: 'Sequence is now running', type: 'success' });
    }
  } catch (e) {
    console.log('Error getting sequence', e);
  }
};

export const stopSequence = async () => {
  const sequenceState = useSequenceStore.getState();
  const alertState = useAlertsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/${API_SEQUENCE_STOP}`);
    await getSequenceState();
    if (!sequenceState.isRunning) {
      alertState.set({ message: 'Sequence has been stopped', type: 'success' });
    }
  } catch (e) {
    console.log('Error getting sequence', e);
  }
};

export const resetSequence = async () => {
  const alertState = useAlertsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/sequence/reset`);
    alertState.set({ message: 'Sequence has been reset', type: 'success' });
  } catch (e) {
    console.log('Error getting sequence', e);
  }
};

export const setSequenceTarget = async (
  name: string,
  ra: number,
  dec: number,
) => {
  const alertState = useAlertsStore.getState();

  try {
    await Axios.get(`${await getApiUrl()}/sequence/set-target`, {
      params: {
        name,
        ra,
        dec,
      },
    });
    alertState.set({
      message: 'Sequence target added successfully!',
      type: 'success',
    });
  } catch (e) {
    console.log('Error getting sequence', e);
    alertState.set({
      message: 'Target could not be added to Sequence',
      type: 'error',
    });
  }
};

export const getFullImageByIndex = async (index: number) => {
  try {
    const response = (
      await Axios.get(
        `${await getApiUrl()}/image/${index}?autoPrepare=true&quality=90&scale=0.7`,
      )
    ).data;

    if (response.Response && response.StatusCode === 200) {
      return response.Response;
    }

    return null;
  } catch (e) {
    console.log('Error getting sequence', e);

    return null;
  }
};

export const getImageByIndex = async (index: number) => {
  try {
    const response = (
      await Axios.get(
        `${await getApiUrl()}/image/${index}?resize=true&autoPrepare=true&quality=40&scale=0.3`,
      )
    ).data;

    if (response.Response && response.StatusCode === 200) {
      return response.Response;
    }

    return null;
  } catch (e) {
    console.log('Error getting sequence', e);

    return null;
  }
};

export const getImageHistory = async (queryThumbnails: boolean = true) => {
  const sequenceState = useSequenceStore.getState();

  if (queryThumbnails) {
    sequenceState.set({ isLoadingImages: true });
  }

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/image-history?all=true`)
    ).data;

    if (Array.isArray(response.Response)) {
      const currentSet =
        response.Response.length === sequenceState.images.length
          ? sequenceState.images
          : [];
      response.Response.forEach((item: any, index: number) => {
        if (!currentSet[index]) {
          currentSet.push({
            index,
            filter: item.Filter,
            hfr: item.HFR,
            duration: item.ExposureTime,
            mean: item.Mean,
            date: item.Date,
            image: null,
          });
          console.log('OVERRIDING INDEX', index);
        }
      });

      const promises = [];

      if (queryThumbnails) {
        for (const h of currentSet) {
          if (!h.image) {
            promises.push(
              (async () => {
                const image = await getImageByIndex(h.index);
                if (image && currentSet[h.index]) {
                  currentSet[h.index]!.image = image;
                }
              })(),
            );
          }
        }
        await Promise.all(promises);
      }

      if (queryThumbnails) {
        sequenceState.set({ isLoadingImages: false });
      }
    }

    return response.Response;
  } catch (e) {
    console.log('Error getting sequence', e);
    sequenceState.set({ isLoadingImages: false });
  }
};

export const convertTimespanToHMS = (timeSpan: number) => {
  if (timeSpan === 24) {
    return '00:00:00';
  }

  // Calculate duration in milliseconds
  const durationMs = timeSpan * 60 * 60 * 1000;

  // Get the hours, minutes, and seconds
  const hours = Math.floor(durationMs / (60 * 60 * 1000));
  const minutes = Math.floor((durationMs % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((durationMs % (60 * 1000)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}s`;
};
