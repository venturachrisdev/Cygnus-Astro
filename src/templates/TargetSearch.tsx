import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { abortCaptureImage, getCameraInfo } from '@/actions/camera';
import {
  framingSlew,
  setFramingCoordinates,
  setFramingSource,
} from '@/actions/framing';
import {
  convertDMStoDegrees,
  convertHMStoDegrees,
  getMountInfo,
  stopSlewMount,
} from '@/actions/mount';
import { getNGCTypeText, searchNGC } from '@/actions/ngc';
import { setSequenceTarget } from '@/actions/sequence';
import { disconnectEventsSocket, initializeEventsSocket } from '@/actions/tppa';
import { CircleButton } from '@/components/CircleButton';
import { CustomButton } from '@/components/CustomButton';
import { TextInputLabel } from '@/components/TextInputLabel';
import { getAltitudePoints } from '@/helpers/sequence';
import { useCameraStore } from '@/stores/camera.store';
import { useConfigStore } from '@/stores/config.store';
import { useMountStore } from '@/stores/mount.store';
import { useNGCStore } from '@/stores/ngc.store';
import { useSequenceStore } from '@/stores/sequence.store';

export const TargetSearch = () => {
  const router = useRouter();
  const configState = useConfigStore();
  const ngcState = useNGCStore();
  const mountState = useMountStore();
  const cameraState = useCameraStore();
  const sequenceState = useSequenceStore();

  const [searchValue, setSearchValue] = useState<string>('');
  const [debounceID, setDebounceID] = useState<NodeJS.Timer>();
  const [didPlatesolveFail, setDidPlatesolveFail] = useState<boolean>(false);
  const [canShowFramingModal, setCanShowFramingModal] = useState<boolean>(true);

  const spinValue = useRef(new Animated.Value(0)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const onValueChange = (value: string) => {
    setSearchValue(value);

    if (value.trim().length >= 3) {
      if (debounceID) {
        clearTimeout(debounceID);
      }

      const debounce = setTimeout(() => {
        searchNGC(value);
      }, 1000);

      setDebounceID(debounce);
    }
  };

  useEffect(() => {
    if (mountState.isSlewing || cameraState.isExposing) {
      setDidPlatesolveFail(false);
    }
  }, [mountState.isSlewing, cameraState.isExposing]);

  useEffect(() => {
    initializeEventsSocket((message) => {
      if (message.Response.Event === 'ERROR-PLATESOLVE') {
        setDidPlatesolveFail(true);
      }
    });

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const interval = setInterval((_) => {
      getMountInfo();
      getCameraInfo();
    }, 1000);

    return () => {
      clearInterval(interval);
      disconnectEventsSocket();
    };
  }, []);

  const onGoto = async (center: boolean) => {
    if (
      ngcState.selectedObject &&
      mountState.isConnected &&
      cameraState.isConnected
    ) {
      const raInDegrees = convertHMStoDegrees(ngcState.selectedObject.ra, true);
      const decInDegrees = convertDMStoDegrees(
        ngcState.selectedObject.dec,
        true,
      );

      await setFramingSource();
      await setFramingCoordinates(raInDegrees, decInDegrees);
      await framingSlew(center, true);
      setCanShowFramingModal(true);
    }
  };

  const onAddToSequence = async () => {
    if (ngcState.selectedObject && sequenceState.sequence.length > 0) {
      const name =
        ngcState.selectedObject.names.split(',')[0] ||
        ngcState.selectedObject.type;
      const raInDegrees = convertHMStoDegrees(ngcState.selectedObject.ra, true);
      const decInDegrees = convertDMStoDegrees(
        ngcState.selectedObject.dec,
        true,
      );

      await setSequenceTarget(name, raInDegrees, decInDegrees);
      router.back();
    }
  };

  const now = new Date();
  let hours = now.getHours();
  hours = hours < 12 ? hours + 12 : hours - 12;
  const minutes = now.getMinutes();
  const hourDate = hours + minutes / 60;

  return (
    <>
      <Modal
        visible={ngcState.isRunning && canShowFramingModal}
        transparent
        supportedOrientations={['landscape']}
      >
        <View className="absolute h-full w-full bg-black opacity-50" />
        <View className="flex flex-1 items-center justify-center">
          <View className="flex w-96 rounded-lg bg-neutral-900 p-5">
            <View className="flex flex-row">
              <View className="mr-10 flex gap-y-6">
                {!mountState.isSlewing &&
                  !cameraState.isExposing &&
                  !didPlatesolveFail && (
                    <View className="flex flex-row items-center">
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Icon name="loading" size={16} color="white" />
                      </Animated.View>
                      <Text className="ml-3 text-xl text-white">
                        Framing...
                      </Text>
                    </View>
                  )}
                {mountState.isSlewing && (
                  <View className="flex flex-row items-center">
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="loading" size={16} color="white" />
                    </Animated.View>
                    <Text className="ml-3 text-xl text-white">
                      Slewing to target...
                    </Text>
                  </View>
                )}
                {cameraState.isExposing && (
                  <View className="flex flex-row items-center">
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="loading" size={16} color="white" />
                    </Animated.View>
                    <Text className="ml-3 text-xl text-white">Exposing...</Text>
                  </View>
                )}
                {didPlatesolveFail && (
                  <View className="flex flex-row items-center">
                    <View>
                      <Icon
                        name="information-outline"
                        size={18}
                        color="#a71914"
                      />
                    </View>
                    <Text className="ml-1 text-xl text-red-600">
                      Platesolve failed. Retrying...
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View className="mt-10 flex w-full flex-row">
              <View className="mr-2 h-12 flex-1">
                <CustomButton
                  label="Stop"
                  color="red"
                  onPress={() => {
                    stopSlewMount();
                    abortCaptureImage();
                  }}
                />
              </View>
              <View className="h-12 flex-1">
                <CustomButton
                  label="Close"
                  color="transparent"
                  onPress={() => setCanShowFramingModal(false)}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 px-4"
      >
        <View className="flex w-full flex-row items-center">
          <View className="w-12">
            <CustomButton
              onPress={() => router.back()}
              color="transparent"
              icon="arrow-left"
              iconSize={24}
            />
          </View>
          <Text className="ml-2 text-xl font-medium text-white">
            Target Search
          </Text>
        </View>
        <View className="mt-4 flex w-full flex-row items-center">
          <TextInputLabel
            value={searchValue}
            placeholder="Search Object (e.g NGC4665)"
            onChange={onValueChange}
          />
        </View>
        <View className="mb-10 h-full">
          {ngcState.results.length === 0 && searchValue.length > 0 && (
            <Text className="mt-8 text-center text-lg font-medium text-neutral-700">
              {`No results for '${searchValue}'`}
            </Text>
          )}
          {ngcState.results.length === 0 && searchValue.length === 0 && (
            <View className="flex flex-1 items-center justify-center opacity-10">
              <Icon name="selection-search" size={140} color="gray" />
            </View>
          )}
          {ngcState.results.map((ngc) => {
            return (
              <View key={ngc.id}>
                <Pressable
                  className={`my-1 flex rounded-lg px-3 pt-3 ${
                    ngcState.selectedObject?.id === ngc.id ? 'bg-black' : ''
                  }`}
                  onPress={() => ngcState.set({ selectedObject: ngc })}
                >
                  <View className="flex flex-row justify-between">
                    <View className="flex flex-row">
                      <View className="mr-3 h-24 w-1 rounded-lg bg-neutral-900" />
                      <View className="flex">
                        <Text className="text-xl font-semibold text-white">
                          {ngc.id}
                        </Text>
                        <Text className="text-sm font-medium text-neutral-300">
                          {ngc.names.split(',')[0] || getNGCTypeText(ngc.type)}
                        </Text>
                        <Text className="mt-3 text-sm text-neutral-500">
                          RA: {ngc.ra}
                        </Text>
                        <Text className="text-sm text-neutral-500">
                          Dec: {ngc.dec}
                        </Text>
                      </View>
                    </View>
                    <View className="mr-6">
                      <LineChart
                        curved
                        width={420}
                        height={90}
                        adjustToWidth
                        maxValue={90}
                        hideYAxisText
                        xAxisLabelTexts={[
                          '12',
                          '13',
                          '14',
                          '15',
                          '16',
                          '17',
                          '18',
                          '19',
                          '20',
                          '21',
                          '22',
                          '23',
                          '00',
                          '01',
                          '02',
                          '03',
                          '04',
                          '05',
                          '06',
                          '07',
                          '08',
                          '09',
                          '10',
                          '11',
                        ]}
                        xAxisLabelTextStyle={{
                          color: '#aaa',
                          fontSize: 8,
                        }}
                        hideAxesAndRules
                        showVerticalLines
                        noOfVerticalLines={1}
                        verticalLinesSpacing={0}
                        verticalLinesThickness={1}
                        verticalLinesShift={hourDate * 17}
                        verticalLinesStrokeDashArray={[6]}
                        verticalLinesColor="#88ad75"
                        yAxisThickness={0}
                        showReferenceLine1
                        stepValue={1}
                        referenceLine1Position={-65}
                        referenceLine1Config={{
                          thickness: 1,
                          width: 420,
                          dashWidth: 5,
                          dashGap: 0,
                          color: 'gray',
                          labelText: '30°',
                          labelTextStyle: {
                            color: '#aaa',
                            fontSize: 8,
                            marginTop: -12,
                          },
                        }}
                        xAxisColor="white"
                        yAxisColor="white"
                        dataPointsRadius1={0}
                        mostNegativeValue={0}
                        color1="#e77"
                        dataPointsColor1="white"
                        data={getAltitudePoints(
                          ngc,
                          configState.config.astrometry.longitude,
                          configState.config.astrometry.latitude,
                        ).map((i) => ({ value: i }))}
                      />
                    </View>
                  </View>
                  <View />
                </Pressable>
                <View className="h-[0.5px] w-full bg-neutral-900" />
              </View>
            );
          })}
        </View>
        <View className="h-8" />
      </ScrollView>
      {ngcState.selectedObject && (
        <View className="absolute bottom-0 flex w-full flex-row justify-end bg-black opacity-90">
          <CircleButton
            disabled={!mountState.isConnected || mountState.isSlewing}
            onPress={() => onGoto(false)}
            color="transparent"
            icon="target"
            label="Slew"
          />
          <CircleButton
            disabled={!mountState.isConnected || mountState.isSlewing}
            onPress={() => onGoto(true)}
            color="transparent"
            icon="target-variant"
            label="Slew & Center"
          />
          <CircleButton
            disabled={!sequenceState.sequence.length}
            onPress={() => onAddToSequence()}
            color="transparent"
            icon="star-plus-outline"
            label="Set as target"
          />
        </View>
      )}
    </>
  );
};
