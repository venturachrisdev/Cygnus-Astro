import { Pressable, Text } from 'react-native';

interface CameraControlProps {
  onPress: () => void;
  label: string;
}

export const CameraControl = ({ onPress, label }: CameraControlProps) => (
  <Pressable className="mb-8 rounded-full p-4" onPress={onPress}>
    <Text className="font-bold text-gray-300">{label}</Text>
  </Pressable>
);
