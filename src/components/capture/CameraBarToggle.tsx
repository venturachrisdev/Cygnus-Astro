import React, { ReactNode } from 'react';
import { View } from 'react-native';

interface CameraBarToggleProps {
  children: ReactNode[];
}

export const CameraBarToggle = ({ children }: CameraBarToggleProps) => (
  <View className="bg-neutral-900 flex flex-row justify-end py-3 px-8">
    {children}
  </View>
);
