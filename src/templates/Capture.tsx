import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  abortCaptureImage,
  captureImage,
  getCameraInfo,
  getCapturedImageWithRetries,
} from '@/actions/camera';
import { changeFilter, getFilterWheelInfo } from '@/actions/filterwheel';
import {
  getFocuserInfo,
  moveFocuserDown,
  moveFocuserUp,
} from '@/actions/focuser';
import { getGuiderInfo, getGuidingGraph } from '@/actions/guider';
import { getCurrentProfile } from '@/actions/hosts';
import {
  getMountInfo,
  initializeMountSocket,
  sendMountEvent,
} from '@/actions/mount';
import {
  getFullImageByIndex,
  getImageHistory,
  getSequenceState,
} from '@/actions/sequence';
import { CameraBarToggle } from '@/components/capture/CameraBarToggle';
import { CameraControl } from '@/components/capture/CameraControl';
import {
  CameraDropDown,
  CameraDropDownItem,
} from '@/components/capture/CameraDropdown';
import { CameraFocuserControlBar } from '@/components/capture/CameraFocuserControlBar';
import { CameraGuidingBar } from '@/components/capture/CameraGuidingBar';
import { CameraImage } from '@/components/capture/CameraImage';
import { CameraMountControlBar } from '@/components/capture/CameraMountControlBar';
import { CameraSequenceActiveStep } from '@/components/capture/CameraSequenceActiveStep';
import { CameraStatusBar } from '@/components/capture/CameraStatusBar';
import { CaptureButton } from '@/components/capture/CaptureButton';
import { LabelSwitch } from '@/components/capture/LabelSwitch';
import { ZoomableCameraImage } from '@/components/capture/ZoomableCameraImage';
import { MenuItem } from '@/components/MenuItem';
import { getRunningStep } from '@/helpers/sequence';
import { useCameraStore } from '@/stores/camera.store';
import { useCaptureStore } from '@/stores/capture.store';
import { useConfigStore } from '@/stores/config.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { useFocuserStore } from '@/stores/focuser.store';
import { useGuiderStore } from '@/stores/guider.store';
import { useMountStore } from '@/stores/mount.store';
import { useSequenceStore } from '@/stores/sequence.store';

const durations = [
  0.0001, 0.001, 0.01, 0.05, 0.1, 0.5, 1, 2, 3, 4, 5, 10, 15, 20, 25, 30, 45,
  60, 120, 180, 240, 300, 600, 900,
];

