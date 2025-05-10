/* eslint-disable no-nested-ternary */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

interface StatusChipProps {
  label: string;
  isActive: boolean;
  last?: boolean;
  bubble?: boolean;
  isConnected: boolean;
}

export const StatusChip = ({
  label,
  isActive,
  last,
  isConnected,
  bubble = false,
}: StatusChipProps) => (
  <View
    style={{ opacity: isConnected ? 1.0 : 0.4 }}
    className={`flex flex-row items-center justify-center gap-x-1 rounded-xl bg-neutral-900 ${
      last ?? 'mr-4'
    } ${bubble ? 'h-8 px-4' : 'px-3'}`}
  >
    <Text className="text-xs font-medium text-gray-300">{label}</Text>
    <Icon
      name="brightness-1"
      size={10}
      color={isConnected ? (isActive ? 'green' : 'red') : 'gray'}
    />
  </View>
);
