import Axios from 'axios';

import type { LogEntry } from '@/stores/application.store';
import { useApplicationStore } from '@/stores/application.store';

import { getApiUrl } from './hosts';
import { fetchStreamedImage } from './image';

export interface ScreenshotParams {
  resize?: boolean;
  quality?: number;
  scale?: number;
  size?: string;
}

export interface LogParams {
  lineCount?: number;
  level?: string;
}

export const getScreenshot = async (params: ScreenshotParams = {}) => {
  const applicationState = useApplicationStore.getState();
  applicationState.set({ isScreenshotLoading: true });

  try {
    const screenshot = await fetchStreamedImage(
      `${await getApiUrl()}/application/screenshot`,
      {
        resize: params.resize ?? true,
        quality: params.quality ?? 70,
        scale: params.scale ?? 0.5,
        ...(params.size ? { size: params.size } : {}),
      },
    );

    applicationState.set({ screenshot });
    return screenshot;
  } catch (e) {
    console.log('Error getting application screenshot', e);
  } finally {
    applicationState.set({ isScreenshotLoading: false });
  }

  return undefined;
};

export const getLogs = async (
  params: LogParams = {},
): Promise<LogEntry[] | undefined> => {
  const applicationState = useApplicationStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/application/logs`, {
        params: {
          /* lineCount is required by the endpoint (QueryField(true)) */
          lineCount: params.lineCount ?? 100,
          ...(params.level ? { level: params.level } : {}),
        },
      })
    ).data;

    const logs = ((response.Response ?? []) as any[]).map((log) => ({
      timestamp: log.Timestamp,
      level: log.Level,
      source: log.Source,
      member: log.Member,
      line: log.Line,
      message: log.Message,
    }));

    applicationState.set({ logs });
    return logs;
  } catch (e) {
    console.log('Error getting application logs', e);
  }

  return undefined;
};

export const getNinaVersion = async (friendly: boolean = true) => {
  const applicationState = useApplicationStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/version/nina`, {
        params: { friendly },
      })
    ).data;

    applicationState.set({ ninaVersion: response.Response });
    return response.Response;
  } catch (e) {
    console.log('Error getting N.I.N.A. version', e);
  }

  return undefined;
};
