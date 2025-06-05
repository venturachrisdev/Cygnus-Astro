import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Device } from '@/actions/constants';
import { fetchGPSLocation } from '@/actions/gps';
import {
  connectAllEquipment,
  disconnectAllEquipment,
  getApplicationVersion,
  getCurrentProfile,
  getProfiles,
  handleDraftConfigUpdate,
  scanHosts,
  setDraftConfigNumber,
  switchProfile,
} from '@/actions/hosts';
import { CircleButton } from '@/components/CircleButton';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { DropDown } from '@/components/DropDown';
import { TextInputLabel } from '@/components/TextInputLabel';
import { useCameraStore } from '@/stores/camera.store';
import { useConfigStore } from '@/stores/config.store';
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

export const Config = () => {
  const configState = useConfigStore();
  const cameraState = useCameraStore();
  const domeState = useDomeStore();
  const filterWheelState = useFilterWheelStore();
  const focuserState = useFocuserStore();
  const switchState = useSwitchesStore();
  const mountState = useMountStore();
  const safetyMonitorState = useSafetyMonitorStore();
  const flatDeviceState = useFlatPanelStore();
  const rotatorState = useRotatorStore();
  const weatherState = useWeatherStore();
  const guiderState = useGuiderStore();

  const [showHostsList, setShowHostsList] = useState(false);
  const [showProfilesList, setShowProfilesList] = useState(false);

  const onHostSelected = (host: Device) => {
    configState.set({ currentDevice: host });
    setShowHostsList(false);
  };

  const onInputTextChange = (text: string) => {
    configState.set({
      currentDevice: {
        name: text,
        id: text,
      },
    });
  };

  const onProfileSelected = (profile: Device) => {
    switchProfile(profile.id);
    setShowProfilesList(false);
  };

  const onDisconnect = () => {
    configState.set({ isConnected: false, currentDevice: null });
  };

  useEffect(() => {
    if (configState.currentDevice === null) {
      scanHosts();
    }

    if (useConfigStore.getState().isConnected) {
      getProfiles();
      getCurrentProfile(true);
    }
  }, []);

  const allConnected =
    cameraState.isConnected &&
    domeState.isConnected &&
    filterWheelState.isConnected &&
    focuserState.isConnected &&
    switchState.isConnected &&
    mountState.isConnected &&
    safetyMonitorState.isConnected &&
    flatDeviceState.isConnected &&
    rotatorState.isConnected &&
    weatherState.isConnected &&
    guiderState.isConnected;

  const noneConnected =
    !cameraState.isConnected &&
    !domeState.isConnected &&
    !filterWheelState.isConnected &&
    !focuserState.isConnected &&
    !switchState.isConnected &&
    !mountState.isConnected &&
    !safetyMonitorState.isConnected &&
    !flatDeviceState.isConnected &&
    !rotatorState.isConnected &&
    !weatherState.isConnected &&
    !guiderState.isConnected;

  return (
    <>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 p-4"
      >
        <Text className="mb-4 text-lg font-semibold text-white">
          N.I.N.A. Advanced API
        </Text>

        <DeviceConnection
          isAPIConnected
          useInputText={!configState.isConnected}
          onInputTextChange={onInputTextChange}
          inputTextValue={configState.currentDevice?.name}
          onListExpand={() => setShowHostsList(!showHostsList)}
          currentDevice={configState.currentDevice}
          isConnected={configState.isConnected}
          devices={!configState.isConnected ? configState.devices : []}
          isListExpanded={showHostsList}
          onConnect={() => getApplicationVersion(true)}
          onDisconnect={onDisconnect}
          onRescan={() => scanHosts()}
          onDeviceSelected={onHostSelected}
        />
        <View className="mt-3" />
        <DropDown
          onListExpand={() => setShowProfilesList(!showProfilesList)}
          currentItem={configState.currentProfile}
          items={configState.profiles}
          isListExpanded={showProfilesList}
          onItemSelected={onProfileSelected}
          defaultText="Select Profile"
        />

        <Text className="my-4 text-right text-sm text-gray-500">
          App Version:{' '}
          <Text className="font-bold">{Constants.expoConfig?.version}</Text>
          {configState.apiVersion && (
            <Text>
              {'    |    '}API Version:{' '}
              <Text className="font-bold">{configState.apiVersion}</Text>
            </Text>
          )}
        </Text>

        <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-4">
          <View className="flex-1">
            <CustomButton
              icon="connection"
              iconSize={20}
              disabled={!configState.isConnected || allConnected}
              onPress={() => connectAllEquipment()}
              label="Connect All Equipment"
            />
          </View>
          <View className="flex-1">
            <CustomButton
              icon="connection"
              iconSize={20}
              disabled={!configState.isConnected || noneConnected}
              onPress={() => disconnectAllEquipment()}
              label="Disconnect All Equipment"
              color="red"
            />
          </View>
        </View>

        <Text className="mt-6 text-lg font-semibold text-white">
          Astrometry
        </Text>
        <View className="flex flex-row items-center justify-between">
          <View className="mr-3 flex flex-1">
            <TextInputLabel
              placeholder="Enter Longitude"
              value={String(configState.draftConfig.astrometry?.longitude)}
              onChange={(value) =>
                setDraftConfigNumber('astrometry', 'longitude', value)
              }
              label="Longitude"
            />

            <TextInputLabel
              placeholder="Enter Elevation"
              value={String(configState.draftConfig.astrometry?.elevation)}
              onChange={(value) =>
                setDraftConfigNumber('astrometry', 'elevation', value)
              }
              label="Elevation"
            />
          </View>

          <View className="ml-3 flex flex-1">
            <TextInputLabel
              placeholder="Enter Latitude"
              value={String(configState.draftConfig.astrometry?.latitude)}
              onChange={(value) =>
                setDraftConfigNumber('astrometry', 'latitude', value)
              }
              label="Latitude"
            />

            <View className="w-20">
              <CustomButton
                onPress={fetchGPSLocation}
                icon="crosshairs-gps"
                iconSize={24}
              />
            </View>
          </View>
        </View>

        <View className="pb-24" />
      </ScrollView>

      <View className="absolute bottom-5 right-5">
        <CircleButton
          disabled={!configState.isConnected || configState.isLoading}
          onPress={() => handleDraftConfigUpdate()}
          color="green"
          icon="content-save-check"
        />
      </View>
    </>
  );
};
