import { orderBy } from 'lodash';
import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import type { Device } from '@/actions/constants';
import {
  framingSlew,
  setFramingCoordinates,
  setFramingSource,
} from '@/actions/framing';
import {
  connectMount,
  convertDegreesToDMS,
  convertDMStoDegrees,
  convertHMStoDegrees,
  disconnectMount,
  getAltitude,
  getMountInfo,
  homeMount,
  initializeMountSocket,
  listMountDevices,
  parkMount,
  rescanMountDevices,
  sendMountEvent,
  setMountTrackingMode,
  stopSlewMount,
  unParkMount,
} from '@/actions/mount';
import { CameraMountControlBar } from '@/components/capture/CameraMountControlBar';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { DropDown } from '@/components/DropDown';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useMountStore } from '@/stores/mount.store';
import { useNGCStore } from '@/stores/ngc.store';
import VisibleStars from '@/stores/visible_stars.json';

const trackingModes: Device[] = [
  { id: '0', name: 'Sidereal' },
  { id: '1', name: 'Lunar' },
  { id: '2', name: 'Solar' },
];

const slewRates: Device[] = [
  { id: '0.2', name: '0.2x' },
  { id: '0.4', name: '0.4x' },
  { id: '0.8', name: '0.8x' },
  { id: '1.0', name: '1x' },
  { id: '2.0', name: '2x' },
  { id: '3.0', name: '3x' },
  { id: '4.0', name: '4x' },
  { id: '5.0', name: '5x' },
  { id: '6.0', name: '6x' },
];

