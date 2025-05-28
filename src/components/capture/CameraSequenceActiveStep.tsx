import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

interface CameraSequenceActiveStepProps {
  sequence: any;
}

export const CameraSequenceActiveStep = ({
  sequence,
}: CameraSequenceActiveStepProps) => {
  return (
    <View className="absolute top-5 min-w-[220px] rounded-lg bg-neutral-900 p-3 opacity-60">
      <View className="flex flex-row items-center gap-x-2">
        <Icon name="loading" size={20} color="#ccc" />
        <View>
          <Text className="font-medium text-gray-400">Take Exposure</Text>
          <Text className="text-xs font-medium text-gray-600">300s</Text>
        </View>
      </View>
    </View>
  );
};
