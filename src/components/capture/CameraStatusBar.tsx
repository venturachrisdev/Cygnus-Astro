import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { safeToFixed } from '@/helpers/parse';

import { StatusChip } from '../StatusChip';

interface CameraStatusBarProps {
  cameraTemp: number;
  cameraCooling: boolean;
  mountTracking: boolean;
  mountSlewing: boolean;
  cameraConnected: boolean;
  mountConnected: boolean;
}

export const CameraStatusBar = ({
  cameraTemp,
  cameraCooling,
  mountTracking,
  mountSlewing,
  cameraConnected,
  mountConnected,
}: CameraStatusBarProps) => (
  <View className="flex h-[30px] flex-row items-center">
    <View
      style={{ opacity: cameraConnected ? 1.0 : 0.4 }}
      className="mr-4 flex flex-row items-center justify-center"
    >
      <Text className="text-xs font-medium text-gray-300">
        {safeToFixed(cameraTemp, 1)}
      </Text>
      <Icon name="temperature-celsius" size={10} color="gray" />
    </View>

    <StatusChip
      isConnected={cameraConnected}
      label="Cooling"
      isActive={cameraCooling}
    />
    <StatusChip
      isConnected={mountConnected}
      label="Tracking"
      isActive={mountTracking}
    />
    <StatusChip
      isConnected={mountConnected}
      label="Slewing"
      isActive={mountSlewing}
    />
  </View>
);
