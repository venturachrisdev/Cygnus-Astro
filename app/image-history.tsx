import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImageHistory } from '@/templates/ImageHistory';

const Page = () => (
  <SafeAreaView
    edges={['left', 'right', 'top']}
    style={{ backgroundColor: '#171717' }}
  >
    <View className="flex h-full flex-row justify-end">
      <ImageHistory />
    </View>
  </SafeAreaView>
);

export default Page;
