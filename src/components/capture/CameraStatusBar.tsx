import { View, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { StatusChip } from '../StatusChip';

interface CameraStatusBarProps {
  cameraTemp: number;
  cameraCooling: boolean;
  cameraDewHeater: boolean;
  mountParked: boolean;
  mountTracking: boolean;
}

export const CameraStatusBar = ({ cameraTemp, cameraCooling, cameraDewHeater, mountParked, mountTracking }: CameraStatusBarProps) => (
  <View className="absolute bottom-5 left-5 flex flex-row opacity-60 items-center">
    <View className="rounded-xl bg-neutral-900 py-1 px-4 h-8 flex justify-center items-center flex-row mr-4">
      <Text className="text-white font-medium text-xs">{cameraTemp}</Text>
      <Icon name="temperature-celsius" size={10} color="white" />
    </View>
  
    <StatusChip label="Cooling" isActive={cameraCooling}></StatusChip>
    <StatusChip label="Dew Heater" isActive={cameraDewHeater}></StatusChip>
    <StatusChip label="Parked" isActive={mountParked}></StatusChip>
    <StatusChip label="Tracking" isActive={mountTracking}></StatusChip>
  </View>
);
