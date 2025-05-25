import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Device } from '@/actions/constants';
import { fetchGPSLocation } from '@/actions/gps';
import {
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
import { useConfigStore } from '@/stores/config.store';

export const Config = () => {
  const configState = useConfigStore();

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

    getProfiles();
    getCurrentProfile();
  }, []);

  return (
    <>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 p-4"
      >
        <Text className="mb-4 text-lg font-semibold text-white">
          NINA Advanced API
        </Text>
        <DeviceConnection
          isAPIConnected
          useInputText={!configState.isConnected}
          onInputTextChange={onInputTextChange}
          inputTextValue={configState.currentDevice?.name}
          onListExpand={() => setShowHostsList(!showHostsList)}
          currentDevice={configState.currentDevice}
          isConnected={configState.isConnected}
          devices={configState.devices}
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

        {configState.apiVersion && (
          <Text className="my-4 text-right text-sm text-gray-500">
            API Version:{' '}
            <Text className="font-bold">{configState.apiVersion}</Text>
          </Text>
        )}

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
          disabled={!configState.isConnected}
          onPress={() => handleDraftConfigUpdate()}
          color="green"
          icon="content-save-check"
        />
      </View>
    </>
  );
};
