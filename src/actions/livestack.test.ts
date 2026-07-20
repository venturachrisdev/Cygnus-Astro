import Axios from 'axios';

import {
  getLivestackImage,
  getLivestackImageInfo,
  getLivestackStatus,
  listAvailableLivestackImages,
  start,
  stop,
} from '@/actions/livestack';
import { useLivestackStore } from '@/stores/livestack.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
  useLivestackStore.getState().set({
    isRunning: false,
    status: 'stopped',
    availableImages: [],
    currentImage: null,
    currentImageInfo: null,
    selectedTarget: null,
    selectedFilter: null,
  });
});

describe('getLivestackStatus', () => {
  it('marks the store as running when NINA reports running', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: 'running', StatusCode: 200 },
    });

    const result = await getLivestackStatus();

    const state = useLivestackStore.getState();
    expect(state.status).toBe('running');
    expect(state.isRunning).toBe(true);
    expect(result).toBe('running');
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/livestack/status',
    );
  });

  it('marks the store as stopped when NINA reports stopped', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: 'stopped', StatusCode: 200 },
    });

    await getLivestackStatus();

    expect(useLivestackStore.getState().isRunning).toBe(false);
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getLivestackStatus()).resolves.toBeUndefined();
  });
});

describe('start', () => {
  it('calls the start endpoint then refreshes the status', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: 'Live stack started' },
    });
    mockedGet.mockResolvedValueOnce({
      data: { Response: 'running', StatusCode: 200 },
    });

    await start();

    expect(mockedGet).toHaveBeenNthCalledWith(
      1,
      'http://nina.test/v2/api/livestack/start',
    );
    expect(mockedGet).toHaveBeenNthCalledWith(
      2,
      'http://nina.test/v2/api/livestack/status',
    );
    expect(useLivestackStore.getState().isRunning).toBe(true);
  });
});

describe('stop', () => {
  it('calls the stop endpoint then refreshes the status', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: 'Live stack stopped' },
    });
    mockedGet.mockResolvedValueOnce({
      data: { Response: 'stopped', StatusCode: 200 },
    });

    await stop();

    expect(mockedGet).toHaveBeenNthCalledWith(
      1,
      'http://nina.test/v2/api/livestack/stop',
    );
    expect(mockedGet).toHaveBeenNthCalledWith(
      2,
      'http://nina.test/v2/api/livestack/status',
    );
    expect(useLivestackStore.getState().isRunning).toBe(false);
  });
});

describe('listAvailableLivestackImages', () => {
  it('maps the available target and filter combos into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: [
          { Target: 'M31', Filter: 'L' },
          { Target: 'M42', Filter: 'Ha' },
        ],
        StatusCode: 200,
      },
    });

    await listAvailableLivestackImages();

    expect(useLivestackStore.getState().availableImages).toEqual([
      { target: 'M31', filter: 'L' },
      { target: 'M42', filter: 'Ha' },
    ]);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/livestack/image/available',
    );
  });

  it('handles a missing response list', async () => {
    mockedGet.mockResolvedValueOnce({ data: { StatusCode: 200 } });

    await listAvailableLivestackImages();

    expect(useLivestackStore.getState().availableImages).toEqual([]);
  });
});

describe('getLivestackImage', () => {
  const toArrayBuffer = (text: string): ArrayBuffer => {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i += 1) {
      bytes[i] = text.charCodeAt(i);
    }
    return bytes.buffer;
  };

  it('streams the target and filter image and stores the base64 payload', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer('hi'),
      headers: { 'content-type': 'image/jpeg' },
    });

    const result = await getLivestackImage('M31', 'L');

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/livestack/image/M31/L',
      {
        params: { resize: true, quality: 90, scale: 0.7, stream: true },
        responseType: 'arraybuffer',
      },
    );
    expect(result).toBe(Buffer.from('hi').toString('base64'));
    expect(useLivestackStore.getState().currentImage).toBe(
      Buffer.from('hi').toString('base64'),
    );
  });

  it('returns null when no image is available', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer(
        JSON.stringify({ Error: 'No image found', StatusCode: 404 }),
      ),
      headers: { 'content-type': 'application/json' },
    });

    const result = await getLivestackImage('M31', 'L');

    expect(result).toBeNull();
    expect(useLivestackStore.getState().currentImage).toBeNull();
  });
});

describe('getLivestackImageInfo', () => {
  it('stores the metadata for the selected image', async () => {
    const infoResponse = {
      IsMonochrome: true,
      StackCount: 12,
      RedStackCount: null,
      GreenStackCount: null,
      BlueStackCount: null,
      Filter: 'L',
      Target: 'M31',
    };
    mockedGet.mockResolvedValueOnce({
      data: { Response: infoResponse, StatusCode: 200 },
    });

    const result = await getLivestackImageInfo('M31', 'L');

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/livestack/image/M31/L/info',
    );
    expect(result).toEqual(infoResponse);
    expect(useLivestackStore.getState().currentImageInfo).toEqual(infoResponse);
  });
});
