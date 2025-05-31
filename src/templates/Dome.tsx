import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';

import {
  closeDomeShutter,
  connectDome,
  disconnectDome,
  getDomeInfo,
  homeDome,
  openDomeShutter,
  parkDome,
  rescanDomeDevices,
  setDomeFollow,
  setDomePark,
  slewDome,
  stopDome,
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
  const [azimuth, setAzimuth] = useState(String(domeState.azimuth || 0));

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
        onConnect={() => connectDome()}
        onDisconnect={() => disconnectDome()}
        onRescan={() => rescanDomeDevices()}
        onDeviceSelected={(device) => {
          setShowDevicesList(false);
          domeState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <View
            style={{ opacity: domeState.isConnected ? 1.0 : 0.4 }}
            className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
          >
            <Text className="mr-1 text-xs font-medium text-white">
              {domeState.azimuth?.toFixed()}°
            </Text>
          </View>
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
            isActive={domeState.shutterStatus === 'ShutterOpen'}
          />
        </View>
      </View>

      <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-4">
        <View className="flex-1">
          <CustomButton
            disabled={!domeState.isConnected || !configState.isConnected}
            onPress={() => homeDome()}
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
            className="flex w-full py-1 text-white"
            value={azimuth}
            onChangeText={(text) => setAzimuth(text)}
          />
        </View>
        <View className="ml-4 w-24">
          <CustomButton
            disabled={
              !domeState.isConnected ||
              domeState.isSlewing ||
              !configState.isConnected
            }
            onPress={() => slewDome(Number(azimuth))}
            label="Slew"
          />
        </View>
      </View>

      <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-4">
        <View className="flex-1">
          <CustomButton
            disabled={
              !domeState.isConnected ||
              !configState.isConnected ||
              domeState.isSlewing ||
              domeState.shutterStatus === 'ShutterOpen'
            }
            onPress={() => openDomeShutter()}
            label="Open"
          />
        </View>
        <View className="flex-1">
          <CustomButton
            disabled={
              !domeState.isConnected ||
              !configState.isConnected ||
              domeState.shutterStatus === 'ShutterClosed'
            }
            onPress={() => closeDomeShutter()}
            label="Close"
            color="red"
          />
        </View>
      </View>

      <View className="mx-2 my-4 flex flex-row items-center justify-between gap-x-4">
        <View className="flex-1">
          <CustomButton
            disabled={!domeState.isConnected || !configState.isConnected}
            onPress={() => syncDome()}
            label="Sync"
          />
        </View>
        <View className="flex-1">
          {domeState.isFollowing && (
            <CustomButton
              disabled={!domeState.isConnected || !configState.isConnected}
              onPress={() => setDomeFollow(false)}
              label="Stop Following"
              color="red"
            />
          )}

          {!domeState.isFollowing && (
            <CustomButton
              disabled={
                !domeState.isConnected ||
                !configState.isConnected ||
                domeState.shutterStatus !== 'ShutterOpen'
              }
              onPress={() => setDomeFollow(true)}
              label="Follow Telescope"
            />
          )}
        </View>
        <View className="flex-1">
          <CustomButton
            disabled={
              !domeState.isConnected ||
              !configState.isConnected ||
              !domeState.isSlewing
            }
            onPress={() => stopDome()}
            label="Stop"
            color="red"
          />
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
};
