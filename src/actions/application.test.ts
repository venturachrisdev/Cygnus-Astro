import Axios from 'axios';

import {
  getCurrentTab,
  getLogs,
  getNinaVersion,
  getPlugins,
  getScreenshot,
  switchTab,
} from '@/actions/application';
import { useApplicationStore } from '@/stores/application.store';
import { ApplicationTab } from '@/stores/config.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
  useApplicationStore.getState().set({
    currentTab: ApplicationTab.EQUIPMENT,
    plugins: [],
    logs: [],
    ninaVersion: null,
    screenshot: null,
    isScreenshotLoading: false,
  });
});

describe('getScreenshot', () => {
  it('requests a non-streamed screenshot and stores the base64 body', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: 'base64image' } });

    const result = await getScreenshot();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/screenshot',
      { params: { resize: true, quality: 70, scale: 0.5, stream: false } },
    );
    expect(useApplicationStore.getState().screenshot).toBe('base64image');
    expect(useApplicationStore.getState().isScreenshotLoading).toBe(false);
    expect(result).toBe('base64image');
  });

  it('forwards custom params including size', async () => {
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
          stream: false,
          size: '800x600',
        },
      },
    );
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(getScreenshot()).resolves.toBeUndefined();
    expect(useApplicationStore.getState().isScreenshotLoading).toBe(false);
  });
});

describe('switchTab', () => {
  it('passes the tab param and updates the store', async () => {
    await switchTab(ApplicationTab.SEQUENCER);

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/switch-tab',
      { params: { tab: 'sequencer' } },
    );
    expect(useApplicationStore.getState().currentTab).toBe(
      ApplicationTab.SEQUENCER,
    );
  });
});

describe('getCurrentTab', () => {
  it('reads the active tab into the store', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: 'imaging' } });

    const result = await getCurrentTab();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/get-tab',
    );
    expect(useApplicationStore.getState().currentTab).toBe(
      ApplicationTab.IMAGING,
    );
    expect(result).toBe(ApplicationTab.IMAGING);
  });
});

describe('getPlugins', () => {
  it('stores the plugin list', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: ['Advanced API', 'Astro-Physics Tools'] },
    });

    const result = await getPlugins();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/application/plugins',
    );
    expect(useApplicationStore.getState().plugins).toEqual([
      'Advanced API',
      'Astro-Physics Tools',
    ]);
    expect(result).toHaveLength(2);
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
