import { Pressable, Text } from 'react-native';

interface CameraControlProps {
  onPress: () => void;
  label: string;
}

export const CameraControl = ({ onPress, label }: CameraControlProps) => (
  <Pressable className="p-4 mb-8 rounded-full" onPress={onPress}>
    <Text className="text-gray-300 font-bold">{label}</Text>
  </Pressable>
);
