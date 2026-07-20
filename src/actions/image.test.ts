import Axios from 'axios';

import {
  fetchStreamedImage,
  getFullImageByIndex,
  getImageByIndex,
} from '@/actions/image';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

const toArrayBuffer = (text: string): ArrayBuffer => {
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i += 1) {
    bytes[i] = text.charCodeAt(i);
  }
  return bytes.buffer;
};

beforeEach(() => {
  mockedGet.mockReset();
});

describe('fetchStreamedImage', () => {
  it('requests stream=true and base64-encodes the raw image bytes', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer('hi'),
      headers: { 'content-type': 'image/jpeg' },
    });

    const result = await fetchStreamedImage('http://nina.test/v2/api/image/0', {
      quality: 90,
    });

    expect(mockedGet).toHaveBeenCalledWith('http://nina.test/v2/api/image/0', {
      params: { quality: 90, stream: true },
      responseType: 'arraybuffer',
    });
    expect(result).toBe(Buffer.from('hi').toString('base64'));
  });

  it('throws using the API error message when the response is not an image', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer(
        JSON.stringify({ Error: 'No images available', StatusCode: 500 }),
      ),
      headers: { 'content-type': 'application/json' },
    });

    await expect(
      fetchStreamedImage('http://nina.test/v2/api/image/0'),
    ).rejects.toThrow('No images available');
  });
});

describe('getFullImageByIndex', () => {
  it('requests autoPrepare and high quality/scale for the full image', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer('hi'),
      headers: { 'content-type': 'image/jpeg' },
    });

    const result = await getFullImageByIndex(3);

    expect(mockedGet).toHaveBeenCalledWith('http://nina.test/v2/api/image/3', {
      params: { autoPrepare: true, quality: 90, scale: 0.7, stream: true },
      responseType: 'arraybuffer',
    });
    expect(result).toBe(Buffer.from('hi').toString('base64'));
  });

  it('returns null and swallows errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getFullImageByIndex(3)).resolves.toBeNull();
  });
});

describe('getImageByIndex', () => {
  it('requests a resized low quality thumbnail', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer('hi'),
      headers: { 'content-type': 'image/jpeg' },
    });

    const result = await getImageByIndex(3);

    expect(mockedGet).toHaveBeenCalledWith('http://nina.test/v2/api/image/3', {
      params: {
        resize: true,
        autoPrepare: true,
        quality: 40,
        scale: 0.3,
        stream: true,
      },
      responseType: 'arraybuffer',
    });
    expect(result).toBe(Buffer.from('hi').toString('base64'));
  });
});
