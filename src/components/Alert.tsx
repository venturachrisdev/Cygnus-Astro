import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text } from 'react-native';

interface AlertProps {
  message: string;
  type: string;
  onPress: () => void;
}

export const Alert = ({ message, type, onPress }: AlertProps) => {
  const getIconColor = (): string => {
    switch (type) {
      case 'warning':
        return '#b38b1d';
      case 'error':
        return '#a12020';
      case 'success':
        return '#1f610b';
      case 'info':
      default:
        return 'gray';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      className="flex flex-row items-center rounded-3xl bg-neutral-800 px-4 py-3"
    >
      <Icon name="alert-circle" size={24} className="" color={getIconColor()} />
      <Text className="ml-2 text-sm font-medium text-gray-400">{message}</Text>
    </Pressable>
  );
};
