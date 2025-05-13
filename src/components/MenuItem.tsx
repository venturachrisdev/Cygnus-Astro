/* eslint-disable no-nested-ternary */
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Pressable } from 'react-native';

interface MenuItemProps {
  icon: string;
  isActive: boolean;
  onPress: () => void;
  size: number;
  direction?: 'horizontal' | 'vertical';
  disabled?: boolean;
}

export const MenuItem = ({
  icon,
  isActive,
  onPress,
  size,
  direction,
  disabled,
}: MenuItemProps) => (
  <Pressable
    onPress={() => {
      if (!disabled) onPress();
    }}
    className={`${direction === 'horizontal' ? 'ml-6' : 'mb-6'} ${
      disabled ? 'opacity-30' : ''
    }`}
  >
    <Icon
      name={icon as any}
      size={size}
      color={disabled ? 'gray' : isActive ? 'green' : 'gray'}
    />
  </Pressable>
);
