import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';

import type { Device } from '@/actions/constants';
import {
  changeFilter,
  connectFilterWheel,
  disconnectFilterWheel,
  getFilterWheelInfo,
  listFilterWheelDevices,
  rescanFilterWheelDevices,
} from '@/actions/filterwheel';
import { getCurrentProfile } from '@/actions/hosts';
import {
  connectSwitches,
  disconnectSwitches,
  getSwitchesInfo,
  listSwitchesDevices,
  rescanSwitchesDevices,
  setSwitchValue,
} from '@/actions/switches';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { DropDown } from '@/components/DropDown';
import { StatusChip } from '@/components/StatusChip';
import { TextInputLabel } from '@/components/TextInputLabel';
import { useConfigStore } from '@/stores/config.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { useSwitchesStore } from '@/stores/switches.stores';

export const Accessories = () => {
  const filterWheelState = useFilterWheelStore();
  const switchesState = useSwitchesStore();
  const configState = useConfigStore();

  const [showFilterDevicesList, setShowFilterDevicesList] = useState(false);
  const [filtersListExpanded, setFiltersListExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(
    filterWheelState.currentFilter,
  );

  const [showSwitchDevicesList, setShowSwitchesDevicesList] = useState(false);

  const connectToFilterWheel = () => {
    connectFilterWheel(
      filterWheelState.currentDevice?.id ||
        useFilterWheelStore.getState().currentDevice?.id ||
        '',
    );
  };

  const connectToSwitches = () => {
    connectSwitches(
      switchesState.currentDevice?.id ||
        useSwitchesStore.getState().currentDevice?.id ||
        '',
    );
  };

  const onFilterSelected = (filter: number) => {
    setFiltersListExpanded(false);
    setSelectedFilter(filter);
  };

  useEffect(() => {
    listFilterWheelDevices();
    listSwitchesDevices();
    getCurrentProfile();
    getFilterWheelInfo();
    getSwitchesInfo();

    const interval = setInterval((_) => {
      getFilterWheelInfo();
      getSwitchesInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedFilter(filterWheelState.currentFilter);
  }, [filterWheelState.currentFilter]);

  const filtersToDevices: Device[] = useMemo(
    () =>
      filterWheelState.availableFilters.map((filter) => ({
        ...filter,
        id: String(filter.id),
      })),
    [filterWheelState.availableFilters],
  );
  const currentFilter = useMemo(
    () => filtersToDevices.find((f) => f.id === String(selectedFilter)),
    [selectedFilter, filtersToDevices],
  );

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <Text className="mb-4 text-lg font-semibold text-white">
        Filter Wheel
      </Text>
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowFilterDevicesList(!showFilterDevicesList)}
        currentDevice={filterWheelState.currentDevice}
        isConnected={filterWheelState.isConnected}
        devices={filterWheelState.devices}
        isListExpanded={showFilterDevicesList}
        onConnect={() => connectToFilterWheel()}
        onDisconnect={() => disconnectFilterWheel()}
        onRescan={() => rescanFilterWheelDevices()}
        onDeviceSelected={(device) => {
          setShowFilterDevicesList(false);
          filterWheelState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="flex flex-row items-center justify-between">
          <StatusChip
            bubble
            label="Moving"
            isActive={filterWheelState.isMoving}
            isConnected={filterWheelState.isConnected}
          />
        </View>
      </View>

      <View className="my-3 flex flex-row">
        <DropDown
          currentItem={currentFilter || null}
          isListExpanded={filtersListExpanded}
          onListExpand={() => setFiltersListExpanded(!filtersListExpanded)}
          onItemSelected={(item) => onFilterSelected(Number(item.id))}
          items={filtersToDevices}
          defaultText="Select Filter"
          width={480}
        />
        <View className="ml-4 w-24">
          <CustomButton
            disabled={
              selectedFilter === null ||
              !filterWheelState.isConnected ||
              filterWheelState.isMoving ||
              !configState.isConnected
            }
            onPress={() => {
              if (selectedFilter !== null) {
                changeFilter(selectedFilter);
              }
            }}
            label="Change"
          />
        </View>
      </View>

      <View className="my-10 border-[0.5px] border-neutral-800" />

      <Text className="mb-4 text-lg font-semibold text-white">Switch</Text>
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowSwitchesDevicesList(!showSwitchDevicesList)}
        currentDevice={switchesState.currentDevice}
        isConnected={switchesState.isConnected}
        devices={switchesState.devices}
        isListExpanded={showSwitchDevicesList}
        onConnect={() => connectToSwitches()}
        onDisconnect={() => disconnectSwitches()}
        onRescan={() => rescanSwitchesDevices()}
        onDeviceSelected={(device) => {
          setShowSwitchesDevicesList(false);
          switchesState.set({ currentDevice: device });
        }}
      />

      <View className="mt-10 flex flex-row items-center">
        {switchesState.readSwitches?.map((sw) => (
          <View className="mr-12">
            <Text className="text-gray-300">{sw.name}</Text>
            <Text className="text-3xl font-medium text-white">{sw.value}</Text>
          </View>
        ))}
      </View>

      <View className="mt-10 flex flex-row items-center">
        {switchesState.writeSwitches?.map((sw, index) => (
          <View className="mr-12">
            <Text className="mb-4 text-gray-300">
              {sw.name}{' '}
              {sw.maxValue - sw.minValue !== 1
                ? `(${sw.minValue} - ${sw.maxValue})`
                : ''}
            </Text>

            {sw.maxValue - sw.minValue === 1 && (
              <Switch
                value={sw.value === sw.maxValue}
                onChange={() =>
                  setSwitchValue(
                    index,
                    sw.value === sw.maxValue ? sw.minValue : sw.maxValue,
                  )
                }
              />
            )}
            {sw.maxValue - sw.minValue !== 1 && (
              <TextInputLabel
                disabled
                placeholder=""
                onChange={() => {}}
                value={String(sw.value)}
              />
            )}
          </View>
        ))}
      </View>

      <View className="h-64" />
      <View className="h-8" />
    </ScrollView>
  );
};
