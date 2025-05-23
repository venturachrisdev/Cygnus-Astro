import type React from 'react';
import { useEffect, useState } from 'react';
import type { ImageResizeMode } from 'react-native';
import { ActivityIndicator, Dimensions, Image, View } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

// import testImages from '@/components/capture/test-images.json';
// const imageKey = '2600V';

const CaptureBackgroundImage = require('../../../assets/capture3.png');

interface CameraImageProps {
  image: string | null;
  isLoading: boolean;
  resizeMode?: ImageResizeMode;
  children?: React.ReactNode;
  fullscreen?: boolean;
}

export const ZoomableCameraImage = ({
  image,
  isLoading,
  children,
  resizeMode = 'center',
  fullscreen,
}: CameraImageProps) => {
  const [width, setWidth] = useState<number>(500);
  const [height, setHeight] = useState<number>(500);

  useEffect(() => {
    if (image) {
      Image.getSize(
        `data:image/jpeg;base64,${image}`,
        (imageWidth, imageHeight) => {
          setWidth(imageWidth);
          setHeight(imageHeight);
        },
      );
    }
  }, [image]);

  const limitX = fullscreen
    ? Dimensions.get('screen').width
    : Dimensions.get('screen').width - 170;
  const limitY = fullscreen
    ? Dimensions.get('screen').height
    : Dimensions.get('screen').height - 70;

  let scaledWidth = width;
  let scaledHeight = height;
  const isPortrait = limitY > limitX;

  if (width > height || isPortrait) {
    scaledWidth = limitX;
    scaledHeight = height * (limitX / width);
  } else {
    scaledHeight = limitY;
    scaledWidth = width * (limitY / height);
  }

  return (
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
          cropWidth={Dimensions.get('window').width}
          cropHeight={Dimensions.get('window').height}
          imageHeight={scaledHeight}
          imageWidth={scaledWidth}
          minScale={1.0}
        >
          <Image
            resizeMode={resizeMode}
            className="h-full w-full"
            source={{ uri: `data:image/jpeg;base64,${image}` }}
            // source={{ uri: `data:image/jpeg;base64,${testImages[imageKey]}` }}
          />
        </ImageZoom>
      )}
      {isLoading && <ActivityIndicator size="large" className="absolute" />}
      {children}
    </View>
  );
};
