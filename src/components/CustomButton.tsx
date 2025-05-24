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
  color?: 'green' | 'red' | 'neutral' | 'yellow' | 'transparent';
}

export const CustomButton = ({
  disabled,
  onPress,
  label,
  icon,
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
      } flex flex-1 items-center justify-center rounded-lg p-3`}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      {!!label && (
        <Text
          className={`font-medium text-white ${
            textSize === 'large' ? 'text-lg' : 'text-sm'
          }`}
        >
          {label}
        </Text>
      )}
      {icon && <Icon name={icon as any} size={iconSize} color="white" />}
    </Pressable>
  );
};
