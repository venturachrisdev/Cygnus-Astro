import { View, Text, Pressable } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface CameraFocuserControlBarProps {
  position: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const CameraFocuserControlBar = ({ position, onMoveUp, onMoveDown }: CameraFocuserControlBarProps) => (
  <View className="absolute flex flex-column gap-y-3 justify-center items-center top-5 left-5 opacity-70">
    <Text className="text-white font-semibold text-center">{position}</Text>
    <Pressable onPress={onMoveUp} className="bg-neutral-900 w-14 h-12 rounded-lg flex justify-center items-center">
      <Icon name="arrow-up-drop-circle-outline" size={22} color="white" />
    </Pressable>

    <Pressable onPress={onMoveDown} className="bg-neutral-900 w-14 h-12 rounded-lg flex justify-center items-center">
      <Icon name="arrow-down-drop-circle-outline" size={22} color="white" />
    </Pressable>
  </View>
);
