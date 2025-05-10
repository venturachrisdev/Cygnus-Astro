import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

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
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { DropDown } from '@/components/DropDown';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';

export const Accessories = () => {
  const filterWheelState = useFilterWheelStore();
  const configState = useConfigStore();

  const [showFilterDevicesList, setShowFilterDevicesList] = useState(false);
  const [filtersListExpanded, setFiltersListExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(
    filterWheelState.currentFilter,
  );

  const connectToFilterWheel = () => {
    connectFilterWheel(
      filterWheelState.currentDevice?.id ||
        useFilterWheelStore.getState().currentDevice?.id ||
        '',
    );
  };

  const onFilterSelected = (filter: number) => {
    setFiltersListExpanded(false);
    setSelectedFilter(filter);
  };

  useEffect(() => {
    listFilterWheelDevices();
    getCurrentProfile();
    getFilterWheelInfo();

    const interval = setInterval((_) => {
      getFilterWheelInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const filtersToDevices: Device[] = filterWheelState.availableFilters.map(
    (filter) => ({
      ...filter,
      id: String(filter.id),
    }),
  );
  const currentFilter = filtersToDevices.find(
    (f) => f.id === String(selectedFilter),
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
              if (selectedFilter) {
                changeFilter(selectedFilter);
              }
            }}
            label="Change"
          />
        </View>
      </View>

      <View className="h-64" />
      <View className="h-8" />
    </ScrollView>
  );
};
