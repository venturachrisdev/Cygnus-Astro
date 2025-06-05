import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Switch, Text, TextInput, View } from 'react-native';

import type { Device } from '@/actions/constants';
import {
  changeFilter,
  connectFilterWheel,
  disconnectFilterWheel,
  getFilterWheelInfo,
  rescanFilterWheelDevices,
} from '@/actions/filterwheel';
import { getCurrentProfile } from '@/actions/hosts';
import {
  connectRotator,
  disconnectRotator,
  getRotatorInfo,
  moveRotator,
  rescanRotatorDevices,
} from '@/actions/rotator';
import {
  connectSafetyMonitor,
  disconnectSafetyMonitor,
  getSafetyMonitorInfo,
  rescanSafetyMonitorDevices,
} from '@/actions/safetymonitor';
import {
  connectSwitches,
  disconnectSwitches,
  getSwitchesInfo,
  rescanSwitchesDevices,
  setSwitchValue,
} from '@/actions/switches';
import {
  connectWeather,
  disconnectWeather,
  getWeatherInfo,
  rescanWeatherDevices,
} from '@/actions/weather';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { DropDown } from '@/components/DropDown';
import { StatusChip } from '@/components/StatusChip';
import { TextInputLabel } from '@/components/TextInputLabel';
import { useConfigStore } from '@/stores/config.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { useRotatorStore } from '@/stores/rotator.store';
import { useSafetyMonitorStore } from '@/stores/safetymonitor.store';
import { useSwitchesStore } from '@/stores/switches.stores';
import { useWeatherStore } from '@/stores/weather.store';

const WeatherItem = ({
  value,
  unit,
  decimals,
  top,
}: {
  value: number;
  unit: string;
  decimals?: number;
  top?: boolean;
}) => (
  <View className={`flex flex-row ${top ? '' : 'items-end'}`}>
    {!!value && (
      <>
        <Text className="text-2xl font-medium text-white">
          {value.toFixed(decimals)}
        </Text>
        <Text className={`${top ? 'mt-1' : 'mb-1'} text-xs text-white`}>
          {' '}
          {unit}
        </Text>
      </>
    )}
    {!value && <Text className="text-2xl font-medium text-white">--</Text>}
  </View>
);

