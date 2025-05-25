import { Pressable, ScrollView, Text } from 'react-native';

interface CameraDropDownProps {
  children: React.ReactNode[];
}

interface CameraDropDownItemProps {
  onPress: () => void;
  label: string;
  isActive: boolean;
}

export const CameraDropDown = ({ children }: CameraDropDownProps) => (
  <ScrollView
    style={{ zIndex: 99 }}
    contentContainerStyle={{ justifyContent: 'center', alignItems: 'center' }}
    className="absolute right-24 flex h-full w-24 bg-neutral-900 bg-opacity-50 py-6"
  >
    {children}
  </ScrollView>
);

export const CameraDropDownItem = ({
  onPress,
  label,
  isActive,
}: CameraDropDownItemProps) => (
  <Pressable className="mb-4 p-2" onPress={onPress}>
    <Text
      className={`${isActive ? 'text-yellow-500' : 'text-white'} font-bold`}
    >
      {label}
    </Text>
  </Pressable>
);
