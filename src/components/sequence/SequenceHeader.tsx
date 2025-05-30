import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';

import { getParsedContainerName } from '@/helpers/sequence';

interface SequenceHeaderProps {
  icon: string;
  title: string;
}

export const SequenceHeader = ({ title, icon }: SequenceHeaderProps) => (
  <View className="flex flex-row items-center px-1 py-2">
    <Icon name={icon as any} size={20} color="white" />
    <Text className="ml-3 text-lg font-medium text-white">
      {getParsedContainerName(title)}
    </Text>
  </View>
);
