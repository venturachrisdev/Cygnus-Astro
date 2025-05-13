import type { ReactNode } from 'react';
import { View } from 'react-native';

interface CameraBarToggleProps {
  children: ReactNode[];
}

export const CameraBarToggle = ({ children }: CameraBarToggleProps) => (
  <View
    className="flex flex-row items-center justify-between bg-neutral-900 px-8 py-3"
    style={{ zIndex: 99 }}
  >
    {children}
  </View>
);
