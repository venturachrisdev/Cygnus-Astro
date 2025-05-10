import type React from 'react';
import type { ImageResizeMode } from 'react-native';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

interface CameraImageProps {
  image: string | null;
  isLoading: boolean;
  defaultText: string;
  resizeMode?: ImageResizeMode;
  children?: React.ReactNode;
  cropHeight?: number | null;
  cropWidth?: number | null;
  height?: number | null;
  width?: number | null;
}

// Dimensions.get('window').width

export const ZoomableCameraImage = ({
  image,
  isLoading,
  defaultText,
  children,
  cropHeight = 345,
  cropWidth = 345,
  height = 345,
  width,
  resizeMode = 'center',
}: CameraImageProps) => (
  <View className="flex items-center justify-center overflow-hidden">
    {!!image && (
      <ImageZoom
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        imageHeight={width}
        imageWidth={height}
        minScale={1.0}
      >
        <Image
          resizeMode={resizeMode}
          className="h-full w-full"
          source={{ uri: `data:image/jpeg;base64,${image}` }}
        />
      </ImageZoom>
    )}
    {!image && !isLoading && (
      <Text className="text-3xl font-bold text-gray-800">{defaultText}</Text>
    )}
    {isLoading && <ActivityIndicator size="large" className="absolute" />}
    {children}
  </View>
);
