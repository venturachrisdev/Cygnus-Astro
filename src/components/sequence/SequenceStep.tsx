/* eslint-disable no-nested-ternary */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Animated, Text, View } from 'react-native';

import {
  getIconNameForStep,
  getParsedContainerName,
  getTextForStep,
} from '@/helpers/sequence';

interface SequenceStepProps {
  item: any;
  index: number;
  spinValue: any;
  transparent?: boolean;
}

export const SequenceStep = ({
  item,
  index,
  spinValue,
  transparent,
}: SequenceStepProps) => {
  return (
    <View
      key={index}
      className={`${
        transparent
          ? ''
          : item.Status === 'RUNNING'
          ? 'border-[0.5px] border-neutral-700 bg-neutral-950'
          : 'bg-neutral-900'
      } ${
        transparent ? '' : item.Status === 'FINISHED' ? 'bg-neutral-800' : ''
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
          <Animated.View style={{ transform: [{ rotate: spinValue }] }}>
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
