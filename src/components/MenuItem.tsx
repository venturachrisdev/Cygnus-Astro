import {  Pressable } from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';

interface MenuItemProps {
  icon: string;
  isActive: boolean;
  onPress: () => void;
  size: number;
  direction?: "horizontal" | "vertical";
}


export const MenuItem = ({ icon, isActive, onPress, size, direction }: MenuItemProps) => (
  <Pressable onPress={onPress} className={direction === "horizontal" ? "ml-6" : "mb-6"}>
    <Icon name={icon as any} size={size} color={isActive ? "green" : "gray"} />
  </Pressable>
);
