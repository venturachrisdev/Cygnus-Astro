import Axios from 'axios';
import type { LSScanConfig } from 'react-native-lan-port-scanner';
import LanPortScanner from 'react-native-lan-port-scanner';

import { useAlertsStore } from '@/stores/alerts.store';
import type { ProfileConfig } from '@/stores/config.store';
import {
  ApplicationTab,
  NINAConfigMap,
  useConfigStore,
} from '@/stores/config.store';

import type { Device } from './constants';

export const scanHosts = async () => {
  const configState = useConfigStore.getState();
  const alertState = useAlertsStore.getState();

  const networkInfo = await LanPortScanner.getNetworkInfo();
  const config: LSScanConfig = {
    networkInfo,
    ports: [1888],
    timeout: 1000,
    threads: 150,
  };

  LanPortScanner.startScan(
    config,
    (_totalHosts: number, _hostScanned: number) => {},
    (_result) => {},
    (results) => {
      console.log('Hosts scanned', results.length);
      const devices = results.map(
        (host) =>
          ({
            id: host.ip,
            name: `${host.ip}:${host.port}`,
          }) as Device,
      );
      configState.set({ devices });
      if (
        !configState.isConnected &&
        devices.length === 1 &&
        configState.currentDevice?.id !== devices[0]?.id
      ) {
        configState.set({ currentDevice: devices[0] });
      } else if (devices.length === 0) {
        alertState.set({
          message: 'No devices found!',
          type: 'info',
        });
        configState.set({
          isConnected: false,
          currentDevice: null,
        });
      }
    },
  );
};

export const getApiUrl = async (
  skipCheck: boolean = false,
  asHttp: boolean = true,
): Promise<string> => {
  const configState = useConfigStore.getState();

  const apiUrl = configState.currentDevice?.name;
  if (!apiUrl) {
    throw new Error('API URL not found. Please connect to the Advanced API.');
  }

  if (
    !configState.isConnected &&
    configState.currentDevice !== null &&
    !skipCheck
  ) {
    await getApplicationVersion();
  }

  return asHttp ? `http://${apiUrl}/v2/api` : apiUrl;
};

export const getProfiles = async () => {
  const configState = useConfigStore.getState();
  configState.set({ isLoading: true });

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/profile/show?active=false`)
    ).data;
    configState.set({
      profiles: response.Response.map((profile: any) => ({
        id: profile.Id,
        name: profile.Name,
      })),
    });
  } catch (e) {
    console.log('Error getting profile', e);
  }

  configState.set({ isLoading: false });
};

export const getCurrentProfile = async () => {
  const configState = useConfigStore.getState();
  configState.set({ isLoading: true });

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/profile/show?active=true`)
    ).data;

    const profileConfig: ProfileConfig = {
      astrometry: {
        latitude: response.Response.AstrometrySettings.Latitude,
        longitude: response.Response.AstrometrySettings.Longitude,
        elevation: response.Response.AstrometrySettings.Elevation,
      },
      telescope: {
        name: response.Response.TelescopeSettings.Name,
        focalLength: response.Response.TelescopeSettings.FocalLength,
        focalRatio: response.Response.TelescopeSettings.FocalRatio,
      },
      snapshot: {
        duration: response.Response.SnapShotControlSettings.ExposureDuration,
      },
    };

    configState.set({
      currentProfile: {
        id: response.Response.Id,
        name: response.Response.Name,
      },
      config: profileConfig,
      draftConfig: profileConfig,
    });
  } catch (e) {
    console.log('Error getting profile', e);
  }

  configState.set({ isLoading: false });
};

export const switchProfile = async (id: string) => {
  const configState = useConfigStore.getState();
  configState.set({ isLoading: true });

  try {
    await Axios.get(`${await getApiUrl()}/profile/switch?profileid=${id}`);
    await getCurrentProfile();
  } catch (e) {
    console.log('Error updating profile', e);
  }

  configState.set({ isLoading: false });
};

