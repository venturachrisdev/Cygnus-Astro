/* eslint-disable import/no-extraneous-dependencies */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, ScrollView, Text, View } from 'react-native';

import { getCameraInfo } from '@/actions/camera';
import {
  convertDegreesToDMS,
  getMountInfo,
  stopSlewMount,
} from '@/actions/mount';
import {
  initializeEventsSocket,
  initializeTPPASocket,
  pauseTPPAAlignment,
  resumeTPPAAlignment,
  startTPPAAlignment,
  stopTPPAAlignment,
} from '@/actions/tppa';
import { CircleButton } from '@/components/CircleButton';
import { useCameraStore } from '@/stores/camera.store';
import { useConfigStore } from '@/stores/config.store';
import { useMountStore } from '@/stores/mount.store';

export const TPPA = () => {
  const configState = useConfigStore();
  const mountState = useMountStore();
  const cameraState = useCameraStore();

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [didPlatesolveFailed, setDidPlatesolveFailed] = useState(false);
  const [altitudeError, setAltitudeError] = useState<number>(0);
  const [azimuthError, setAzimuthError] = useState<number>(0);
  const [totalError, setTotalError] = useState<number>(0);

  useEffect(() => {
    initializeTPPASocket((message) => {
      if (message.Response === 'started procedure') {
        setAltitudeError(undefined);
        setAzimuthError(undefined);
        setTotalError(undefined);
        setDidPlatesolveFailed(false);

        setIsRunning(true);
        setIsPaused(false);
      } else if (message.Response === 'stopped procedure') {
        setIsRunning(false);
        setIsPaused(false);
        setDidPlatesolveFailed(false);
      } else if (message.Response === 'paused procedure') {
        setIsPaused(true);
        setIsRunning(true);
      } else if (message.Response === 'resumed procedure') {
        setIsPaused(false);
        setIsRunning(true);
      } else if (message.Response.TotalError) {
        setIsRunning(true);
        setIsPaused(true);
        pauseTPPAAlignment();

        setAltitudeError(message.Response.AltitudeError);
        setAzimuthError(message.Response.AzimuthError);
        setTotalError(message.Response.TotalError);
      }
    });

    initializeEventsSocket((message) => {
      if (message.Response.Event === 'ERROR-PLATESOLVE') {
        setDidPlatesolveFailed(true);
      }
    });

    const interval = setInterval((_) => {
      getCameraInfo();
      getMountInfo();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mountState.isSlewing || cameraState.isExposing) {
      setDidPlatesolveFailed(false);
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
                  top: 63 + altitudeError * 10,
                  left: 63 + azimuthError * 10,
                }}
              >
                <View className="h-[10px] w-[10px] rounded-full bg-yellow-400" />
              </View>
            </View>
            <View className="">
              {isRunning && mountState.isSlewing && (
                <View className="mt-6 flex flex-row items-center">
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon name="loading" size={16} color="white" />
                  </Animated.View>
                  <Text className="ml-1 text-xl text-white">
                    Slewing to next position...
                  </Text>
                </View>
              )}
              {isRunning && cameraState.isExposing && (
                <View className="mt-6 flex flex-row items-center">
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Icon name="loading" size={16} color="white" />
                  </Animated.View>
                  <Text className="ml-1 text-xl text-white">Exposing...</Text>
                </View>
              )}
              {isRunning && didPlatesolveFailed && (
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
            style={{ opacity: (totalError || 0) === 0 ? 0.3 : 1.0 }}
          >
            <View className="flex-row items-center justify-end">
              <Icon
                name={
                  isErrorPositive(azimuthError || 0)
                    ? 'arrow-left'
                    : 'arrow-right'
                }
                color={
                  isErrorInGoodRange(azimuthError || 0) ? '#0d730d' : '#a71914'
                }
                size={48}
              />
              <Text
                className={`${
                  isErrorInGoodRange(azimuthError || 0)
                    ? 'text-green-800'
                    : 'text-red-800'
                } ml-4 mt-1 text-5xl font-light`}
              >
                {convertDegreesToDMS(azimuthError || 0)}
              </Text>
            </View>
            <View className="flex-row items-center justify-end">
              <Icon
                name={
                  isErrorPositive(altitudeError || 0)
                    ? 'arrow-down'
                    : 'arrow-up'
                }
                color={
                  isErrorInGoodRange(altitudeError || 0) ? '#0d730d' : '#a71914'
                }
                size={48}
              />
              <Text
                className={`${
                  isErrorInGoodRange(altitudeError || 0)
                    ? 'text-green-800'
                    : 'text-red-800'
                } ml-4 mt-1 text-5xl font-light`}
              >
                {convertDegreesToDMS(altitudeError || 0)}
              </Text>
            </View>
            <View className="mt-5 flex-row items-center justify-end">
              <Icon
                name={
                  isErrorInGoodRange(totalError || 0)
                    ? 'emoticon-happy-outline'
                    : 'emoticon-sad-outline'
                }
                style={{ opacity: (totalError || 0) === 0 ? 0.0 : 1.0 }}
                color={
                  isErrorInGoodRange(totalError || 0) ? '#0d730d' : '#a71914'
                }
                size={48}
              />
              <Text
                className={`${
                  isErrorInGoodRange(totalError || 0)
                    ? 'text-green-800'
                    : 'text-red-800'
                } ml-4 mr-1 mt-1 text-3xl font-light`}
              >
                {convertDegreesToDMS(totalError || 0)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View className="absolute bottom-5 right-5 flex flex-row items-center justify-end gap-x-3 p-3">
        {!isRunning && (
          <CircleButton
            disabled={!allComponentsConnected}
            onPress={() => startTPPAAlignment()}
            color="green"
            icon="play"
          />
        )}

        {isPaused && isRunning && (
          <CircleButton
            disabled={!allComponentsConnected}
            onPress={() => resumeTPPAAlignment()}
            color="green"
            icon="play"
          />
        )}

        {!isPaused && isRunning && (
          <CircleButton
            disabled={!allComponentsConnected}
            onPress={() => pauseTPPAAlignment()}
            color="yellow"
            icon="pause"
          />
        )}

        {isRunning && (
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
