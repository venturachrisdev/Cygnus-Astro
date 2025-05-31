/* eslint-disable react/no-unstable-nested-components */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { orderBy } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, ScrollView, Text, TextInput, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import {
  connectFocuser,
  disconnectFocuser,
  getFocuserInfo,
  getLastAutoFocus,
  moveFocuser,
  rescanFocuserDevices,
  startAutofocus,
} from '@/actions/focuser';
import { CustomButton } from '@/components/CustomButton';
import { DeviceConnection } from '@/components/DeviceConnection';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useFocuserStore } from '@/stores/focuser.store';

const FocusErrorLine = (props: { height?: number }) => (
  <View
    style={{ height: props.height || 20 }}
    className="h-10 w-[10px] bg-red-800"
  />
);

export const Focuser = () => {
  const focuserState = useFocuserStore();
  const configState = useConfigStore();

  const [showDevicesList, setShowDevicesList] = useState(false);
  const [focuserPosition, setFocuserPosition] = useState(
    String(focuserState.position),
  );

  useEffect(() => {
    if (!focuserState.isConnected) {
      rescanFocuserDevices();
    }

    getFocuserInfo();
    getLastAutoFocus();

    const interval = setInterval((_) => {
      getFocuserInfo();
    }, 1000);

    const longerInterval = setInterval((_) => {
      getLastAutoFocus();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(longerInterval);
    };
  }, []);

  const secondaryData = useMemo(() => {
    const calculatedFocusPosition =
      focuserState.lastAutoFocusRun?.calculatedFocusPoint.position || 0;
    const calculatedFocusValue =
      focuserState.lastAutoFocusRun?.calculatedFocusPoint.value || 0;

    const litPoint = {
      value: calculatedFocusValue,
      dataPointText: '●',
      textFontSize: 14,
      textColor: 'orange',
    };

    const data =
      focuserState.lastAutoFocusRun?.points.map((_p) => ({
        value: 10,
        hideDataPoint: true,
        textShiftX: 0,
      })) || [];

    let closestIndex = 0;
    let lastDifference = 1000000;

    focuserState.lastAutoFocusRun?.points.forEach((point, index) => {
      const positionDifference = Math.abs(
        point.position - calculatedFocusPosition,
      );
      if (positionDifference <= lastDifference) {
        lastDifference = positionDifference;
        closestIndex = index;
      }
    });

    const stepSize =
      (focuserState.lastAutoFocusRun?.points[0]?.position || 0) -
      (focuserState.lastAutoFocusRun?.points[1]?.position || 0);

    data[closestIndex] = {
      ...litPoint,
      textShiftX: (580 / data.length) * (lastDifference / stepSize),
      hideDataPoint: false,
    };

    return data;
  }, [focuserState.lastAutoFocusRun]);

  const minimumFocusValue = useMemo(
    () =>
      Math.floor(
        orderBy(focuserState.lastAutoFocusRun?.points, 'value', ['asc'])[0]
          ?.value || 2,
      ),
    [focuserState.lastAutoFocusRun],
  );

  const maximumFocusValue = useMemo(
    () =>
      Math.ceil(
        orderBy(focuserState.lastAutoFocusRun?.points, ['value'], ['desc'])[0]
          ?.value || 6,
      ),
    [focuserState.lastAutoFocusRun],
  );

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <DeviceConnection
        isAPIConnected={configState.isConnected}
        onListExpand={() => setShowDevicesList(!showDevicesList)}
        currentDevice={focuserState.currentDevice}
        isConnected={focuserState.isConnected}
        devices={focuserState.devices}
        isListExpanded={showDevicesList}
        onConnect={() => connectFocuser()}
        onDisconnect={() => disconnectFocuser()}
        onRescan={() => rescanFocuserDevices()}
        onDeviceSelected={(device) => {
          setShowDevicesList(false);
          focuserState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <View
            style={{ opacity: focuserState.isConnected ? 1.0 : 0.4 }}
            className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
          >
            <Text className="mr-1 text-xs font-medium text-white">
              {focuserState.position}
            </Text>
            <Icon name="target" size={12} color="white" />
          </View>

          <View
            style={{ opacity: focuserState.isConnected ? 1.0 : 0.4 }}
            className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
          >
            <Text className="text-xs font-medium text-white">
              {String(focuserState.temperature).substring(0, 4)}
            </Text>
            <Icon name="temperature-celsius" size={12} color="white" />
          </View>

          <StatusChip
            bubble
            isConnected={focuserState.isConnected}
            label="Moving"
            isActive={focuserState.isMoving}
          />
          <StatusChip
            bubble
            last
            isConnected={focuserState.isConnected}
            label="Autofocus"
            isActive={focuserState.isAutofocusing}
          />
        </View>
      </View>

      <View className="m-2 flex flex-row items-center justify-between gap-x-4">
        <View className="flex flex-1 items-center justify-center rounded-lg bg-black p-3">
          <TextInput
            className="flex w-full py-1 text-white"
            value={focuserPosition}
            onChangeText={(text) => setFocuserPosition(text)}
          />
        </View>
        <View className="ml-4 w-24">
          <CustomButton
            disabled={
              !focuserState.isConnected ||
              focuserState.isMoving ||
              !configState.isConnected
            }
            onPress={() => moveFocuser(Number(focuserPosition))}
            label="Move"
          />
        </View>
      </View>

      <View className="my-8 h-12">
        {!focuserState.isAutofocusing && (
          <CustomButton
            disabled={
              !focuserState.isConnected ||
              focuserState.isMoving ||
              !configState.isConnected
            }
            onPress={() => startAutofocus()}
            label="Start Autofocus"
          />
        )}

        {focuserState.isAutofocusing && (
          <CustomButton
            color="red"
            disabled={
              !focuserState.isConnected ||
              !configState.isConnected ||
              !configState.isConnected
            }
            onPress={() => startAutofocus(true)}
            label="Stop Autofocus"
          />
        )}
      </View>

      {!!focuserState.lastAutoFocusRun && (
        <>
          <Text className="mb-4 mt-8 text-lg font-semibold text-white">
            Last Autofocus
          </Text>

          <View className="mx-3 mb-5 flex flex-row items-center justify-between rounded-lg border-[1px] border-neutral-800 p-3">
            <View className="flex-1">
              <Text className="mb-4 text-sm text-gray-400">
                Filter:{' '}
                <Text className="font-medium text-white">
                  {focuserState.lastAutoFocusRun?.filter}
                </Text>
              </Text>
              <Text className="mb-4 text-sm text-gray-400">
                Duration:{' '}
                <Text className="font-medium text-white">
                  {focuserState.lastAutoFocusRun?.duration.split('.')[0]}
                </Text>
              </Text>
              <Text className="text-sm text-gray-400">
                Timestamp:{' '}
                <Text className="font-medium text-white">
                  {focuserState.lastAutoFocusRun?.date
                    .substring(0, 19)
                    ?.replace('T', ' ')}
                </Text>
              </Text>
            </View>

            <View className="flex-1">
              <Text className="mb-4 text-sm text-gray-400">
                Temperature:{' '}
                <Text className="font-medium text-white">
                  {
                    String(focuserState.lastAutoFocusRun?.temperature).split(
                      '.',
                    )[0]
                  }
                  °
                </Text>
              </Text>
              <Text className="mb-4 text-sm text-gray-400">
                Calculated Focus Point:{' '}
                <Text className="font-medium text-white">
                  {focuserState.lastAutoFocusRun?.calculatedFocusPoint.position}
                </Text>
              </Text>
              <Text className="text-sm text-gray-400">
                Initial Focus Point:{' '}
                <Text className="font-medium text-white">
                  {focuserState.lastAutoFocusRun?.initialFocusPoint.position}
                </Text>
              </Text>
            </View>
          </View>
        </>
      )}

      {!!focuserState.lastAutoFocusRun && (
        <LineChart
          disableScroll={Dimensions.get('window').width > 580}
          curved
          width={580}
          height={300}
          adjustToWidth
          yAxisTextStyle={{
            color: '#ddd',
            fontSize: 12,
          }}
          xAxisLabelTextStyle={{
            color: '#ddd',
            fontSize: 12,
          }}
          xAxisLabelTexts={focuserState.lastAutoFocusRun?.points.map((p) =>
            String(p.position),
          )}
          formatYLabel={(l) => String(Math.floor(Number(l)))}
          hideRules
          maxValue={maximumFocusValue - minimumFocusValue}
          yAxisOffset={minimumFocusValue}
          stepValue={1}
          mostNegativeValue={0}
          secondaryYAxis={{
            hideYAxisText: true,
            showYAxisIndices: false,
            maxValue: maximumFocusValue - minimumFocusValue,
            yAxisOffset: minimumFocusValue,
            stepValue: 1,
            mostNegativeValue: 0,
          }}
          yAxisThickness={0}
          xAxisThickness={0}
          dataPointsRadius1={5}
          color1="green"
          dataPointsColor1="white"
          data={focuserState.lastAutoFocusRun?.points.map((p) => ({
            value: p.value,
            dataPointLabelComponent: () => (
              <FocusErrorLine height={Math.floor(p.error * 20)} />
            ),
            dataPointLabelWidth: 2,
            dataPointLabelShiftY: p.error / 0.5,
          }))}
          secondaryLineConfig={{
            color: 'transparent',
            dataPointsColor: 'transparent',
            zIndex: 99,
          }}
          secondaryData={secondaryData}
        />
      )}
      <View className="mb-16" />
    </ScrollView>
  );
};
