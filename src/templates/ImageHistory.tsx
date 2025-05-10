import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { chunk } from 'lodash';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { getFullImageByIndex, getImageHistory } from '@/actions/sequence';
import { CameraImage } from '@/components/capture/CameraImage';
import { ZoomableCameraImage } from '@/components/capture/ZoomableCameraImage';
import { CustomButton } from '@/components/CustomButton';
import type { ImageDetails } from '@/stores/sequence.store';
import { useSequenceStore } from '@/stores/sequence.store';

export const ImageHistory = () => {
  const router = useRouter();
  const sequenceState = useSequenceStore();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isImageLoading, setImageLoading] = useState<boolean>(false);
  const [imageResult, setImageResult] = useState<string | null>(null);

  useEffect(() => {
    getImageHistory();

    const interval = setInterval(() => {
      const fn = async () => {
        const oldImagesCount = sequenceState.images.length;
        const newImages = await getImageHistory(false);

        if (newImages.length > oldImagesCount) {
          await getImageHistory();
        }
      };

      fn();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const action = async () => {
      setImageLoading(true);

      const result = await getFullImageByIndex(selectedImage!);
      setImageResult(result);

      setImageLoading(false);
    };

    if (Number.isInteger(selectedImage)) {
      action();
    }
  }, [selectedImage]);

  const { width } = Dimensions.get('window');
  const images = sequenceState.images.filter((img) => img.image);
  const gridItems = chunk(images, width >= 1180 ? 5 : 3);

  return (
    <>
      {Number.isInteger(selectedImage) && (
        <Modal
          transparent
          supportedOrientations={['landscape']}
          visible={Number.isInteger(selectedImage)}
        >
          <View className="flex h-full w-full flex-1 items-center justify-center">
            <Pressable
              style={{ zIndex: 99 }}
              onPress={() => {
                setSelectedImage(null);
                setImageResult(null);
              }}
              className="absolute right-5 top-5 p-4"
            >
              <Icon name="close" size={32} color="white" />
            </Pressable>
            {!!imageResult && (
              <ZoomableCameraImage
                width={Dimensions.get('window').width}
                height={Dimensions.get('window').height}
                cropHeight={Dimensions.get('window').height}
                cropWidth={Dimensions.get('window').width}
                image={imageResult}
                isLoading={false}
                defaultText=""
              />
            )}
            {isImageLoading && (
              <ActivityIndicator size="large" className="absolute" />
            )}
            <View
              className="absolute h-full w-full bg-black opacity-80"
              style={{ zIndex: -1 }}
            />
          </View>
        </Modal>
      )}
      <ScrollView className="flex h-full flex-1 bg-neutral-950 px-4">
        <View className="flex w-full flex-row items-center">
          <View className="w-12">
            <CustomButton
              onPress={() => router.back()}
              color="transparent"
              icon="arrow-left"
              iconSize={24}
            />
          </View>
          <Text className="ml-2 text-xl font-medium text-white">
            Image History
          </Text>
        </View>
        {gridItems.length === 0 && (
          <View className="flex h-72 flex-1 items-center justify-center">
            <Text className="text-sm font-medium text-gray-700">
              Sequence images will appear here...
            </Text>
          </View>
        )}
        <View className="flex justify-center">
          {gridItems.length > 0 &&
            gridItems.map((grid: ImageDetails[], i: number) => (
              <View key={i} className="flex w-24 flex-row gap-x-4">
                {grid.map((item: ImageDetails) => (
                  <Pressable
                    key={item.index}
                    onPress={() => setSelectedImage(item.index)}
                    className="mt-4 h-48 w-48 rounded-lg border-2 border-neutral-600 bg-gray-900"
                  >
                    <View className="flex h-full w-full flex-1 items-center justify-center">
                      <CameraImage
                        image={item.image}
                        isLoading={!item.image}
                        defaultText=""
                      />
                    </View>
                    <View className="absolute left-2 top-2">
                      <Text className="text-sm font-medium text-white">
                        {item.filter}
                      </Text>
                    </View>
                    <View className="absolute right-2 top-2">
                      <Text className="text-sm font-medium text-white">
                        {item.duration}s
                      </Text>
                    </View>
                    <View className="absolute inset-x-0 bottom-2 w-full px-2">
                      <Text className="text-sm text-white">
                        {item.date?.substring(0, 19)?.replace('T', ' ')}
                      </Text>
                      <View className="mt-1 flex w-full flex-row items-center justify-between">
                        <Text className="text-sm text-white">
                          Mean:{' '}
                          <Text className="font-medium">
                            {item.mean?.toPrecision(5)}
                          </Text>
                        </Text>
                        <Text className="text-sm text-white">
                          HFR:{' '}
                          <Text className="font-medium">
                            {item.hfr?.toPrecision(3)}
                          </Text>
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            ))}
        </View>
      </ScrollView>
    </>
  );
};
