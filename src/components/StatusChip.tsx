import React from 'react';
import { View, Text } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface StatusChipProps {
  label: string;
  isActive: boolean;
  last?: boolean;
}

export const StatusChip = ({ label, isActive, last }: StatusChipProps) => (
  <View className={`rounded-xl bg-neutral-900 py-1 px-4 h-8 flex justify-center items-center flex-row gap-x-1 ${last ?? "mr-4"}`}>
    <Text className="text-white font-medium text-xs">{label}</Text>
    <Icon name="brightness-1" size={10} color={isActive ? "green" : "red"} />
  </View>
);
