import Axios from 'axios';

import { arrayBufferToBase64 } from '@/helpers/binary';

import { getApiUrl } from './hosts';

/* The plugin always responds HTTP 200; an API-level error (e.g. index out of
   range) still comes back as a JSON body even when stream=true is requested,
   so the only way to tell success from failure is the Content-Type header. */
export const fetchStreamedImage = async (
  url: string,
  params: Record<string, unknown> = {},
): Promise<string> => {
  const response = await Axios.get<ArrayBuffer>(url, {
    params: { ...params, stream: true },
    responseType: 'arraybuffer',
  });

  const contentType = String(response.headers['content-type'] ?? '');
  if (!contentType.startsWith('image/')) {
    const body = JSON.parse(new TextDecoder().decode(response.data));
    throw new Error(body.Error ?? 'Image request failed');
  }

  return arrayBufferToBase64(response.data);
};

export const getFullImageByIndex = async (index: number) => {
  try {
    return await fetchStreamedImage(`${await getApiUrl()}/image/${index}`, {
      autoPrepare: true,
      quality: 90,
      scale: 0.7,
    });
  } catch (e) {
    console.log('Error getting image', e);
    return null;
  }
};

export const getImageByIndex = async (index: number) => {
  try {
    return await fetchStreamedImage(`${await getApiUrl()}/image/${index}`, {
      resize: true,
      autoPrepare: true,
      quality: 40,
      scale: 0.3,
    });
  } catch (e) {
    console.log('Error getting image', e);
    return null;
  }
};
