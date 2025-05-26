import { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  connectFlatPanel,
  disconnectFlatPanel,
  getFlatPanelInfo,
  rescanFlatPanelDevices,
} from '@/actions/flatpanel';
import { DeviceConnection } from '@/components/DeviceConnection';
import { StatusChip } from '@/components/StatusChip';
import { useConfigStore } from '@/stores/config.store';
import { useFlatPanelStore } from '@/stores/flatpanel.store';

export const FlatPanel = () => {
  const flatPanelState = useFlatPanelStore();
  const configState = useConfigStore();

  const [showDevicesList, setShowDevicesList] = useState(false);

  useEffect(() => {
    rescanFlatPanelDevices();
    getFlatPanelInfo();

    const interval = setInterval((_) => {
      getFlatPanelInfo();
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
        currentDevice={flatPanelState.currentDevice}
        isConnected={flatPanelState.isConnected}
        devices={flatPanelState.devices}
        isListExpanded={showDevicesList}
        onConnect={() =>
          connectFlatPanel(flatPanelState.currentDevice?.id || '')
        }
        onDisconnect={() => disconnectFlatPanel()}
        onRescan={() => rescanFlatPanelDevices()}
        onDeviceSelected={(device) => {
          setShowDevicesList(false);
          flatPanelState.set({ currentDevice: device });
        }}
      />

      <View className="my-3 flex w-full flex-row items-center justify-end">
        <View className="m-2 flex flex-row items-center justify-between">
          <View
            style={{ opacity: flatPanelState.isConnected ? 1.0 : 0.4 }}
            className="mr-4 flex h-8 flex-row items-center justify-center rounded-xl bg-neutral-900 px-4 py-1"
          >
            <Text className="text-xs font-medium text-white">
              Brightness:{' '}
              <Text className="font-bold">{flatPanelState.brightness}</Text>
            </Text>
          </View>
          <StatusChip
            isConnected={flatPanelState.isConnected}
            bubble
            label="Open"
            isActive={flatPanelState.coverState === 'OPEN'}
          />
          <StatusChip
            isConnected={flatPanelState.isConnected}
            bubble
            label="Light"
            isActive={flatPanelState.lightOn}
          />
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
};
