/* eslint-disable import/no-extraneous-dependencies */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { getCameraInfo } from '@/actions/camera';
import {
  convertDegreesToDMS,
  getMountInfo,
  stopSlewMount,
} from '@/actions/mount';
import {
  disconnectEventsSocket,
  disconnectTPPASocket,
  handleTPPAEventMessage,
  handleTPPAMessage,
  initializeEventsSocket,
  initializeTPPASocket,
  pauseTPPAAlignment,
  resumeTPPAAlignment,
  startTPPAAlignment,
  stopTPPAAlignment,
} from '@/actions/tppa';
import { LabelSwitch } from '@/components/capture/LabelSwitch';
import { CircleButton } from '@/components/CircleButton';
import { useCameraStore } from '@/stores/camera.store';
import { useConfigStore } from '@/stores/config.store';
import { useMountStore } from '@/stores/mount.store';
import { useTPPAStore } from '@/stores/tppa.store';

const MIN_TARGET_DISTANCE = 5;
const MAX_TARGET_DISTANCE = 30;

export const TPPA = () => {
  const configState = useConfigStore();
  const mountState = useMountStore();
  const cameraState = useCameraStore();
  const tppaState = useTPPAStore();

  useEffect(() => {
    initializeTPPASocket(handleTPPAMessage);

    initializeEventsSocket(handleTPPAEventMessage);

    const interval = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getCameraInfo();
        getMountInfo();
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      disconnectTPPASocket();
      disconnectEventsSocket();
    };
  }, []);

  useEffect(() => {
    if (mountState.isSlewing || cameraState.isExposing) {
      tppaState.set({
        didPlatesolveFail: false,
      });
    }
  }, [mountState.isSlewing, cameraState.isExposing]);

  const isErrorPositive = (error: number): boolean => {
    const { latitude } = configState.config.astrometry;
    // Account for Southern Hemisphere where altitude is negative
    return latitude >= 0 ? error >= 0 : error < 0;
  };

  const isErrorInGoodRange = (error: number): boolean => {
    return error <= 0.0334;
  };

  const allComponentsConnected = useMemo(
    () =>
      configState.isConnected &&
      mountState.isConnected &&
      cameraState.isConnected,
    [configState.isConnected, mountState.isConnected, cameraState.isConnected],
  );

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

  return (
    <>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 p-4"
      >
        <Text className="mt-3 text-lg font-semibold text-white">
          Three Point Polar Alignment
        </Text>
        <View className="mr-10 mt-8 flex flex-row justify-between">
          <View
            className="flex items-center justify-center"
            style={{ width: 250 }}
          >
            <View
              style={{ borderWidth: 8 }}
              className="items-center justify-center rounded-full border-neutral-500 p-2"
            >
              <Icon name="target" size={120} color="gray" />
              <View
                className="absolute"
                style={{
                  top: 63 + tppaState.altitudeError * 10,
                  left: 63 + tppaState.azimuthError * 10,
                }}
              >
                <View className="h-[10px] w-[10px] rounded-full bg-yellow-400" />
              </View>
            </View>
            <View className="">
              {tppaState.isRunning &&
                !!tppaState.status &&
                !mountState.isSlewing &&
                !cameraState.isExposing && (
                  <View className="mt-6 flex flex-row items-center">
                    <Animated.View style={{ transform: [{ rotate: spin }] }}>
                      <Icon name="loading" size={16} color="white" />
                    </Animated.View>
                    <Text className="ml-1 text-xl text-white">
                      {tppaState.status}
                    </Text>
                  </View>
                )}
              {tppaState.isRunning && mountState.isSlewing && (
                <View className="mt-6 flex flex-row items-center">
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon name="loading" size={16} color="white" />
                  </Animated.View>
                  <Text className="ml-1 text-xl text-white">
                    Slewing to next position...
                  </Text>
                </View>
              )}
              {tppaState.isRunning && cameraState.isExposing && (
                <View className="mt-6 flex flex-row items-center">
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon name="loading" size={16} color="white" />
                  </Animated.View>
                  <Text className="ml-1 text-xl text-white">Exposing...</Text>
                </View>
              )}
              {tppaState.isRunning && tppaState.didPlatesolveFail && (
                <View
                  className={`${
                    !cameraState.isExposing ? 'mt-6' : ''
                  } flex flex-row items-center`}
                >
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
          <View
            className="flex"
            style={{ opacity: (tppaState.totalError || 0) === 0 ? 0.3 : 1.0 }}
          >
            <View className="flex-row items-center justify-end">
              <Icon
                name={
                  isErrorPositive(tppaState.azimuthError || 0)
                    ? 'arrow-left'
                    : 'arrow-right'
                }
                color={
                  isErrorInGoodRange(tppaState.azimuthError || 0)
                    ? '#0d730d'
                    : '#a71914'
                }
                size={48}
              />
              <Text
                className={`${
                  isErrorInGoodRange(tppaState.azimuthError || 0)
                    ? 'text-green-800'
                    : 'text-red-800'
                } ml-4 mt-1 text-5xl font-light`}
              >
                {convertDegreesToDMS(tppaState.azimuthError || 0)}
              </Text>
            </View>
            <View className="flex-row items-center justify-end">
              <Icon
                name={
                  isErrorPositive(tppaState.altitudeError || 0)
                    ? 'arrow-down'
                    : 'arrow-up'
                }
                color={
                  isErrorInGoodRange(tppaState.altitudeError || 0)
                    ? '#0d730d'
                    : '#a71914'
                }
                size={48}
              />
              <Text
                className={`${
                  isErrorInGoodRange(tppaState.altitudeError || 0)
                    ? 'text-green-800'
                    : 'text-red-800'
                } ml-4 mt-1 text-5xl font-light`}
              >
                {convertDegreesToDMS(tppaState.altitudeError || 0)}
              </Text>
            </View>
            <View className="mt-5 flex-row items-center justify-end">
              <Icon
                name={
                  isErrorInGoodRange(tppaState.totalError || 0)
                    ? 'emoticon-happy-outline'
                    : 'emoticon-sad-outline'
                }
                style={{
                  opacity: (tppaState.totalError || 0) === 0 ? 0.0 : 1.0,
                }}
                color={
                  isErrorInGoodRange(tppaState.totalError || 0)
                    ? '#0d730d'
                    : '#a71914'
                }
                size={48}
              />
              <Text
                className={`${
                  isErrorInGoodRange(tppaState.totalError || 0)
                    ? 'text-green-800'
                    : 'text-red-800'
                } ml-4 mr-1 mt-1 text-3xl font-light`}
              >
                {convertDegreesToDMS(tppaState.totalError || 0)}
              </Text>
            </View>
          </View>
        </View>

        {!tppaState.isRunning && (
          <View className="mt-10 flex flex-row items-start gap-x-12">
            <LabelSwitch
              label="Start from current position"
              value={tppaState.startFromCurrentPosition}
              onChange={(value) =>
                tppaState.set({ startFromCurrentPosition: value })
              }
            />
            <View className="mt-6 flex items-center justify-center">
              <Text className="mb-3 text-center text-xs font-semibold text-white">
                Target distance (°)
              </Text>
              <View className="flex flex-row items-center gap-x-4">
                <Pressable
                  onPress={() =>
                    tppaState.set({
                      targetDistance: Math.max(
                        MIN_TARGET_DISTANCE,
                        tppaState.targetDistance - 1,
                      ),
                    })
                  }
                >
                  <Icon name="minus-circle" size={30} color="white" />
                </Pressable>
                <Text className="w-8 text-center text-xl font-light text-white">
                  {tppaState.targetDistance}
                </Text>
                <Pressable
                  onPress={() =>
                    tppaState.set({
                      targetDistance: Math.min(
                        MAX_TARGET_DISTANCE,
                        tppaState.targetDistance + 1,
                      ),
                    })
                  }
                >
                  <Icon name="plus-circle" size={30} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-5 right-5 flex flex-row items-center justify-end gap-x-3 p-3">
        {!tppaState.isRunning && (
          <CircleButton
            disabled={!allComponentsConnected || mountState.isParked}
            onPress={() =>
              startTPPAAlignment({
                StartFromCurrentPosition: tppaState.startFromCurrentPosition,
                TargetDistance: tppaState.targetDistance,
              })
            }
            color="green"
            icon="play"
          />
        )}

        {tppaState.isPaused && tppaState.isRunning && (
          <CircleButton
            disabled={!allComponentsConnected || mountState.isParked}
            onPress={() => resumeTPPAAlignment()}
            color="green"
            icon="play"
          />
        )}

        {!tppaState.isPaused && tppaState.isRunning && (
          <CircleButton
            disabled={!allComponentsConnected}
            onPress={() => pauseTPPAAlignment()}
            color="yellow"
            icon="pause"
          />
        )}

        {tppaState.isRunning && (
          <CircleButton
            disabled={!allComponentsConnected}
            onPress={() => {
              stopTPPAAlignment();
              stopSlewMount();
            }}
            color="red"
            icon="stop"
          />
        )}
      </View>
    </>
  );
};
