import { NativeWindStyleSheet } from 'nativewind';
import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert } from '@/components/Alert';
import { MenuItem } from '@/components/MenuItem';
import { useAlertsStore } from '@/stores/alerts.store';
import { Accessories } from '@/templates/Accessories';
import { Camera } from '@/templates/Camera';
import { Capture } from '@/templates/Capture';
import { Config } from '@/templates/Config';
import { Focuser } from '@/templates/Focuser';
import { Guider } from '@/templates/Guider';
import { Mount } from '@/templates/Mount';
import { Sequence } from '@/templates/Sequence';
import { TPPA } from '@/templates/TPPA';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

export default function Layout() {
  const alertsState = useAlertsStore();
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();
  const [currentTab, setCurrentTab] = useState<string>('capture');

  const dismissAlert = () => {
    alertsState.set({ message: null, type: null });
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  };

  useEffect(() => {
    if (alertsState.message && alertsState.type) {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      const id = setTimeout(() => {
        dismissAlert();
      }, 2000);

      setTimeoutID(id);
    }
  }, [alertsState.message, alertsState.type]);

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={{ backgroundColor: '#171717' }}
    >
      <View className="flex h-full flex-row justify-end">
        <View className="h-full w-20 bg-neutral-900">
          <ScrollView
            bounces={false}
            contentContainerStyle={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingBottom: 20,
            }}
            className="flex py-6"
          >
            <MenuItem
              direction="vertical"
              size={28}
              icon="telescope"
              onPress={() => {
                setCurrentTab('mount');
              }}
              isActive={currentTab === 'mount'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="camera"
              onPress={() => {
                setCurrentTab('camera');
              }}
              isActive={currentTab === 'camera'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="image-filter-center-focus"
              onPress={() => {
                setCurrentTab('focuser');
              }}
              isActive={currentTab === 'focuser'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="camera-iris"
              onPress={() => {
                setCurrentTab('capture');
              }}
              isActive={currentTab === 'capture'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="target"
              onPress={() => {
                setCurrentTab('guider');
              }}
              isActive={currentTab === 'guider'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="ferris-wheel"
              onPress={() => {
                setCurrentTab('accessories');
              }}
              isActive={currentTab === 'accessories'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="star-four-points"
              onPress={() => {
                setCurrentTab('tppa');
              }}
              isActive={currentTab === 'tppa'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="format-list-numbered"
              onPress={() => {
                setCurrentTab('sequence');
              }}
              isActive={currentTab === 'sequence'}
            />
            <MenuItem
              direction="vertical"
              size={28}
              icon="cog"
              onPress={() => {
                setCurrentTab('config');
              }}
              isActive={currentTab === 'config'}
            />
          </ScrollView>
        </View>
        <View className="flex h-full flex-1 flex-row justify-end">
          {currentTab === 'capture' && <Capture />}
          {currentTab === 'accessories' && <Accessories />}
          {currentTab === 'camera' && <Camera />}
          {currentTab === 'config' && <Config />}
          {currentTab === 'focuser' && <Focuser />}
          {currentTab === 'guider' && <Guider />}
          {currentTab === 'mount' && <Mount />}
          {currentTab === 'sequence' && <Sequence />}
          {currentTab === 'tppa' && <TPPA />}
        </View>

        <View className="absolute bottom-6 flex w-full items-center justify-center opacity-95">
          {alertsState.message && alertsState.type && (
            <View className="w-[70%]">
              <Alert
                message={alertsState.message}
                type={alertsState.type}
                onPress={dismissAlert}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