export const Accessories = () => {
  const filterWheelState = useFilterWheelStore();
  const switchesState = useSwitchesStore();
  const configState = useConfigStore();
  const rotatorState = useRotatorStore();
  const safetyMonitorState = useSafetyMonitorStore();
  const weatherState = useWeatherStore();

  const [showFilterDevicesList, setShowFilterDevicesList] = useState(false);
  const [filtersListExpanded, setFiltersListExpanded] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(
    filterWheelState.currentFilter,
  );

  const [showSwitchDevicesList, setShowSwitchesDevicesList] = useState(false);
  const [showRotatorDevicesList, setShowRotatorDevicesList] = useState(false);
  const [showSafetyMonitorDevicesList, setShowSafetyMonitorDevicesList] =
    useState(false);
  const [showWeatherDevicesList, setShowWeatherDevicesList] = useState(false);

  const [rotatorPosition, setRotatorPosition] = useState(
    String(rotatorState.position),
  );

  const onFilterSelected = (filter: number) => {
    setFiltersListExpanded(false);
    setSelectedFilter(filter);
  };

  useEffect(() => {
    if (useConfigStore.getState().isConnected) {
      if (!filterWheelState.isConnected) {
        rescanFilterWheelDevices();
      }
      if (!switchesState.isConnected) {
        rescanSwitchesDevices();
      }
      if (!safetyMonitorState.isConnected) {
        rescanSafetyMonitorDevices();
      }
      if (!rotatorState.isConnected) {
        rescanRotatorDevices();
      }
      if (!weatherState.isConnected) {
        rescanWeatherDevices();
      }

      getCurrentProfile();
      getFilterWheelInfo();
      getSwitchesInfo();
      getSafetyMonitorInfo();
      getRotatorInfo();
      getWeatherInfo();
    }

    const interval = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getFilterWheelInfo();
        getSwitchesInfo();
        getSafetyMonitorInfo();
        getRotatorInfo();
        getWeatherInfo();
      }
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
        devices={!filterWheelState.isConnected ? filterWheelState.devices : []}
        isListExpanded={showFilterDevicesList}
        onConnect={() => connectFilterWheel()}
        onDisconnect={() => disconnectFilterWheel()}
        onRescan={() => rescanFilterWheelDevices()}
        onDeviceSelected={(device) => {
          setShowFilterDevicesList(false);
          filterWheelState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <StatusChip
          bubble
          last
          label="Moving"
          isActive={filterWheelState.isMoving}
          isConnected={filterWheelState.isConnected}
        />
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
        devices={!switchesState.isConnected ? switchesState.devices : []}
        isListExpanded={showSwitchDevicesList}
        onConnect={() => connectSwitches()}
        onDisconnect={() => disconnectSwitches()}
        onRescan={() => rescanSwitchesDevices()}
        onDeviceSelected={(device) => {
          setShowSwitchesDevicesList(false);
          switchesState.set({ currentDevice: device });
        }}
      />

      {switchesState.isConnected && (
        <ScrollView
          bounces={false}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          <View>
            <View className="mt-10 flex flex-row items-center">
              {switchesState.readSwitches?.map((sw) => (
                <View className="mr-12">
                  <Text className="text-gray-300">{sw.name}</Text>
                  <Text className="text-3xl font-medium text-white">
                    {sw.value}
                  </Text>
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
          </View>
        </ScrollView>
      )}

      <View className="my-10 border-[0.5px] border-neutral-800" />

      <Text className="my-4 text-lg font-semibold text-white">Rotator</Text>
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowRotatorDevicesList(!showRotatorDevicesList)}
        currentDevice={rotatorState.currentDevice}
        isConnected={rotatorState.isConnected}
        devices={!rotatorState.isConnected ? rotatorState.devices : []}
        isListExpanded={showRotatorDevicesList}
        onConnect={() => connectRotator()}
        onDisconnect={() => disconnectRotator()}
        onRescan={() => rescanRotatorDevices()}
        onDeviceSelected={(device) => {
          setShowRotatorDevicesList(false);
          rotatorState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View
          style={{ opacity: rotatorState.isConnected ? 1.0 : 0.4 }}
          className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
        >
          <Text className="text-xs font-medium text-white">
            Position:{' '}
            <Text className="font-bold">
              {rotatorState.position.toFixed(1)}°
            </Text>
          </Text>
        </View>
        <View
          style={{ opacity: rotatorState.isConnected ? 1.0 : 0.4 }}
          className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
        >
          <Text className="text-xs font-medium text-white">
            Step Size:{' '}
            <Text className="font-bold">{rotatorState.stepSize}</Text>
          </Text>
        </View>
        <StatusChip
          bubble
          last
          label="Moving"
          isActive={rotatorState.isMoving}
          isConnected={rotatorState.isConnected}
        />
      </View>

      <View className="mx-2 mt-10 flex flex-row items-center justify-between gap-x-4">
        <View className="flex flex-1 items-center justify-center rounded-lg bg-black p-3">
          <TextInput
            className="flex w-full py-1 text-white"
            value={rotatorPosition}
            onChangeText={(text) => setRotatorPosition(text)}
          />
        </View>
        <View className="ml-4 w-24">
          <CustomButton
            disabled={
              !rotatorState.isConnected ||
              rotatorState.isMoving ||
              !configState.isConnected
            }
            onPress={() => moveRotator(Number(rotatorPosition))}
            label="Move"
          />
        </View>
      </View>

      <View className="my-10 border-[0.5px] border-neutral-800" />

      <Text className="mb-4 text-lg font-semibold text-white">
        Safety Monitor
      </Text>
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() =>
          setShowSafetyMonitorDevicesList(!showSafetyMonitorDevicesList)
        }
        currentDevice={safetyMonitorState.currentDevice}
        isConnected={safetyMonitorState.isConnected}
        devices={
          !safetyMonitorState.isConnected ? safetyMonitorState.devices : []
        }
        isListExpanded={showSafetyMonitorDevicesList}
        onConnect={() => connectSafetyMonitor()}
        onDisconnect={() => disconnectSafetyMonitor()}
        onRescan={() => rescanSafetyMonitorDevices()}
        onDeviceSelected={(device) => {
          setShowSafetyMonitorDevicesList(false);
          safetyMonitorState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <StatusChip
          bubble
          last
          label="Safe"
          isActive={safetyMonitorState.isSafe}
          isConnected={safetyMonitorState.isConnected}
        />
      </View>

      <View className="my-10 border-[0.5px] border-neutral-800" />

      <Text className="mb-4 text-lg font-semibold text-white">Weather</Text>
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowWeatherDevicesList(!showWeatherDevicesList)}
        currentDevice={weatherState.currentDevice}
        isConnected={weatherState.isConnected}
        devices={!weatherState.isConnected ? weatherState.devices : []}
        isListExpanded={showWeatherDevicesList}
        onConnect={() => connectWeather()}
        onDisconnect={() => disconnectWeather()}
        onRescan={() => rescanWeatherDevices()}
        onDeviceSelected={(device) => {
          setShowWeatherDevicesList(false);
          weatherState.set({ currentDevice: device });
        }}
      />

      <ScrollView
        bounces={false}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View>
          <View className="mx-2 mt-10 flex flex-row items-center">
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Temperature</Text>
              <WeatherItem
                value={weatherState.temperature}
                unit="°c"
                decimals={1}
              />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Dew Point</Text>
              <WeatherItem
                value={weatherState.dewPoint}
                unit="°c"
                decimals={1}
              />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Humidity</Text>
              <WeatherItem value={weatherState.humidity} unit="%" />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Pressure</Text>
              <WeatherItem value={weatherState.pressure} unit="hPa" />
            </View>
          </View>
          <View className="mx-2 mt-10 flex flex-row items-center">
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Sky Brightness</Text>
              <WeatherItem value={weatherState.skyBrightness} unit="lx" />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Sky Quality</Text>
              <WeatherItem
                value={weatherState.skyQuality}
                unit="mag/a²"
                decimals={1}
              />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Sky Temperature</Text>
              <WeatherItem
                value={weatherState.skyTemperature}
                unit="°c"
                decimals={1}
              />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Rain Rate</Text>
              <WeatherItem value={weatherState.rainRate} unit="mm/h" />
            </View>
          </View>
          <View className="mx-2 mt-10 flex flex-row items-center">
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Wind Direction</Text>
              <WeatherItem value={weatherState.windDirection} unit="°" top />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Wind Speed</Text>
              <WeatherItem value={weatherState.windSpeed} unit="m/s" />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Wind Gust</Text>
              <WeatherItem value={weatherState.windGust} unit="m/s" />
            </View>
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Star FWHM</Text>
              <WeatherItem
                value={weatherState.starFWHM}
                unit="''"
                top
                decimals={1}
              />
            </View>
          </View>
          <View className="mx-2 mt-10 flex flex-row items-center">
            <View className="mr-12 w-24">
              <Text className="text-gray-300">Cloud Cover</Text>
              <WeatherItem value={weatherState.cloudCover} unit="%" />
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="h-24" />
    </ScrollView>
  );
};
