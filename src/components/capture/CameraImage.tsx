import { Text, ActivityIndicator, Image } from 'react-native';

interface CameraImageProps {
  image: string | null;
  isLoading: boolean;
  defaultText: string;
}

export const CameraImage = ({ image, isLoading, defaultText }: CameraImageProps) => (
  <>
    {image && (
      <Image resizeMode="center" className="h-full w-full" source={{ uri: `data:image/jpeg;base64,${image}` }}></Image>
    )}
    {!image && !isLoading && (
      <Text className='text-gray-800 font-bold text-3xl'>{defaultText}</Text>
    )}
    {
      isLoading && (
        <ActivityIndicator size="large" className="absolute" />
      )
    }
  </>
);