export const Mount = () => {
  const mountState = useMountStore();
  const configState = useConfigStore();
  const ngcState = useNGCStore();

  const [showDevicesList, setShowDevicesList] = useState(false);
  const [showStarsList, setShowStarsList] = useState(false);
  const [showTrackingModes, setShowTrackingModes] = useState(false);
  const [showSlewRates, setShowSlewRates] = useState(false);

  const [currentStar, setCurrentStar] = useState<Device>();
  const [currentTrackingMode, setCurrentTrackingMode] = useState<Device>();
  const [currentSlewRate, setCurrentSlewRate] = useState<Device>(slewRates[6]!);

  const setMountDevice = (device: Device) => {
    setShowDevicesList(false);
    mountState.set({ currentDevice: device });
  };

  const connectToMount = () => {
    connectMount(
      mountState.currentDevice?.id ||
        useMountStore.getState().currentDevice?.id ||
        '',
    );
  };

  useEffect(() => {
    initializeMountSocket((message) => {
      console.log('Message received', message);
    });
    listMountDevices();
    getMountInfo();

    const interval = setInterval((_) => {
      getMountInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const onTrackingModeSelected = (item: Device) => {
    setShowTrackingModes(false);
    setCurrentTrackingMode(item);
  };

  const onSlewRateSelected = (item: Device) => {
    setShowSlewRates(false);
    setCurrentSlewRate(item);
  };

  const starsFormatted = VisibleStars.map((star) => {
    const raInDegrees = convertHMStoDegrees(star.ra);
    const decInDegrees = convertDMStoDegrees(star.dec);

    return {
      ...star,
      ra: star.ra,
      raInDegrees,
      dec: star.dec,
      decInDegrees,
      altitude: getAltitude({
        raDeg: raInDegrees,
        decDeg: decInDegrees,
        latDeg: configState.config.astrometry.latitude,
        lonDeg: configState.config.astrometry.longitude,
        date: new Date(),
      }).altDeg,
    };
  });

  let starsAboveHorizon = starsFormatted.filter((star) => star.altitude >= 0);
  starsAboveHorizon = orderBy(starsAboveHorizon, ['altitude'], ['desc']);

  const starsAsDevices = starsAboveHorizon.map((star) => ({
    id: star.name,
    name: `${star.name} (${star.magnitude})`,
  }));

  const selectedStarInfo = starsFormatted.find(
    (s) => s.name === currentStar?.id,
  );

  const onStarSelected = async (item: Device) => {
    setShowStarsList(false);
    setCurrentStar(item);
    await setFramingSource();

    const selectedStar = starsFormatted.find((s) => s.name === item.id);
    if (selectedStar) {
      await setFramingCoordinates(
        selectedStar.raInDegrees,
        selectedStar.decInDegrees,
      );
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
        currentDevice={mountState.currentDevice}
        isConnected={mountState.isConnected}
        devices={mountState.devices}
        isListExpanded={showDevicesList}
        onConnect={() => connectToMount()}
        onDisconnect={() => disconnectMount()}
        onRescan={() => rescanMountDevices()}
        onDeviceSelected={(device) => setMountDevice(device)}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <StatusChip
            isConnected={mountState.isConnected}
            bubble
            label="Parked"
            isActive={mountState.isParked}
          />
          <StatusChip
            isConnected={mountState.isConnected}
            bubble
            label="Home"
            isActive={mountState.isHome}
          />
          <StatusChip
            bubble
            isConnected={mountState.isConnected}
            label="Tracking"
            isActive={mountState.isTracking}
          />
          <StatusChip
            bubble
            isConnected={mountState.isConnected}
            last
            label="Slewing"
            isActive={mountState.isSlewing}
          />
        </View>
      </View>

      <View className="my-4 flex w-full flex-row items-center justify-between rounded-lg border-[1px] border-neutral-700 p-4">
        <View className="flex gap-y-1">
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">RA: </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.ra}
            </Text>
          </View>
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">Dec: </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.dec}
            </Text>
          </View>
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">Epoch: </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.epoch}
            </Text>
          </View>
        </View>
        <View className="flex gap-y-1">
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">Latitude: </Text>
            <Text className="text-right text-sm font-bold text-white">
              {convertDegreesToDMS(mountState.latitude)}
            </Text>
          </View>
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">Longitude: </Text>
            <Text className="text-right text-sm font-bold text-white">
              {convertDegreesToDMS(mountState.longitude)}
            </Text>
          </View>
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">Elevation: </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.elevation}
            </Text>
          </View>
        </View>
        <View className="flex gap-y-1">
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">
              Meridian Flip:{' '}
            </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.timeToMeridianFlip}
            </Text>
          </View>
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">
              Side of Pier:{' '}
            </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.sideOfPier}
            </Text>
          </View>
          <View className="flex flex-row justify-between gap-x-4">
            <Text className="text-sm font-normal text-white">
              Sidereal Time:{' '}
            </Text>
            <Text className="text-right text-sm font-bold text-white">
              {mountState.siderealTime}
            </Text>
          </View>
        </View>
      </View>

      <View className="m-2 flex flex-row items-center justify-between gap-x-10">
        <View className="flex-1">
          <CustomButton
            disabled={!mountState.isConnected || !configState.isConnected}
            onPress={homeMount}
            label="Home"
          />
        </View>
        <View className="flex-1">
          {mountState.isParked && (
            <CustomButton
              disabled={!mountState.isConnected || !configState.isConnected}
              onPress={unParkMount}
              label="Unpark"
              color="red"
            />
          )}

          {!mountState.isParked && (
            <CustomButton
              disabled={!mountState.isConnected || !configState.isConnected}
              onPress={parkMount}
              label="Park"
            />
          )}
        </View>

        <View className="flex-1">
          <CustomButton
            disabled={
              !mountState.isConnected ||
              mountState.isParked ||
              !configState.isConnected
            }
            onPress={homeMount}
            label="Set as Park"
          />
        </View>
      </View>

      <Text className="my-6 text-lg font-medium text-white">
        Slew to Visible Star
      </Text>
      <View>
        <View className="flex flex-row">
          <DropDown
            defaultText="Select Star"
            currentItem={currentStar || null}
            items={starsAsDevices}
            onItemSelected={onStarSelected}
            onListExpand={() => {
              setShowStarsList(!showStarsList);
            }}
            isListExpanded={showStarsList}
            width={480}
          />
          <View className="ml-6 w-36">
            <CustomButton
              disabled={
                !mountState.isConnected ||
                mountState.isSlewing ||
                mountState.isParked ||
                ngcState.isRunning ||
                !configState.isConnected
              }
              onPress={() => framingSlew(true, true)}
              label={ngcState.isRunning ? 'Framing...' : 'Slew'}
            />
          </View>
        </View>
        {selectedStarInfo?.name && (
          <Text className="ml-6 mt-3 text-sm font-medium text-gray-500">
            RA: <Text className="font-bold">{selectedStarInfo?.ra}</Text> | Dec:{' '}
            <Text className="font-bold">{selectedStarInfo?.dec}</Text> |
            Altitude:{' '}
            <Text className="font-bold">
              {selectedStarInfo?.altitude.toString().substr(0, 5)}
            </Text>
          </Text>
        )}
      </View>

      <Text className="mt-12 text-lg font-medium text-white">
        Mount Control
      </Text>

      <View className="mb-10 flex w-full flex-row items-center justify-between">
        <View className="flex items-center justify-between gap-y-4">
          <View className="w-full flex-row items-center justify-center">
            <DropDown
              defaultText="Tracking Mode"
              currentItem={currentTrackingMode || null}
              items={trackingModes}
              width={280}
              onItemSelected={onTrackingModeSelected}
              onListExpand={() => {
                setShowTrackingModes(!showTrackingModes);
              }}
              isListExpanded={showTrackingModes}
            />

            <View className="ml-3 w-12">
              {mountState.isTracking && (
                <CustomButton
                  disabled={!mountState.isConnected || !configState.isConnected}
                  onPress={() => setMountTrackingMode(4)}
                  icon="stop-circle"
                  color="red"
                  iconSize={20}
                />
              )}
              {!mountState.isTracking && (
                <CustomButton
                  disabled={
                    !mountState.isConnected ||
                    !currentTrackingMode?.id ||
                    !configState.isConnected
                  }
                  onPress={() =>
                    setMountTrackingMode(Number(currentTrackingMode?.id))
                  }
                  icon="play-circle"
                  iconSize={24}
                />
              )}
            </View>
          </View>

          <View className="w-full flex-row items-center justify-center">
            <DropDown
              defaultText="Slew Rate"
              currentItem={currentSlewRate || null}
              items={slewRates}
              onItemSelected={onSlewRateSelected}
              onListExpand={() => setShowSlewRates(!showSlewRates)}
              width={340}
              isListExpanded={showSlewRates}
            />
          </View>
        </View>

        <View className="mr-6">
          <CameraMountControlBar
            disabled={
              !mountState.isConnected ||
              mountState.isParked ||
              !configState.isConnected
            }
            absolute={false}
            showStop
            onMoveLeft={() =>
              sendMountEvent({
                direction: 'west',
                rate: Number(currentSlewRate.id) || 2.0,
              })
            }
            onMoveRight={() =>
              sendMountEvent({
                direction: 'east',
                rate: Number(currentSlewRate.id) || 2.0,
              })
            }
            onMoveUp={() =>
              sendMountEvent({
                direction: 'north',
                rate: Number(currentSlewRate.id) || 2.0,
              })
            }
            onMoveDown={() =>
              sendMountEvent({
                direction: 'south',
                rate: Number(currentSlewRate.id) || 2.0,
              })
            }
            onMoveStop={() => stopSlewMount()}
          />
        </View>
      </View>
      <View className="h-48" />
    </ScrollView>
  );
};
