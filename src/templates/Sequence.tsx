/* eslint-disable no-underscore-dangle */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import {
  convertDegreesToHMS,
  convertDMStoDegrees,
  convertHMStoDegrees,
  getAltitude,
} from '@/actions/mount';
import {
  getSequenceState,
  resetSequence,
  startSequence,
  stopSequence,
} from '@/actions/sequence';
import { CircleButton } from '@/components/CircleButton';
import { CustomButton } from '@/components/CustomButton';
import { useConfigStore } from '@/stores/config.store';
import type { NGCObject } from '@/stores/ngc.store';
import { useSequenceStore } from '@/stores/sequence.store';

const trackingMode: Record<String, String> = {
  '0': 'Sidereal',
  '5': 'Stopped',
  '1': 'Lunar',
  '2': 'Solar',
};

export const Sequence = () => {
  const sequenceState = useSequenceStore();
  const configState = useConfigStore();
  const router = useRouter();

  useEffect(() => {
    getSequenceState();

    const interval = setInterval((_) => {
      getSequenceState();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const getAltitudePoints = (ngc: Partial<NGCObject>) =>
    [...Array(24).keys()].map((i: number) => {
      const now = new Date().addHours(i);

      const altitude = getAltitude({
        decDeg: convertDMStoDegrees(ngc.dec!, true),
        latDeg: configState.config.astrometry.latitude,
        raDeg: convertHMStoDegrees(ngc.ra!, true),
        date: now,
        lonDeg: configState.config.astrometry.longitude,
      });

      return altitude.altDeg;
    });

  const getCurrentAltitude = (ngc: Partial<NGCObject>) => {
    const now = new Date();

    const altitude = getAltitude({
      decDeg: convertDMStoDegrees(ngc.dec!, true),
      latDeg: configState.config.astrometry.latitude,
      raDeg: convertHMStoDegrees(ngc.ra!, true),
      date: now,
      lonDeg: configState.config.astrometry.longitude,
    });

    return altitude.altDeg;
  };

  const getParsedContainerName = (name: string) => {
    return name
      .replace('_Container', '')
      .replace('_Trigger', '')
      .replace('_Condition', '');
  };

  const getTextForStep = (item: any) => {
    if (item.Name.includes('Take Many Exposures')) {
      const count =
        item.Conditions[0].Iterations || item.Items[0].ExposureCount;
      const exposureTime = item.Items[0].ExposureTime;
      const imageType = item.Items[0].ImageType;
      return `Count: ${count},  Duration: ${exposureTime}s,  Type: ${imageType}`;
    }

    if (item.Name.includes('Wait for Time')) {
      return `${item.Hours}:${item.Minutes}:${item.Seconds}`;
    }

    if (item.Name.includes('Cool Camera')) {
      return `Temperature: ${item.Temperature}°`;
    }

    if (item.Name.includes('Warm Camera')) {
      return `Min duration: ${item.Duration}s`;
    }

    if (item.Name.includes('Set Tracking')) {
      return `${trackingMode[item.TrackingMode] || 'Unknown'}`;
    }

    if (item.Name.includes('Center After Drift')) {
      return `After Exposures: ${item.AfterExposures}`;
    }

    if (item.Name.includes('Meridian Flip')) {
      return `Time to flip: ${convertDegreesToHMS(item.TimeToMeridianFlip)}`;
    }

    if (item.Name.includes('Switch Filter')) {
      return `Filter: ${item.Filter._name}`;
    }

    if (item.Name.includes('Start Guiding')) {
      return `Force calibration: ${item.ForceCalibration ? 'Yes' : 'No'}`;
    }

    if (item.Name.includes('AF After HFR Increase')) {
      return `Amount: ${item.Amount}%,   Sample size: ${item.SampleSize}`;
    }

    if (item.Name.includes('Loop while Altitude Above Horizon')) {
      const currentAltitude = getCurrentAltitude({
        ra: `${item.Data.Coordinates.RAHours}:${item.Data.Coordinates.RAMinutes}:${item.Data.Coordinates.RASeconds}`,
        dec: `${item.Data.Coordinates.DecDegrees}:${item.Data.Coordinates.DecMinutes}:${item.Data.Coordinates.DecSeconds}`,
      });

      return `Offset: ${item.Data.Offset}°,  Altitude: ${Math.ceil(
        currentAltitude,
      )}°`;
    }

    return '';
  };

  const getIconNameForStep = (name: string) => {
    const parsedName = name.trim().toLocaleLowerCase();

    if (parsedName.includes('home')) {
      return 'home';
    }
    if (parsedName.includes('cool')) {
      return 'fan';
    }
    if (parsedName.includes('warm')) {
      return 'fire';
    }
    if (parsedName.includes('wait')) {
      return 'clock-time-two-outline';
    }
    if (parsedName.includes('meridian')) {
      return 'rotate-360';
    }
    if (parsedName.includes('tracking')) {
      return 'speedometer';
    }
    if (parsedName.includes('camera')) {
      return 'camera';
    }
    if (parsedName.includes('exposure')) {
      return 'camera-iris';
    }
    if (parsedName.includes('guiding')) {
      return 'target';
    }
    if (parsedName.includes('dither')) {
      return 'magic-staff';
    }
    if (parsedName.includes('park')) {
      return 'parking';
    }
    if (parsedName.includes('focus') || parsedName.includes('af')) {
      return 'focus-auto';
    }
    if (parsedName.includes('filter')) {
      return 'ferris-wheel';
    }
    if (parsedName.includes('scope') || parsedName.includes('slew')) {
      return 'telescope';
    }
    if (parsedName.includes('loop')) {
      return 'rotate-right';
    }

    return 'debug-step-into';
  };

  const renderStep = (item: any, index: number) => {
    return (
      <View
        key={index}
        className={`${
          item.Status === 'RUNNING'
            ? 'border-[0.5px] border-neutral-700 bg-neutral-950'
            : 'bg-neutral-900'
        } ${
          item.Status === 'FINISHED' ? 'bg-neutral-800' : ''
        } my-[2px] flex flex-row items-center justify-between rounded-lg px-4 py-2`}
      >
        <View className="my-1 flex flex-row items-center">
          <View className="mr-3">
            <Icon name={getIconNameForStep(item.Name)} size={24} color="gray" />
          </View>
          <View>
            <Text className="mb-1 font-semibold text-white">
              {getParsedContainerName(item.Name)}
            </Text>
            {!!getTextForStep(item) && (
              <Text className="text-gray-500">{getTextForStep(item)}</Text>
            )}
          </View>
        </View>

        <View>
          {item.Status === 'RUNNING' && (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon name="loading" size={20} color="white" />
            </Animated.View>
          )}
          {item.Status === 'CREATED' && <View className="px-2" />}
          {item.Status === 'FINISHED' && (
            <Icon name="check-outline" size={16} color="white" />
          )}
          {item.Status === 'SKIPPED' && (
            <Icon name="chevron-double-right" size={20} color="white" />
          )}
          {item.Status === 'FAILED' && (
            <Icon name="close-circle" size={20} color="#a71914" />
          )}
        </View>
      </View>
    );
  };

  const renderContainer = (container: any, index: number) => {
    const hasChildren =
      container.Triggers || container.Conditions || container.Items;

    return (
      <>
        {(!hasChildren || container.Name === 'Take Many Exposures_Container') &&
          renderStep(container, index)}
        {hasChildren && container.Name !== 'Take Many Exposures_Container' && (
          <View key={index} className="my-1 rounded-lg">
            {!!container.Target && (
              <View className="flex flex-row justify-between rounded-xl border-[0.5px] border-gray-800 px-2 py-4">
                <View>
                  <View className="mb-4 flex flex-row items-center px-1">
                    <Icon name="target" size={20} color="white" />
                    <Text className="ml-3 text-xl font-medium text-white">
                      {container.Target.TargetName || 'Target'}
                    </Text>
                  </View>
                  <View className="ml-2">
                    <Text className="text-lg text-gray-500">
                      RA:{'     '}
                      <Text className="text-white">
                        {container.Target.InputCoordinates.RAHours}h{' '}
                        {container.Target.InputCoordinates.RAMinutes}m{' '}
                        {Math.floor(
                          container.Target.InputCoordinates.RASeconds,
                        )}
                        s
                      </Text>
                    </Text>
                    <Text className="text-lg text-gray-500">
                      Dec:{'   '}
                      <Text className="text-white">
                        {container.Target.InputCoordinates.DecDegrees}°{' '}
                        {String(
                          container.Target.InputCoordinates.DecMinutes,
                        ).padStart(2, '0')}
                        m{' '}
                        {Math.floor(
                          container.Target.InputCoordinates.DecSeconds,
                        )}
                        s
                      </Text>
                    </Text>
                  </View>
                </View>
                <View className="mr-6">
                  <LineChart
                    curved
                    width={250}
                    height={70}
                    adjustToWidth
                    maxValue={90}
                    hideYAxisText
                    hideAxesAndRules
                    showVerticalLines
                    noOfVerticalLines={1}
                    verticalLinesSpacing={70}
                    verticalLinesThickness={1}
                    verticalLinesShift={68}
                    verticalLinesStrokeDashArray={[6]}
                    verticalLinesColor="#88ad75"
                    yAxisThickness={0}
                    showReferenceLine1
                    stepValue={1}
                    referenceLine1Position={-65}
                    referenceLine1Config={{
                      thickness: 1,
                      width: 250,
                      dashWidth: 5,
                      dashGap: 0,
                      color: 'gray',
                    }}
                    xAxisColor="white"
                    yAxisColor="white"
                    dataPointsRadius1={0}
                    mostNegativeValue={0}
                    color1="#e77"
                    dataPointsColor1="white"
                    data={getAltitudePoints({
                      ra: `${container.Target.InputCoordinates.RAHours}:${container.Target.InputCoordinates.RAMinutes}:${container.Target.InputCoordinates.RASeconds}`,
                      dec: `${container.Target.InputCoordinates.DecDegrees}:${container.Target.InputCoordinates.DecMinutes}:${container.Target.InputCoordinates.DecSeconds}`,
                    }).map((i) => ({ value: i }))}
                  />
                </View>
              </View>
            )}
            {container.Triggers?.length > 0 && (
              <View className="p-2">
                <View className="flex flex-row items-center px-2 py-3">
                  <Icon name="weather-lightning" size={20} color="white" />
                  <Text className="ml-3 text-lg font-medium text-white">
                    Triggers
                  </Text>
                </View>
                <View className="ml-2">
                  {container.Triggers?.map((item: any, idx: number) =>
                    renderContainer(item, idx),
                  )}
                </View>
              </View>
            )}
            {container.Conditions?.length > 0 &&
              container.Name !== 'Take Many Exposures_Container' && (
                <View className="p-2">
                  <View className="flex flex-row items-center px-2 py-3">
                    <Icon name="rotate-right" size={20} color="white" />
                    <Text className="ml-3 text-lg font-medium text-white">
                      Loop Conditions
                    </Text>
                  </View>
                  <View className="ml-2">
                    {container.Conditions?.map((item: any, idx: number) =>
                      renderContainer(item, idx),
                    )}
                  </View>
                </View>
              )}
            {container.Items?.length > 0 &&
              container.Name !== 'Take Many Exposures_Container' && (
                <View className="p-2">
                  <View className="flex flex-row items-center px-1 py-2">
                    <Icon name="chevron-right" size={20} color="white" />
                    <Text className="ml-3 text-lg font-medium text-white">
                      {getParsedContainerName(container.Name)}
                    </Text>
                  </View>
                  <View className="ml-2">
                    {container.Items?.map((item: any, idx: number) =>
                      renderContainer(item, idx),
                    )}
                  </View>
                </View>
              )}
          </View>
        )}
      </>
    );
  };

  const renderSequence = (container: any, index: number) => {
    if (!container.Status || !container.Name) {
      return null;
    }

    return renderContainer(container, index);
  };

  return (
    <>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 px-4"
      >
        <View className="flex w-full flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-white">Sequence</Text>
          <View>
            <CustomButton
              onPress={() => router.push('/target-search')}
              color="transparent"
              icon="star-shooting-outline"
              iconSize={28}
            />
          </View>
        </View>

        <View>
          {sequenceState.sequence.map((sequence: any, idx: number) =>
            renderSequence(sequence, idx),
          )}
        </View>

        {sequenceState.sequence.length === 0 && (
          <View className="mt-20 flex h-full w-full flex-1 items-center justify-center">
            <Text className="w-full px-24 text-center text-gray-700">
              No sequence found. Make sure your sequence is loaded in NINA
              Advance Sequencer and it contains a Deep Sky Object.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-5 right-5 flex flex-row items-center justify-end gap-x-3 p-3">
        {!sequenceState.isRunning && (
          <CircleButton
            disabled={!configState.isConnected}
            onPress={() => resetSequence()}
            color="blue"
            icon="refresh"
          />
        )}

        {!sequenceState.isRunning && (
          <CircleButton
            disabled={!configState.isConnected}
            onPress={() => startSequence()}
            color="green"
            icon="play"
          />
        )}

        {sequenceState.isRunning && (
          <CircleButton
            disabled={!configState.isConnected}
            onPress={() => stopSequence()}
            color="red"
            icon="stop"
          />
        )}
      </View>
    </>
  );
};
