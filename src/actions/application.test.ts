import Axios from 'axios';

import { getLogs, getNinaVersion, getScreenshot } from '@/actions/application';
import { useApplicationStore } from '@/stores/application.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
  useApplicationStore.getState().set({
    logs: [],
    ninaVersion: null,
    screenshot: null,
    isScreenshotLoading: false,
  });
});

describe('getScreenshot', () => {
  const toArrayBuffer = (text: string): ArrayBuffer => {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i += 1) {
      bytes[i] = text.charCodeAt(i);
    }
    return bytes.buffer;
  };

  it('streams the screenshot and stores the base64 body', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer('hi'),
      headers: { 'content-type': 'image/jpeg' },
    });

    const result = await getScreenshot();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/screenshot',
      {
        params: { resize: true, quality: 70, scale: 0.5, stream: true },
        responseType: 'arraybuffer',
      },
    );
    expect(useApplicationStore.getState().screenshot).toBe(
      Buffer.from('hi').toString('base64'),
    );
    expect(useApplicationStore.getState().isScreenshotLoading).toBe(false);
    expect(result).toBe(Buffer.from('hi').toString('base64'));
  });

  it('forwards custom params including size', async () => {
    mockedGet.mockResolvedValueOnce({
      data: toArrayBuffer('hi'),
      headers: { 'content-type': 'image/jpeg' },
    });

    await getScreenshot({
      resize: true,
      quality: 90,
      scale: 0,
      size: '800x600',
    });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/screenshot',
      {
        params: {
          resize: true,
          quality: 90,
          scale: 0,
          size: '800x600',
          stream: true,
        },
        responseType: 'arraybuffer',
      },
    );
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getScreenshot()).resolves.toBeUndefined();
    expect(useApplicationStore.getState().isScreenshotLoading).toBe(false);
  });
});

describe('getLogs', () => {
  it('sends the required lineCount and maps entries into the store', async () => {
    mockedGet.mockResolvedValueOnce({
      data: {
        Response: [
          {
            Timestamp: '2026-07-20T21:00:00',
            Level: 'INFO',
            Source: 'Camera',
            Member: 'Connect',
            Line: '42',
            Message: 'Camera connected',
          },
        ],
      },
    });

    const result = await getLogs();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/logs',
      { params: { lineCount: 100 } },
    );
    expect(useApplicationStore.getState().logs).toEqual([
      {
        timestamp: '2026-07-20T21:00:00',
        level: 'INFO',
        source: 'Camera',
        member: 'Connect',
        line: '42',
        message: 'Camera connected',
      },
    ]);
    expect(result).toHaveLength(1);
  });

  it('forwards the level filter when provided', async () => {
    await getLogs({ lineCount: 50, level: 'ERROR' });

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/logs',
      { params: { lineCount: 50, level: 'ERROR' } },
    );
  });
});

describe('getNinaVersion', () => {
  it('defaults to the friendly format and stores the version', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: '3.1 HF2' } });

    const result = await getNinaVersion();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/version/nina',
      { params: { friendly: true } },
    );
    expect(useApplicationStore.getState().ninaVersion).toBe('3.1 HF2');
    expect(result).toBe('3.1 HF2');
  });

  it('passes friendly=false when requested', async () => {
    await getNinaVersion(false);

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/version/nina',
      { params: { friendly: false } },
    );
  });
});
