import type { ImageResizeMode } from 'react-native';
import { ActivityIndicator, Image, Text } from 'react-native';

interface CameraImageProps {
  image: string | null;
  isLoading: boolean;
  defaultText: string;
  resizeMode?: ImageResizeMode;
  children?: React.ReactNode;
}

export const CameraImage = ({
  image,
  isLoading,
  defaultText,
  children,
  resizeMode = 'center',
}: CameraImageProps) => (
  <>
    {image && (
      <Image
        resizeMode={resizeMode}
        className="h-full w-full"
        source={{ uri: `data:image/jpeg;base64,${image}` }}
      />
    )}
    {!image && !isLoading && (
      <Text className="text-3xl font-bold text-gray-800">{defaultText}</Text>
    )}
    {isLoading && <ActivityIndicator size="large" className="absolute" />}
    {children}
  </>
);
