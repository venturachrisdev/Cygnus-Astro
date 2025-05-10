import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable, Text, View } from 'react-native';

interface CameraFocuserControlBarProps {
  position: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const CameraFocuserControlBar = ({
  position,
  onMoveUp,
  onMoveDown,
}: CameraFocuserControlBarProps) => (
  <View className="absolute left-5 top-5 flex items-center justify-center gap-y-3 opacity-70">
    <Text className="text-center font-semibold text-white">{position}</Text>
    <Pressable
      onPress={onMoveUp}
      className="flex h-12 w-14 items-center justify-center rounded-lg bg-neutral-900"
    >
      <Icon name="arrow-up-drop-circle-outline" size={22} color="white" />
    </Pressable>

    <Pressable
      onPress={onMoveDown}
      className="flex h-12 w-14 items-center justify-center rounded-lg bg-neutral-900"
    >
      <Icon name="arrow-down-drop-circle-outline" size={22} color="white" />
    </Pressable>
  </View>
);
