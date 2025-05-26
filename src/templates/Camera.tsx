import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  connectCamera,
  coolCamera,
  disconnectCamera,
  getCameraInfo,
  rescanCameraDevices,
  warmCamera,
} from '@/actions/camera';
import {
  getCurrentProfile,
  handleDraftConfigUpdate,
  setDraftConfig,
  setDraftConfigNumber,
} from '@/actions/hosts';
import { CircleButton } from '@/components/CircleButton';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { StatusChip } from '@/components/StatusChip';
import { TextInputLabel } from '@/components/TextInputLabel';
import { useCameraStore } from '@/stores/camera.store';
import { useConfigStore } from '@/stores/config.store';

export const Camera = () => {
  const cameraState = useCameraStore();
  const configState = useConfigStore();

  const [showDevicesList, setShowDevicesList] = useState(false);
  const [coolingTemp, setCoolingTemp] = useState('-10');

  const connectToCamera = () => {
    connectCamera(
      cameraState.currentDevice?.id ||
        useCameraStore.getState().currentDevice?.id ||
        '',
    );
  };

  useEffect(() => {
    rescanCameraDevices();
    getCurrentProfile();
    getCameraInfo();

    const interval = setInterval((_) => {
      getCameraInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 p-4"
      >
        <DeviceConnection
          isAPIConnected={configState.isConnected}
          onListExpand={() => setShowDevicesList(!showDevicesList)}
          currentDevice={cameraState.currentDevice}
          isConnected={cameraState.isConnected}
          devices={cameraState.devices}
          isListExpanded={showDevicesList}
          onConnect={() => connectToCamera()}
          onDisconnect={() => disconnectCamera()}
          onRescan={() => rescanCameraDevices()}
          onDeviceSelected={(device) => {
            setShowDevicesList(false);
            cameraState.set({ currentDevice: device });
          }}
        />

        <View className="my-3 flex w-full flex-row items-center justify-end">
          <View className="m-2 flex flex-row items-center justify-between">
            <View
              style={{ opacity: cameraState.isConnected ? 1.0 : 0.4 }}
              className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
            >
              <Text className="text-xs font-medium text-white">
                {cameraState.temperature}
              </Text>
              <Icon name="temperature-celsius" size={12} color="white" />
            </View>

            <StatusChip
              bubble
              isConnected={cameraState.isConnected}
              label="Cooling"
              isActive={cameraState.cooling}
            />
            <StatusChip
              isConnected={cameraState.isConnected}
              bubble
              label="Dew Heater"
              isActive={cameraState.dewHeater}
            />
            <StatusChip
              bubble
              isConnected={cameraState.isConnected}
              label="Exposing"
              isActive={cameraState.isExposing}
            />
          </View>
        </View>

        <Text className="text-lg font-semibold text-white">Camera</Text>
        <Text className="mb-3 mt-6 font-medium text-white">
          Cooling Temperature
        </Text>
        <View className="my-2 flex flex-row items-center justify-between">
          <View className="mr-3 flex flex-1">
            <TextInputLabel
              disabled={cameraState.isConnected}
              placeholder="Enter Cooling Temperature"
              onChange={(value) => setCoolingTemp(value)}
              value={coolingTemp}
            />
          </View>
          <View className="flex-row items-center justify-center">
            <View className="mr-2 w-24">
              <CustomButton
                disabled={
                  !configState.isConnected ||
                  !cameraState.isConnected ||
                  Number.isNaN(Number(coolingTemp)) ||
                  cameraState.cooling
                }
                onPress={() => coolCamera(Number(coolingTemp))}
                label="Cool"
              />
            </View>
            <View className="w-24">
              <CustomButton
                disabled={
                  !cameraState.isConnected ||
                  !cameraState.cooling ||
                  !configState.isConnected
                }
                onPress={() => warmCamera()}
                label="Warm"
                color="yellow"
              />
            </View>
          </View>
        </View>

        <Text className="mt-10 text-lg font-semibold text-white">
          Telescope
        </Text>
        <View className="my-2">
          <TextInputLabel
            label="Name"
            placeholder="Enter Telescope name"
            onChange={(value) => setDraftConfig('telescope', 'name', value)}
            value={configState.draftConfig.telescope?.name || ''}
          />
        </View>
        <View className="my-2 flex flex-row items-center justify-between">
          <View className="mr-3 flex flex-1">
            <TextInputLabel
              label="Focal Length"
              placeholder="Enter Focal Length"
              onChange={(value) =>
                setDraftConfigNumber('telescope', 'focalLength', value)
              }
              value={String(configState.draftConfig.telescope?.focalLength)}
            />
          </View>

          <View className="ml-3 flex w-36">
            <TextInputLabel
              label="Focal Ratio"
              placeholder="Enter Focal Ratio"
              onChange={(value) =>
                setDraftConfigNumber('telescope', 'focalRatio', value)
              }
              value={String(configState.draftConfig.telescope?.focalRatio)}
            />
          </View>
        </View>
        <View className="h-24" />
      </ScrollView>

      <View className="absolute bottom-5 right-5">
        <CircleButton
          disabled={
            !cameraState.isConnected ||
            !configState.isConnected ||
            configState.isLoading
          }
          onPress={() => handleDraftConfigUpdate()}
          color="green"
          icon="content-save-check"
        />
      </View>
    </>
  );
};
