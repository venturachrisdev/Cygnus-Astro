/* eslint-disable no-nested-ternary */
/* eslint-disable tailwindcss/no-contradicting-classname */
/* eslint-disable tailwindcss/no-custom-classname */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

interface CircleButtonProps {
  disabled: boolean;
  onPress: () => void;
  icon: string;
  label?: string;
  color: 'red' | 'green' | 'neutral' | 'blue' | 'yellow' | 'transparent';
}

export const CircleButton = ({
  disabled,
  onPress,
  icon,
  label,
  color,
}: CircleButtonProps) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      className={`${pressed ? 'opacity-70' : ''} ${
        disabled
          ? `${color !== 'transparent' ? 'bg-neutral-700' : ''} opacity-40`
          : `${
              color === 'green'
                ? 'bg-green-800'
                : color === 'red'
                ? 'bg-red-800'
                : color === 'yellow'
                ? 'bg-yellow-800'
                : color === 'blue'
                ? 'bg-blue-800'
                : color === 'neutral'
                ? 'bg-neutral-800'
                : ''
            }`
      } ml-3 flex items-center justify-center rounded-full py-3 ${
        label ? 'px-5' : 'px-3'
      }`}
    >
      <Icon name={icon as any} size={32} color="white" />
      {!!label && (
        <Text className="text-xs font-medium text-white">{label}</Text>
      )}
    </Pressable>
  );
};