export const updateProfile = async (settingPath: string, value: string) => {
  const configState = useConfigStore.getState();
  configState.set({ isLoading: true });

  try {
    await Axios.get(
      `${await getApiUrl()}/profile/change-value?settingpath=${settingPath}&newValue=${value}`,
    );
    await getCurrentProfile();
  } catch (e) {
    console.log('Error updating profile', e);
  }

  configState.set({ isLoading: false });
};

export const switchApplicationTab = async (tab: ApplicationTab) => {
  try {
    await Axios.get(`${await getApiUrl()}/application/switch-tab?tab=${tab}`);
  } catch (e) {
    console.log('Error updating profile', e);
  }
};

export const getCurrentApplicationTab = async (): Promise<ApplicationTab> => {
  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/application/get-tab`)
    ).data;
    return response.Response as ApplicationTab;
  } catch (e) {
    console.log('Error updating profile', e);
  }

  return ApplicationTab.EQUIPMENT;
};

export const getApplicationVersion = async () => {
  const configState = useConfigStore.getState();
  const alertState = useAlertsStore.getState();

  configState.set({ isLoading: true });

  try {
    const response = (await Axios.get(`${await getApiUrl(true)}/version`)).data;
    if (response.StatusCode === 200 && response.Response) {
      configState.set({
        isConnected: true,
        apiVersion: response.Response,
      });

      await getProfiles();
      await getCurrentProfile();

      // Initialize tabs
      const currentTab = await getCurrentApplicationTab();
      await switchApplicationTab(ApplicationTab.FRAMING);
      await switchApplicationTab(ApplicationTab.SEQUENCER);
      await switchApplicationTab(currentTab);

      configState.set({ isLoading: false });
      if (configState.currentDevice?.name) {
        alertState.set({
          message: `Connected to ${configState.currentDevice?.name}`,
          type: 'success',
        });
      }
      return response.Response;
    }
  } catch (e) {
    console.log('Error getting application version', e);
    configState.set({ isLoading: false });
    if (configState.currentDevice?.name) {
      alertState.set({
        message: `Unable to connect to ${configState.currentDevice?.name}`,
        type: 'error',
      });
    }
  }
};

export const setDraftConfig = (parent: string, prop: string, value: string) => {
  const configState = useConfigStore.getState();
  configState.set({
    ...configState.draftConfig,
    draftConfig: {
      [parent]: {
        ...(configState.draftConfig as any)[parent],
        [prop]: value,
      },
    } as any,
  });
};

export const setDraftConfigNumber = (
  parent: string,
  prop: string,
  value: string,
) => {
  const configState = useConfigStore.getState();
  const toNumber = Number(value);

  if (
    Number.isNaN(toNumber) &&
    !value.endsWith('.') &&
    value !== '' &&
    !value.startsWith('-')
  ) {
    return;
  }

  configState.set({
    ...configState.draftConfig,
    draftConfig: {
      [parent]: {
        ...(configState.draftConfig as any)[parent],
        [prop]: value,
      },
    } as any,
  });
};

export const handleDraftConfigUpdate = async () => {
  const configState = useConfigStore.getState();
  configState.set({ isLoading: true });
  const updatePromises = [];

  const newConfig = configState.draftConfig as any;
  const oldConfig = configState.config as any;
  for (const draftConfigKey of Object.keys(newConfig)) {
    for (const prop of Object.keys(newConfig[draftConfigKey])) {
      if (newConfig[draftConfigKey][prop] !== oldConfig[draftConfigKey][prop]) {
        const NINAKey = NINAConfigMap[`${draftConfigKey}.${prop}`];
        if (NINAKey) {
          updatePromises.push(
            updateProfile(NINAKey, newConfig[draftConfigKey][prop]),
          );
        }
      }
    }
  }

  await Promise.all(updatePromises);
  configState.set({ isLoading: false });
};
