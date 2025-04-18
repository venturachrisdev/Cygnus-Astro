import { MenuItem } from '@/components/MenuItem';
import { View } from 'react-native';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => (
  <View className="flex flex-row justify-end h-full">
    <View className="bg-neutral-900 h-full w-20 flex flex-column justify-between items-center py-6">
      <MenuItem direction="vertical" size={28} icon="telescope" onPress={() => { }} isActive={false}></MenuItem>
      <MenuItem direction="vertical" size={28} icon="camera" onPress={() => { }} isActive={false}></MenuItem>
      <MenuItem direction="vertical" size={28} icon="image-filter-center-focus" onPress={() => { }} isActive={false}></MenuItem>
      <MenuItem direction="vertical" size={28} icon="camera-iris" onPress={() => { }} isActive={true}></MenuItem>
      <MenuItem direction="vertical" size={28} icon="target" onPress={() => { }} isActive={false}></MenuItem>
      <MenuItem direction="vertical" size={28} icon="format-list-numbered" onPress={() => { }} isActive={false}></MenuItem>
      <MenuItem direction="vertical" size={28} icon="cog" onPress={() => { }} isActive={false}></MenuItem>
    </View>
    <View className="h-full flex flex-1 flex-row justify-end">
      {children}
    </View>
  </View>
);
