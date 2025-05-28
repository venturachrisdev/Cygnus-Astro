import Axios from 'axios';
import type { LSScanConfig } from 'react-native-lan-port-scanner';
import LanPortScanner from 'react-native-lan-port-scanner';

import { useAlertsStore } from '@/stores/alerts.store';
import { useCameraStore } from '@/stores/camera.store';
import type { ProfileConfig } from '@/stores/config.store';
import {
  ApplicationTab,
  ConnectionStatus,
  NINAConfigMap,
  useConfigStore,
} from '@/stores/config.store';
import { useDomeStore } from '@/stores/dome.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { useFlatPanelStore } from '@/stores/flatpanel.store';
import { useFocuserStore } from '@/stores/focuser.store';
import { useGuiderStore } from '@/stores/guider.store';
import { useMountStore } from '@/stores/mount.store';
import { useRotatorStore } from '@/stores/rotator.store';
import { useSafetyMonitorStore } from '@/stores/safetymonitor.store';
import { useSwitchesStore } from '@/stores/switches.stores';
import { useWeatherStore } from '@/stores/weather.store';

import { connectCamera, disconnectCamera, listCameraDevices } from './camera';
import type { Device } from './constants';
import { connectDome, disconnectDome, listDomeDevices } from './dome';
import {
  connectFilterWheel,
  disconnectFilterWheel,
  listFilterWheelDevices,
} from './filterwheel';
import {
  connectFlatPanel,
  disconnectFlatPanel,
  listFlatPanelDevices,
} from './flatpanel';
import {
  connectFocuser,
  disconnectFocuser,
  listFocuserDevices,
} from './focuser';
import { connectGuider, disconnectGuider, listGuiderDevices } from './guider';
import { connectMount, disconnectMount, listMountDevices } from './mount';
import {
  connectRotator,
  disconnectRotator,
  listRotatorDevices,
} from './rotator';
import {
  connectSafetyMonitor,
  disconnectSafetyMonitor,
  listSafetyMonitorDevices,
} from './safetymonitor';
import {
  connectSwitches,
  disconnectSwitches,
  listSwitchesDevices,
} from './switches';
import {
  connectWeather,
  disconnectWeather,
  listWeatherDevices,
} from './weather';

export const scanHosts = async (autoConnect?: boolean) => {
  const configState = useConfigStore.getState();
  const alertState = useAlertsStore.getState();

  const networkInfo = await LanPortScanner.getNetworkInfo();
  const config: LSScanConfig = {
    networkInfo,
    ports: [1888],
    timeout: 2000,
    threads: 200,
  };

  try {
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
        if (!configState.isConnected && devices.length === 1) {
          configState.set({ currentDevice: devices[0] });
          if (autoConnect) {
            console.log('Autoconnecting...');
            getApplicationVersion();
          }
        } else if (devices.length === 0) {
          alertState.set({
            message:
              'No N.I.N.A. instance found. Connect to the same network as your PC',
            type: 'info',
          });
          configState.set({
            isConnected: false,
            connectionStatus: ConnectionStatus.FAILED,
          });
        }
      },
    );
  } catch (e) {
    console.log('Error scanning hosts', e);
    alertState.set({
      message: 'No network available. Unable to auto-detect N.I.N.A. instance',
      type: 'error',
    });
    configState.set({
      isConnected: false,
      connectionStatus: ConnectionStatus.FAILED,
    });
  }
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

export const getCurrentProfile = async (fillDeviceInventory?: boolean) => {
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

    if (fillDeviceInventory) {
      await Promise.all([
        listCameraDevices(),
        listDomeDevices(),
        listFilterWheelDevices(),
        listFocuserDevices(),
        listSwitchesDevices(),
        listMountDevices(),
        listSafetyMonitorDevices(),
        listFlatPanelDevices(),
        listRotatorDevices(),
        listWeatherDevices(),
        listGuiderDevices(),
      ]);

      const storesByDeviceSettingKey: Record<string, any> = {
        CameraSettings: useCameraStore.getState(),
        DomeSettings: useDomeStore.getState(),
        FilterWheelSettings: useFilterWheelStore.getState(),
        FocuserSettings: useFocuserStore.getState(),
        SwitchSettings: useSwitchesStore.getState(),
        TelescopeSettings: useMountStore.getState(),
        SafetyMonitorSettings: useSafetyMonitorStore.getState(),
        FlatDeviceSettings: useFlatPanelStore.getState(),
        RotatorSettings: useRotatorStore.getState(),
        WeatherDataSettings: useWeatherStore.getState(),
        GuiderSettings: useGuiderStore.getState(),
      };

      for (const key of Object.keys(storesByDeviceSettingKey)) {
        const state = storesByDeviceSettingKey[key]!;
        const deviceId =
          response.Response[key].Id || response.Response[key].GuiderName;
        if (deviceId && deviceId !== 'No_Device' && deviceId !== 'No_Guider') {
          const currentDevice = state.devices.filter(
            (dev: Device) => dev.id === deviceId,
          );

          if (currentDevice.length) {
            state.set({
              currentDevice: currentDevice[0],
            });
          }
        }
      }
    }

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

export const getApplicationVersion = async (alertOnError?: boolean) => {
  const configState = useConfigStore.getState();
  const alertState = useAlertsStore.getState();

  configState.set({ isLoading: true });

  try {
    const response = (await Axios.get(`${await getApiUrl(true)}/version`)).data;
    if (response.StatusCode === 200 && response.Response) {
      configState.set({
        isConnected: true,
        apiVersion: response.Response,
        connectionStatus: ConnectionStatus.CONNECTED,
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
    configState.set({
      isLoading: false,
    });

    if (alertOnError) {
      configState.set({
        connectionStatus: ConnectionStatus.FAILED,
      });
    }

    if (configState.currentDevice?.name || alertOnError) {
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
  const alertState = useAlertsStore.getState();

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

  try {
    await Promise.all(updatePromises);
    alertState.set({
      message: 'Configuration saved successfully!',
      type: 'success',
    });
  } catch (e) {
    alertState.set({
      message: 'Unable to save configuration. Please try again.',
      type: 'error',
    });
  } finally {
    configState.set({ isLoading: false });
  }
};

export const connectAllEquipment = async () => {
  const alertsState = useAlertsStore.getState();
  try {
    await Promise.all([
      connectCamera(),
      connectMount(),
      connectFocuser(),
      connectGuider(),
      connectFlatPanel(),
      connectSafetyMonitor(),
      connectDome(),
      connectFilterWheel(),
      connectWeather(),
      connectSwitches(),
      connectRotator(),
    ]);
  } catch (e) {
    console.log('An error happened connecting all equipment', e);
    alertsState.set({
      message: 'Unable to connect equipment. Please try again.',
      type: 'error',
    });
  }
};

export const disconnectAllEquipment = async () => {
  const alertsState = useAlertsStore.getState();
  try {
    await Promise.all([
      disconnectCamera(),
      disconnectMount(),
      disconnectFocuser(),
      disconnectGuider(),
      disconnectFlatPanel(),
      disconnectSafetyMonitor(),
      disconnectDome(),
      disconnectFilterWheel(),
      disconnectWeather(),
      disconnectSwitches(),
      disconnectRotator(),
    ]);
  } catch (e) {
    console.log('An error happened disconnecting all equipment', e);
    alertsState.set({
      message: 'Unable to disconnect equipment. Please try again.',
      type: 'error',
    });
  }
};
