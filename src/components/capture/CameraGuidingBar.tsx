import { View } from 'react-native';

interface CameraGuidingBarProps { }

export const CameraGuidingBar = ({ }: CameraGuidingBarProps) => (
  <View className="absolute bottom-16 left-0 right-0 opacity-70 h-28 w-100 px-5">
    <View className="bg-neutral-900 flex flex-1 rounded-2xl p-2 w-100">
      <View className="flex flex-1 border-[0.5px] border-gray-500 rounded-xl w-100 h-100">
      </View>
    </View>
  </View>
);
