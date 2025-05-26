import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  connectFlatPanel,
  disconnectFlatPanel,
  getFlatPanelInfo,
  rescanFlatPanelDevices,
  setFlatPanelBrightness,
  setFlatPanelCover,
  setFlatPanelLight,
} from '@/actions/flatpanel';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { StatusChip } from '@/components/StatusChip';
import { useAlertsStore } from '@/stores/alerts.store';
import { useConfigStore } from '@/stores/config.store';
import { useFlatPanelStore } from '@/stores/flatpanel.store';

export const FlatPanel = () => {
  const flatPanelState = useFlatPanelStore();
  const configState = useConfigStore();
  const alertsState = useAlertsStore();

  const [showDevicesList, setShowDevicesList] = useState(false);
  const [brightness, setBrightness] = useState(
    String(flatPanelState.brightness),
  );

  useEffect(() => {
    rescanFlatPanelDevices();
    getFlatPanelInfo();

    const interval = setInterval((_) => {
      getFlatPanelInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const setFlatBrightness = (brightnessValue: number) => {
    if (
      brightnessValue <= flatPanelState.maxBrightness &&
      brightnessValue >= flatPanelState.minBrightness
    ) {
      setFlatPanelBrightness(brightnessValue);
    } else {
      alertsState.set({
        message: `Brightness value must be between ${flatPanelState.minBrightness} - ${flatPanelState.maxBrightness}`,
        type: 'error',
      });
    }
  };

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowDevicesList(!showDevicesList)}
        currentDevice={flatPanelState.currentDevice}
        isConnected={flatPanelState.isConnected}
        devices={flatPanelState.devices}
        isListExpanded={showDevicesList}
        onConnect={() =>
          connectFlatPanel(flatPanelState.currentDevice?.id || '')
        }
        onDisconnect={() => disconnectFlatPanel()}
        onRescan={() => rescanFlatPanelDevices()}
        onDeviceSelected={(device) => {
          setShowDevicesList(false);
          flatPanelState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <View
            style={{ opacity: flatPanelState.isConnected ? 1.0 : 0.4 }}
            className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
          >
            <Text className="text-xs font-medium text-white">
              Brightness:{' '}
              <Text className="font-bold">{flatPanelState.brightness}</Text>
            </Text>
          </View>
          <StatusChip
            isConnected={flatPanelState.isConnected}
            bubble
            label="Open"
            isActive={flatPanelState.coverState === 'Open'}
          />
          <StatusChip
            isConnected={flatPanelState.isConnected}
            bubble
            label="Light"
            last
            isActive={flatPanelState.lightOn}
          />
        </View>
      </View>

      <View className="mx-2 my-8 flex flex-row items-center justify-between gap-x-10">
        <View className="flex-1">
          {flatPanelState.coverState === 'Open' && (
            <CustomButton
              disabled={!flatPanelState.isConnected || !configState.isConnected}
              onPress={() => setFlatPanelCover(true)}
              label="Close Panel"
              color="red"
            />
          )}

          {flatPanelState.coverState !== 'Open' && (
            <CustomButton
              disabled={!flatPanelState.isConnected || !configState.isConnected}
              onPress={() => setFlatPanelCover(false)}
              label="Open Panel"
            />
          )}
        </View>
        <View className="flex-1">
          {flatPanelState.lightOn && (
            <CustomButton
              disabled={!flatPanelState.isConnected || !configState.isConnected}
              onPress={() => setFlatPanelLight(false)}
              label="Set Light Off"
              color="red"
            />
          )}

          {!flatPanelState.lightOn && (
            <CustomButton
              disabled={!flatPanelState.isConnected || !configState.isConnected}
              onPress={() => setFlatPanelLight(true)}
              label="Set Light On"
            />
          )}
        </View>
      </View>

      <Text className="my-2 font-medium text-white">
        Brightness{' '}
        <Text className="text-xs font-normal">
          ({flatPanelState.minBrightness} - {flatPanelState.maxBrightness})
        </Text>
      </Text>
      <View className="m-2 flex flex-row items-center justify-between gap-x-4">
        <View className="flex flex-1 items-center justify-center rounded-lg bg-black p-3">
          <TextInput
            className="flex py-1 text-white"
            value={brightness}
            onChangeText={(text) => setBrightness(text)}
          />
        </View>
        <View className="ml-4 w-48">
          <CustomButton
            disabled={!flatPanelState.isConnected || !configState.isConnected}
            onPress={() => setFlatBrightness(Number(brightness))}
            label="Set Brightness"
          />
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
};
