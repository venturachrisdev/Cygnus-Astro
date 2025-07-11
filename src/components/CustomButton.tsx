/* eslint-disable tailwindcss/no-custom-classname */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { Pressable, Text } from 'react-native';

interface CustomButtonProps {
  disabled?: boolean;
  onPress: () => void;
  label?: string;
  icon?: string;
  iconSize?: number;
  textSize?: 'large' | 'medium';
  reverse?: boolean;
  color?: 'green' | 'red' | 'neutral' | 'yellow' | 'transparent';
}

export const CustomButton = ({
  disabled,
  onPress,
  label,
  icon,
  reverse,
  iconSize,
  textSize = 'large',
  color = 'green',
}: CustomButtonProps) => {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      disabled={disabled}
      className={`${pressed ? 'opacity-70' : ''} ${
        disabled ? 'bg-neutral-700 opacity-40' : `bg-${color}-800`
      } flex flex-1 ${
        reverse ? 'flex-row-reverse' : 'flex-row'
      } items-center justify-center rounded-lg p-3`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {icon && <Icon name={icon as any} size={iconSize} color="white" />}
      {!!label && (
        <Text
          className={`font-medium text-white ${
            textSize === 'large' ? 'text-lg' : 'text-sm'
          } ${icon && !reverse ? 'ml-2' : ''} ${icon && reverse ? 'mr-3' : ''}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
};
