import { View, Pressable } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface CameraMountControlBarProps {

}

export const CameraMountControlBar = ({}: CameraMountControlBarProps) => (
  <View className="absolute flex flex-row gap-x-3 justify-center items-center top-5 right-5 opacity-60">
    <Pressable className="bg-neutral-900 w-14 h-14 rounded-lg flex justify-center items-center">
      <Icon name="arrow-left-thick" size={24} color="white" />
    </Pressable>
    <View className="flex flex-column gap-y-3 justify-center items-center">
      <Pressable className="bg-neutral-900 w-14 h-14 rounded-lg flex justify-center items-center">
        <Icon name="arrow-up-thick" size={24} color="white" />
      </Pressable>
      <Pressable className="bg-neutral-900 w-14 h-14 rounded-lg flex justify-center items-center">
        <Icon name="arrow-down-thick" size={24} color="white" />
      </Pressable>
    </View>

    <Pressable className="bg-neutral-900 w-14 h-14 rounded-lg flex justify-center items-center">
      <Icon name="arrow-right-thick" size={28} color="white" />
    </Pressable>
  </View>
);
