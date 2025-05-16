import { View } from 'react-native';

import { CustomButton } from './CustomButton';
import { DropDown } from './DropDown';

interface DeviceItem {
  id: string;
  name: string;
}

interface DeviceConnectionProps {
  onListExpand: () => void;
  devices: DeviceItem[];
  currentDevice: DeviceItem | null;
  isListExpanded: boolean;
  onDeviceSelected: (device: DeviceItem) => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onRescan: () => void;
  isConnected: boolean;
  isAPIConnected: boolean;
  useInputText?: boolean;
  onInputTextChange?: (text: string) => void;
  inputTextValue?: string;
}

export const DeviceConnection = ({
  onListExpand,
  devices,
  currentDevice,
  isListExpanded,
  onDeviceSelected,
  onConnect,
  onDisconnect,
  isConnected,
  onRescan,
  isAPIConnected,
  useInputText,
  onInputTextChange,
  inputTextValue,
}: DeviceConnectionProps) => {
  return (
    <View className="flex w-full flex-row items-center justify-center">
      <DropDown
        width={510}
        currentItem={currentDevice}
        useInputText={useInputText}
        onInputTextChange={onInputTextChange}
        inputTextPlaceholder="ex: 192.168.1.1:1888"
        inputTextValue={inputTextValue}
        items={devices}
        isListExpanded={isListExpanded}
        onListExpand={onListExpand}
        onItemSelected={onDeviceSelected}
        defaultText="Select Device"
      />

      <View className="ml-4 w-14">
        {isConnected && (
          <CustomButton
            onPress={() => onDisconnect()}
            icon="connection"
            color="red"
            iconSize={24}
          />
        )}
        {!isConnected && (
          <CustomButton
            disabled={currentDevice === null}
            onPress={() => onConnect()}
            icon="connection"
            iconSize={24}
          />
        )}
      </View>

      <View className="ml-2 w-14">
        <CustomButton
          disabled={!isAPIConnected}
          onPress={() => onRescan()}
          icon="refresh"
          color="neutral"
          iconSize={24}
        />
      </View>
    </View>
  );
};
