import { useEffect, useState } from 'react';
import { ScrollView, Switch, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import {
  connectGuider,
  disconnectGuider,
  getGuiderInfo,
  getGuidingGraph,
  listGuiderDevices,
  rescanGuiderDevices,
  startGuiding,
  stopGuiding,
} from '@/actions/guider';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useGuiderStore } from '@/stores/guider.store';

export const Guider = () => {
  const guiderState = useGuiderStore();
  const configState = useConfigStore();

  const [showDevicesList, setShowDevicesList] = useState(false);
  const [calibrate, setCalibrate] = useState(false);

  const connectToGuider = () => {
    connectGuider(
      guiderState.currentDevice?.id ||
        useGuiderStore.getState().currentDevice?.id ||
        '',
    );
  };

  useEffect(() => {
    listGuiderDevices();
    getGuiderInfo();

    const interval = setInterval((_) => {
      getGuiderInfo();
      getGuidingGraph();
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
        currentDevice={guiderState.currentDevice}
        isConnected={guiderState.isConnected}
        devices={guiderState.devices}
        isListExpanded={showDevicesList}
        onConnect={() => connectToGuider()}
        onDisconnect={() => disconnectGuider()}
        onRescan={() => rescanGuiderDevices()}
        onDeviceSelected={(device) => {
          setShowDevicesList(false);
          guiderState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <StatusChip
            isConnected={guiderState.isConnected}
            bubble
            label="Guiding"
            isActive={guiderState.isGuiding}
          />

          <View
            style={{ opacity: guiderState.isConnected ? 1.0 : 0.3 }}
            className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
          >
            <Text className="text-xs font-medium text-white">
              Pixel Scale:{' '}
            </Text>
            <Text className="text-xs font-bold text-white">
              {String(guiderState.pixelScale).substring(0, 4)} arcs/px
            </Text>
          </View>
        </View>
      </View>

      <View className="my-3 flex w-full flex-row items-center justify-end gap-x-3">
        <Text
          style={{ opacity: guiderState.isConnected ? 1.0 : 0.3 }}
          className="text-lg font-medium text-white"
        >
          Calibrate
        </Text>
        <Switch
          disabled={!guiderState.isConnected}
          value={calibrate}
          onChange={() => setCalibrate(!calibrate)}
        />
      </View>

      <View className="mb-8 mt-4">
        {!guiderState.isGuiding && (
          <CustomButton
            disabled={
              !guiderState.isConnected ||
              guiderState.isGuiding ||
              !configState.isConnected
            }
            onPress={() => startGuiding(calibrate)}
            label="Start Guiding"
          />
        )}

        {guiderState.isGuiding && (
          <CustomButton
            disabled={!guiderState.isConnected || !configState.isConnected}
            onPress={() => stopGuiding()}
            label="Stop Guiding"
            color="red"
          />
        )}
      </View>

      <Text className="mb-8 text-lg font-semibold text-white">
        Guiding Graph
      </Text>

      <View className="mb-6 flex flex-row gap-x-4">
        <Text className="text-sm text-white">
          RA:{' '}
          <Text className="font-medium">
            {guiderState.error?.RA.pixels.toPrecision(2)} (
            {guiderState.error?.RA.arcseconds.toPrecision(2)}'')
          </Text>
        </Text>
        <Text className="text-sm text-white">
          Dec:{' '}
          <Text className="font-medium">
            {guiderState.error?.Dec.pixels.toPrecision(2)} (
            {guiderState.error?.Dec.arcseconds.toPrecision(2)}'')
          </Text>
        </Text>
        <Text className="text-sm text-white">
          Total:{' '}
          <Text className="font-medium">
            {guiderState.error?.total.pixels.toPrecision(2)} (
            {guiderState.error?.total.arcseconds.toPrecision(2)}'')
          </Text>
        </Text>
      </View>
      <LineChart
        disableScroll
        width={580}
        height={100}
        adjustToWidth
        formatYLabel={(l) => String(Math.ceil(Number(l)))}
        yAxisTextStyle={{
          color: '#ddd',
          fontSize: 12,
        }}
        maxValue={4}
        stepValue={1}
        mostNegativeValue={-4}
        secondaryYAxis={{
          stepValue: 1,
          maxValue: 4,
          mostNegativeValue: -4,
          hideYAxisText: true,
        }}
        yAxisThickness={0}
        xAxisColor="white"
        yAxisColor="white"
        dataPointsRadius1={0}
        color1="blue"
        dataPointsColor1="white"
        data={guiderState.graph.map((g) => ({ value: g.raDistance }))}
        secondaryLineConfig={{
          color: 'red',
        }}
        secondaryData={guiderState.graph.map((g) => ({
          value: g.decDistance,
        }))}
      />
      <View className="h-32" />
    </ScrollView>
  );
};
