import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

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
          <StatusChip
            isConnected={flatPanelState.isConnected}
            bubble
            label="Open"
            isActive={flatPanelState.isConnected}
          />
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
};
