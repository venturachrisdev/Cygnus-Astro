import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  closeDomeShutter,
  connectDome,
  disconnectDome,
  getDomeInfo,
  openDomeShutter,
  parkDome,
  rescanDomeDevices,
  setDomeFollow,
  setDomePark,
  syncDome,
} from '@/actions/dome';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useDomeStore } from '@/stores/dome.store';

export const Dome = () => {
  const domeState = useDomeStore();
  const configState = useConfigStore();

  const [showDevicesList, setShowDevicesList] = useState(false);
  const [azimuth] = useState(String(domeState.azimuth));

  useEffect(() => {
    rescanDomeDevices();
    getDomeInfo();

    const interval = setInterval((_) => {
      getDomeInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowDevicesList(!showDevicesList)}
        currentDevice={domeState.currentDevice}
        isConnected={domeState.isConnected}
        devices={domeState.devices}
        isListExpanded={showDevicesList}
        onConnect={() => connectDome(domeState.currentDevice?.id || '')}
        onDisconnect={() => disconnectDome()}
        onRescan={() => rescanDomeDevices()}
        onDeviceSelected={(device) => {
          setShowDevicesList(false);
          domeState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <StatusChip
            isConnected={domeState.isConnected}
            bubble
            label="Home"
            isActive={domeState.isHome}
          />
          <StatusChip
            isConnected={domeState.isConnected}
            bubble
            label="Park"
            isActive={domeState.isParked}
          />
          <StatusChip
            isConnected={domeState.isConnected}
            bubble
            label="Slewing"
            isActive={domeState.isSlewing}
          />
          <StatusChip
            isConnected={domeState.isConnected}
            bubble
            label="Following"
            isActive={domeState.isFollowing}
          />

          <StatusChip
            isConnected={domeState.isConnected}
            bubble
            label="Open"
            isActive={domeState.shutterStatus === 'OPEN'}
          />
        </View>
      </View>

      <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-10">
        <View className="flex-1">
          <CustomButton
            disabled={!domeState.isConnected || !configState.isConnected}
            onPress={() => {}}
            label="Home"
          />
        </View>
        <View className="flex-1">
          <CustomButton
            disabled={
              !domeState.isConnected ||
              !configState.isConnected ||
              domeState.isSlewing ||
              domeState.isParked
            }
            onPress={() => parkDome()}
            label="Park"
          />
        </View>

        <View className="flex-1">
          <CustomButton
            disabled={
              !domeState.isConnected ||
              domeState.isParked ||
              !configState.isConnected
            }
            onPress={() => setDomePark()}
            label="Set as Park"
          />
        </View>
      </View>

      <Text className="my-4 text-lg font-medium text-white">Azimuth</Text>
      <View className="mx-2 mb-10 flex flex-row items-center justify-between gap-x-4">
        <View className="flex flex-1 items-center justify-center rounded-lg bg-black p-3">
          <TextInput
            className="flex py-1 text-white"
            value={azimuth}
            onChangeText={() => {}}
          />
        </View>
      </View>

      <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-10">
        <View className="flex-1">
          {domeState.shutterStatus === 'OPEN' && (
            <CustomButton
              disabled={!domeState.isConnected || !configState.isConnected}
              onPress={() => closeDomeShutter()}
              label="Close Shutter"
              color="red"
            />
          )}

          {domeState.shutterStatus !== 'OPEN' && (
            <CustomButton
              disabled={
                !domeState.isConnected ||
                !configState.isConnected ||
                domeState.isSlewing
              }
              onPress={() => openDomeShutter()}
              label="Open Shutter"
            />
          )}
        </View>
      </View>

      <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-10">
        <View className="flex-1">
          <CustomButton
            disabled={!domeState.isConnected || !configState.isConnected}
            onPress={() => syncDome()}
            label="Sync with Telescope"
          />
        </View>
        <View className="flex-1">
          {domeState.isSlewing && (
            <CustomButton
              disabled={!domeState.isConnected || !configState.isConnected}
              onPress={() => setDomeFollow(false)}
              label="Stop Following"
              color="red"
            />
          )}

          {!domeState.isSlewing && (
            <CustomButton
              disabled={!domeState.isConnected || !configState.isConnected}
              onPress={() => setDomeFollow(true)}
              label="Follow Telescope"
            />
          )}
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
};
