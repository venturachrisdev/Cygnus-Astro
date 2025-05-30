import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { Text, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { getAltitudePoints } from '@/helpers/sequence';

interface SequenceTargetProps {
  container: any;
  longitude: number;
  latitude: number;
  hourDate: number;
}

export const SequenceTarget = ({
  container,
  longitude,
  latitude,
  hourDate,
}: SequenceTargetProps) => {
  return (
    <View className="flex flex-row justify-between rounded-xl border-[0.5px] border-gray-800 px-2 py-4">
      <View>
        <View className="mb-4 flex flex-row items-center px-1">
          <Icon name="target" size={20} color="white" />
          <Text className="ml-3 text-xl font-medium text-white">
            {(container.Target.TargetName || 'Target').substr(0, 15)}
            {container.Target.TargetName?.length > 18 ? '...' : ''}
          </Text>
        </View>
        <View className="ml-2">
          <Text className="text-lg text-gray-500">
            RA:{'     '}
            <Text className="text-white">
              {container.Target.InputCoordinates.RAHours}h{' '}
              {container.Target.InputCoordinates.RAMinutes}m{' '}
              {Math.floor(container.Target.InputCoordinates.RASeconds)}s
            </Text>
          </Text>
          <Text className="text-lg text-gray-500">
            Dec:{'   '}
            <Text className="text-white">
              {container.Target.InputCoordinates.DecDegrees}°{' '}
              {String(container.Target.InputCoordinates.DecMinutes).padStart(
                2,
                '0',
              )}
              m {Math.floor(container.Target.InputCoordinates.DecSeconds)}s
            </Text>
          </Text>
        </View>
      </View>
      <View className="mr-6">
        <LineChart
          curved
          width={350}
          height={70}
          adjustToWidth
          maxValue={90}
          hideYAxisText
          hideAxesAndRules
          showVerticalLines
          noOfVerticalLines={1}
          verticalLinesSpacing={0}
          verticalLinesThickness={1}
          verticalLinesShift={hourDate * 15}
          verticalLinesStrokeDashArray={[6]}
          verticalLinesColor="#88ad75"
          yAxisThickness={0}
          showReferenceLine1
          stepValue={1}
          xAxisLabelTexts={[
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
            '18',
            '19',
            '20',
            '21',
            '22',
            '23',
            '00',
            '01',
            '02',
            '03',
            '04',
            '05',
            '06',
            '07',
            '08',
            '09',
            '10',
            '11',
          ]}
          xAxisLabelTextStyle={{
            color: '#aaa',
            fontSize: 7,
          }}
          referenceLine1Position={-65}
          referenceLine1Config={{
            thickness: 1,
            width: 350,
            dashWidth: 5,
            dashGap: 0,
            color: 'gray',
            labelText: '30°',
            labelTextStyle: {
              color: '#aaa',
              fontSize: 7,
              marginTop: -12,
            },
          }}
          xAxisColor="white"
          yAxisColor="white"
          dataPointsRadius1={0}
          mostNegativeValue={0}
          color1="#e77"
          dataPointsColor1="white"
          data={getAltitudePoints(
            {
              ra: `${container.Target.InputCoordinates.RAHours}:${container.Target.InputCoordinates.RAMinutes}:${container.Target.InputCoordinates.RASeconds}`,
              dec: `${container.Target.InputCoordinates.DecDegrees}:${container.Target.InputCoordinates.DecMinutes}:${container.Target.InputCoordinates.DecSeconds}`,
            },
            longitude,
            latitude,
          ).map((i) => ({ value: i }))}
        />
      </View>
    </View>
  );
};
