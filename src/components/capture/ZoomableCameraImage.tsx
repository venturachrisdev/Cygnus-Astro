import type React from 'react';
import type { ImageResizeMode } from 'react-native';
import { ActivityIndicator, Image, View } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

const CaptureBackgroundImage = require('../../../assets/capture3.png');

interface CameraImageProps {
  image: string | null;
  isLoading: boolean;
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
  children,
  cropHeight = 345,
  cropWidth = 345,
  height = 345,
  width,
  resizeMode = 'center',
}: CameraImageProps) => (
  <View className="flex h-full w-full items-center justify-center overflow-hidden">
    {!image && !isLoading && (
      <View>
        <Image
          className="opacity-70"
          resizeMode="contain"
          style={{ flex: 1 }}
          source={CaptureBackgroundImage}
        />
      </View>
    )}
    {!!image && (
      <ImageZoom
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        imageHeight={height}
        imageWidth={width}
        minScale={1.0}
      >
        <Image
          resizeMode={resizeMode}
          className="h-full w-full"
          source={{ uri: `data:image/jpeg;base64,${image}` }}
        />
      </ImageZoom>
    )}
    {isLoading && <ActivityIndicator size="large" className="absolute" />}
    {children}
  </View>
);