const Capture = () => {
  const captureState = useCaptureStore();
  const configState = useConfigStore();
  const cameraState = useCameraStore();
  const mountState = useMountStore();
  const filterWheelState = useFilterWheelStore();
  const focuserState = useFocuserStore();
  const guiderState = useGuiderStore();
  const sequenceState = useSequenceStore();
  const router = useRouter();

  const [showDurationView, setShowDurationView] = useState(false);
  const [showFilterView, setShowFilterView] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const abortCapture = async () => {
    await abortCaptureImage();
    cameraState.set({ isCapturing: false });
  };

  useEffect(() => {
    initializeMountSocket(() => {});
    if (useConfigStore.getState().isConnected) {
      getCameraInfo();
      getFocuserInfo();
      getMountInfo();
      getFilterWheelInfo();
      getImageHistory();
    }

    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const interval = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getCurrentProfile();
        getFocuserInfo();
        getMountInfo();
        getFilterWheelInfo();
        getGuidingGraph();
        getGuiderInfo();
        getSequenceState();
      }
    }, 1000);
    const intervalCapture = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getCameraInfo();
      }
    }, 500);

    const intervalImages = setInterval(() => {
      const checkImages = async () => {
        const currentImages = useSequenceStore.getState().images;
        const newImages = await getImageHistory(false, false);

        if (currentImages.length !== newImages.length) {
          getImageHistory();
        }
      };

      if (sequenceState.isRunning) {
        checkImages();
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(intervalCapture);
      clearInterval(intervalImages);
    };
  }, []);

  useEffect(() => {
    if (
      sequenceState.images.length &&
      (cameraState.image === null || sequenceState.isRunning)
    ) {
      const action = async () => {
        const lastIndex = sequenceState.images.length - 1;
        cameraState.set({ isLoading: true });
        const fullImage = await getFullImageByIndex(lastIndex);
        cameraState.set({ image: fullImage, isLoading: false });
      };

      action();
    }
  }, [sequenceState.images]);

  useEffect(() => {
    if (cameraState.countdown === 1) {
      getCapturedImageWithRetries();
    }
  }, [cameraState.countdown]);

  const currentFilterText = useMemo(
    () =>
      filterWheelState.availableFilters.find(
        (f) => f.id === filterWheelState.currentFilter,
      )?.name,
    [filterWheelState.currentFilter, filterWheelState.availableFilters],
  );

  const runningStep = useMemo(
    () => getRunningStep(sequenceState.sequence),
    [sequenceState.sequence],
  );

  const runnningExposureTime = useMemo(
    () =>
      runningStep &&
      runningStep.Name.includes('Exposure') &&
      runningStep.Items?.length
        ? runningStep.Items[0]?.ExposureTime
        : undefined,
    [runningStep],
  );

  return (
    <>
      <View className="flex h-full flex-1 bg-black">
        <CameraBarToggle>
          <View className="flex flex-row">
            <CameraStatusBar
              cameraTemp={cameraState.temperature}
              cameraCooling={cameraState.cooling}
              mountTracking={mountState.isTracking}
              mountSlewing={mountState.isSlewing}
              cameraConnected={cameraState.isConnected}
              mountConnected={mountState.isConnected}
            />
          </View>

          <View className="flex flex-row">
            <MenuItem
              disabled={!sequenceState.isRunning}
              direction="horizontal"
              size={24}
              icon="format-list-numbered"
              onPress={() =>
                captureState.set({
                  showSequenceControl: !captureState.showSequenceControl,
                })
              }
              isActive={captureState.showSequenceControl}
            />
            <MenuItem
              disabled={!filterWheelState.isConnected}
              direction="horizontal"
              size={24}
              icon="image-filter-center-focus-strong-outline"
              onPress={() =>
                captureState.set({
                  showFocuserControl: !captureState.showFocuserControl,
                })
              }
              isActive={captureState.showFocuserControl}
            />
            <MenuItem
              disabled={!mountState.isConnected}
              direction="horizontal"
              size={24}
              icon="telescope"
              onPress={() =>
                captureState.set({
                  showMountControl: !captureState.showMountControl,
                })
              }
              isActive={captureState.showMountControl}
            />
            <MenuItem
              disabled={!guiderState.isConnected}
              direction="horizontal"
              size={24}
              icon="target"
              onPress={() =>
                captureState.set({
                  showGuiding: !captureState.showGuiding,
                })
              }
              isActive={captureState.showGuiding}
            />
          </View>
        </CameraBarToggle>
        <View className="flex h-full w-full flex-1 items-center justify-center">
          <ZoomableCameraImage
            image={cameraState.image}
            resizeMode="contain"
            isLoading={cameraState.isLoading}
          />

          {captureState.showMountControl && (
            <CameraMountControlBar
              disabled={!mountState.isConnected || mountState.isParked}
              absolute
              showStop={false}
              onMoveLeft={() =>
                sendMountEvent({ direction: 'west', rate: 2.0 })
              }
              onMoveRight={() =>
                sendMountEvent({ direction: 'east', rate: 2.0 })
              }
              onMoveUp={() => sendMountEvent({ direction: 'north', rate: 2.0 })}
              onMoveDown={() =>
                sendMountEvent({ direction: 'south', rate: 2.0 })
              }
              onMoveStop={() => {}}
            />
          )}

          {captureState.showFocuserControl && (
            <CameraFocuserControlBar
              position={focuserState.position}
              onMoveUp={moveFocuserUp}
              onMoveDown={moveFocuserDown}
            />
          )}

          {captureState.showGuiding && (
            <CameraGuidingBar
              graph={guiderState.graph}
              error={guiderState.error}
            />
          )}
        </View>
        {runningStep && (
          <CameraSequenceActiveStep
            step={runningStep}
            spinValue={spin}
            enabled={captureState.showSequenceControl}
            isShowingGuiding={captureState.showGuiding}
          />
        )}
      </View>

      {showDurationView && (
        <CameraDropDown>
          {durations.map((duration) => (
            <CameraDropDownItem
              key={duration}
              label={`${duration}s`}
              onPress={() => {
                cameraState.set({ duration });
                setShowDurationView(false);
              }}
              isActive={duration === cameraState.duration}
            />
          ))}
        </CameraDropDown>
      )}

      {showFilterView && filterWheelState.isConnected && (
        <CameraDropDown>
          {filterWheelState.availableFilters.map((filter) => (
            <CameraDropDownItem
              key={filter.id}
              label={filter.name}
              onPress={() => {
                changeFilter(filter.id);
                setShowFilterView(false);
              }}
              isActive={filter.id === filterWheelState.currentFilter}
            />
          ))}
        </CameraDropDown>
      )}

      <View
        className="flex h-full w-24 items-center justify-center bg-neutral-900"
        style={{ zIndex: 99 }}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={{
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '99%',
          }}
          className="flex w-full"
        >
          <View className="h-4" />
          <CameraControl
            label={`${cameraState.duration}s`}
            onPress={() => setShowDurationView(!showDurationView)}
          />
          <CameraControl
            label={currentFilterText || '...'}
            onPress={() => setShowFilterView(!showFilterView)}
          />

          <CaptureButton
            progressPercentage={
              (cameraState.countdown /
                (cameraState.isCapturing
                  ? cameraState.duration
                  : runnningExposureTime ||
                    configState.config.snapshot.duration)) *
              100
            }
            isCapturing={
              cameraState.isCapturing ||
              (cameraState.isExposing && !sequenceState.isRunning)
            }
            disabled={
              !configState.isConnected ||
              !cameraState.isConnected ||
              cameraState.isLoading ||
              !cameraState.canCapture ||
              sequenceState.isRunning ||
              filterWheelState.isMoving
            }
            onCancel={abortCapture}
            onCapture={captureImage}
          />

          <Text className="my-3 text-center text-sm text-gray-100">
            {cameraState.countdown > 0 ? `${cameraState.countdown}s` : ' '}
          </Text>

          {sequenceState.images.length > 0 && (
            <Pressable
              disabled={sequenceState.isLoadingImages}
              onPress={() => router.push('/image-history')}
              className="mt-4 h-14 w-14 overflow-hidden rounded-lg border-2 border-neutral-600 bg-gray-900 p-[1px]"
            >
              <View className="flex h-full w-full flex-1 items-center justify-center">
                <CameraImage
                  image={
                    sequenceState.images[sequenceState.images.length - 1]
                      ?.image || null
                  }
                  resizeMode="center"
                  isLoading={sequenceState.isLoadingImages}
                  defaultText=""
                />
              </View>
            </Pressable>
          )}

          <LabelSwitch
            label="Loop"
            disabled={!cameraState.isConnected}
            value={cameraState.loop}
            onChange={(value) => cameraState.set({ loop: value })}
          />
          <View className="h-4" />
        </ScrollView>
      </View>
    </>
  );
};

export { Capture };
