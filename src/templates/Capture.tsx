import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { LabelSwitch } from '@/components/capture/LabelSwitch';
import { CaptureButton } from '@/components/capture/CaptureButton';
import { CameraControl } from '@/components/capture/CameraControl';
import { CameraDropDown, CameraDropDownItem } from '@/components/capture/CameraDropdown';
import { CameraStatusBar } from '@/components/capture/CameraStatusBar';
import { CameraGuidingBar } from '@/components/capture/CameraGuidingBar';
import { CameraFocuserControlBar } from '@/components/capture/CameraFocuserControlBar';
import { CameraMountControlBar } from '@/components/capture/CameraMountControlBar';
import { CameraImage } from '@/components/capture/CameraImage';
import { CameraBarToggle } from '@/components/capture/CameraBarToggle';
import { MenuItem } from '@/components/MenuItem';
import { Layout } from './Layout';
import { useCameraStore } from '@/stores/camera.store';
import { abortCaptureImage, captureImage, getCameraInfo } from '@/actions/camera';
import { getMountInfo } from '@/actions/mount';
import { useMountStore } from '@/stores/mount.store';
import { changeFilter, getFilterWheelInfo } from '@/actions/filterwheel';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { getFocuserInfo, moveFocuserDown, moveFocuserUp } from '@/actions/focuser';
import { useFocuserStore } from '@/stores/focuser.store';

const durations = [
  0.0001,
  0.001,
  0.01,
  0.05,
  0.1,
  0.5,
  1,
  2,
  3,
  4,
  5,
  10,
  15,
  20,
  25,
  30,
  45,
  60,
  120,
  180,
  240,
  300,
  600,
  900,
];

const Capture = () => {

  const cameraState = useCameraStore();
  const mountState = useMountStore();
  const filterWheelState = useFilterWheelStore();
  const focuserState = useFocuserStore();

  const [showDurationView, setShowDurationView] = useState(false);
  const [showFilterView, setShowFilterView] = useState(false);

  const [showGuiding, setShowGuiding] = useState(false);
  const [showMountControl, setShowMountControl] = useState(false);
  const [showFocuserControl, setShowFocuserControl] = useState(false);
  const [showStatusBar, setShowStatusBar] = useState(true);

  const abortCapture = async () => {
    await abortCaptureImage();
    cameraState.set({ isCapturing: false });
  }

  useEffect(() => {
    getCameraInfo();
    getFocuserInfo();
    getMountInfo();
    getFilterWheelInfo();
  }, []);
  
  const currentFilterText = filterWheelState.availableFilters.find(f => f.id === filterWheelState.currentFilter)?.name;

  return (
    <Layout>
        <View className="bg-black h-full flex flex-1">

          <CameraBarToggle>
            <MenuItem direction="horizontal" size={24} icon="image-filter-center-focus-strong-outline" onPress={() => setShowFocuserControl(!showFocuserControl)} isActive={showFocuserControl} />
            <MenuItem direction="horizontal" size={24} icon="telescope" onPress={() => setShowMountControl(!showMountControl)} isActive={showMountControl} />
            <MenuItem direction="horizontal" size={24} icon="target" onPress={() => setShowGuiding(!showGuiding)} isActive={showGuiding} />
            <MenuItem direction="horizontal" size={24} icon="information-outline" onPress={() => setShowStatusBar(!showStatusBar)} isActive={showStatusBar} />
          </CameraBarToggle>

          <View className="h-full w-full flex flex-1 justify-center items-center">
            <CameraImage
              image={cameraState.image}
              defaultText="Cygnus"
              isLoading={cameraState.isLoading}
            />

            { showMountControl && (
              <CameraMountControlBar />
            )}

            { showFocuserControl && (
              <CameraFocuserControlBar
                position={focuserState.position}
                onMoveUp={moveFocuserUp}
                onMoveDown={moveFocuserDown}
              ></CameraFocuserControlBar>
            )}

            { showGuiding && (
              <CameraGuidingBar />
            )}

            { showStatusBar && (
              <CameraStatusBar
                cameraTemp={cameraState.temperature}
                cameraCooling={cameraState.cooling}
                cameraDewHeater={cameraState.dewHeater}
                mountParked={mountState.isParked}
                mountTracking={mountState.isTracking}
              />
            )}
          </View>
        </View>

        {showDurationView && (
          <CameraDropDown>
            { durations.map((duration) => (
              <CameraDropDownItem key={duration} label={`${duration}s`} onPress={() => { cameraState.set({ duration }) ; setShowDurationView(false) }} isActive={duration === cameraState.duration} />
            ))}
          </CameraDropDown>
        )}

        {showFilterView && (
          <CameraDropDown>
            { filterWheelState.availableFilters.map((filter) => (
              <CameraDropDownItem key={filter.id} label={filter.name} onPress={() => { changeFilter(filter.id); setShowFilterView(false) }} isActive={filter.id == filterWheelState.currentFilter} />
            ))}
          </CameraDropDown>
        )}

        <View className="bg-neutral-900 h-full w-24 flex flex-column items-center pt-5">
          <CameraControl label={`${cameraState.duration}s`} onPress={() => setShowDurationView(!showDurationView)}></CameraControl>
          <CameraControl label={currentFilterText || ''} onPress={() => setShowFilterView(!showFilterView)}></CameraControl>

          <CaptureButton
            progressPercentage={(cameraState.countdown / cameraState.duration) * 100}
            isCapturing={cameraState.isCapturing}
            disabled={cameraState.isLoading || !cameraState.canCapture}
            onCancel={abortCapture}
            onCapture={captureImage}
          />

          <Text className="text-gray-100 text-center text-sm my-3">{cameraState.countdown > 0 ? `${cameraState.countdown}s` : ' '}</Text>

          <LabelSwitch label="Loop" value={cameraState.loop} onChange={(value) => cameraState.set({ loop: value}) } />
        </View>
    </Layout>
  );
};

export { Capture };
