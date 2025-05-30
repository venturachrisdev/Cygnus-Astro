import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Animated, Easing, Text, View } from 'react-native';

import {
  getIconNameForStep,
  getParsedContainerName,
  getTextForStep,
} from '@/helpers/sequence';

interface SequenceStepProps {
  item: any;
  index: number;
}

export const SequenceStep = ({ item, index }: SequenceStepProps) => {
  const spinValue = new Animated.Value(0);
  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 1200,
      easing: Easing.linear,
      useNativeDriver: true,
    }),
  ).start();

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View
      key={index}
      className={`${
        item.Status === 'RUNNING'
          ? 'border-[0.5px] border-neutral-700 bg-neutral-950'
          : 'bg-neutral-900'
      } ${
        item.Status === 'FINISHED' ? 'bg-neutral-800' : ''
      } my-[2px] flex flex-row items-center justify-between rounded-lg px-4 py-2`}
    >
      <View className="my-1 flex flex-row items-center">
        <View className="mr-3">
          <Icon name={getIconNameForStep(item.Name)} size={24} color="gray" />
        </View>
        <View>
          <Text className="mb-1 font-semibold text-white">
            {getParsedContainerName(item.Name)}
          </Text>
          {!!getTextForStep(item) && (
            <Text className="text-gray-500">{getTextForStep(item)}</Text>
          )}
        </View>
      </View>

      <View>
        {item.Status === 'RUNNING' && (
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <Icon name="loading" size={20} color="white" />
          </Animated.View>
        )}
        {item.Status === 'CREATED' && <View className="px-2" />}
        {item.Status === 'FINISHED' && (
          <Icon name="check-outline" size={16} color="white" />
        )}
        {item.Status === 'SKIPPED' && (
          <Icon name="chevron-double-right" size={20} color="white" />
        )}
        {item.Status === 'FAILED' && (
          <Icon name="close-circle" size={20} color="#a71914" />
        )}
      </View>
    </View>
  );
};
