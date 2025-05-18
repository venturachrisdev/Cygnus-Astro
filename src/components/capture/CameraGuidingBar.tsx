import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import type { RMSError, RMSGraph } from '@/stores/guider.store';

interface GuidingBarProps {
  graph: RMSGraph[];
  error: RMSError | null;
}

export const CameraGuidingBar = ({ graph, error }: GuidingBarProps) => (
  <View className="absolute inset-x-0 bottom-6 h-36 w-full max-w-[580px] px-5 opacity-70">
    <View className="flex w-full flex-1 rounded-2xl bg-neutral-900 p-2">
      <View className="mb-2 flex flex-row gap-x-4">
        <Text className="ml-2 text-xs text-white">
          RA:{' '}
          <Text className="font-medium">
            {error?.RA?.pixels?.toPrecision(2)} (
            {error?.RA?.arcseconds?.toPrecision(2)}'')
          </Text>
        </Text>
        <Text className="text-xs text-white">
          Dec:{' '}
          <Text className="font-medium">
            {error?.Dec?.pixels?.toPrecision(2)} (
            {error?.Dec?.arcseconds?.toPrecision(2)}'')
          </Text>
        </Text>
        <Text className="text-xs text-white">
          Total:{' '}
          <Text className="font-medium">
            {error?.total?.pixels?.toPrecision(2)} (
            {error?.total?.arcseconds?.toPrecision(2)}'')
          </Text>
        </Text>
      </View>
      <View className="flex h-full w-full flex-1 rounded-xl border-[0.5px] border-gray-500 py-3">
        <LineChart
          disableScroll
          width={455}
          height={37}
          adjustToWidth
          formatYLabel={(l) => String(Math.ceil(Number(l)))}
          yAxisTextStyle={{
            color: '#ddd',
            fontSize: 12,
          }}
          maxValue={2}
          stepValue={1}
          mostNegativeValue={-2}
          secondaryYAxis={{
            stepValue: 1,
            maxValue: 2,
            mostNegativeValue: -2,
            hideYAxisText: true,
          }}
          yAxisThickness={0}
          xAxisColor="white"
          yAxisColor="white"
          dataPointsRadius1={0}
          color1="blue"
          dataPointsColor1="white"
          data={graph.map((g) => ({ value: g.raDistance }))}
          secondaryLineConfig={{
            color: 'red',
          }}
          secondaryData={graph.map((g) => ({
            value: g.decDistance,
          }))}
        />
      </View>
    </View>
  </View>
);
