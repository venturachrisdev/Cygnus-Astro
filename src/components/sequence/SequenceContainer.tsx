import { View } from 'react-native';

import { filterOutEmptyStep } from '@/helpers/sequence';

import { SequenceHeader } from './SequenceHeader';
import { SequenceStep } from './SequenceStep';
import { SequenceTarget } from './SequenceTarget';

interface SequenceContainerProps {
  container: any;
  longitude: number;
  latitude: number;
  hourDate: number;
  index: number;
  spinValue: any;
}

export const SequenceContainer = ({
  container,
  index,
  longitude,
  latitude,
  hourDate,
  spinValue,
}: SequenceContainerProps) => {
  const hasChildren =
    container.Triggers || container.Conditions || container.Items;

  return (
    <>
      {((!hasChildren && container.Name) ||
        container.Name === 'Take Many Exposures_Container' ||
        container.Name === 'Smart Exposure_Container') && (
        <SequenceStep item={container} index={index} spinValue={spinValue} />
      )}
      {hasChildren &&
        container.Name &&
        container.Name !== 'Take Many Exposures_Container' &&
        container.Name !== 'Smart Exposure_Container' && (
          <View key={index} className="my-1 rounded-lg">
            {!!container.Target && (
              <SequenceTarget
                container={container}
                hourDate={hourDate}
                longitude={longitude}
                latitude={latitude}
              />
            )}
            {container.Triggers?.filter(filterOutEmptyStep).length > 0 && (
              <View className="p-2">
                <SequenceHeader icon="weather-lightning" title="Triggers" />
                <View className="ml-2">
                  {container.Triggers?.filter(filterOutEmptyStep).map(
                    (item: any, idx: number) => (
                      <SequenceContainer
                        container={item}
                        hourDate={hourDate}
                        latitude={latitude}
                        longitude={longitude}
                        index={idx}
                        spinValue={spinValue}
                      />
                    ),
                  )}
                </View>
              </View>
            )}
            {container.Conditions?.filter(filterOutEmptyStep)?.length > 0 &&
              container.Name !== 'Take Many Exposures_Container' && (
                <View className="p-2">
                  <SequenceHeader icon="rotate-right" title="Loop Conditions" />
                  <View className="ml-2">
                    {container.Conditions?.filter(filterOutEmptyStep).map(
                      (item: any, idx: number) => (
                        <SequenceContainer
                          container={item}
                          hourDate={hourDate}
                          latitude={latitude}
                          longitude={longitude}
                          index={idx}
                          spinValue={spinValue}
                        />
                      ),
                    )}
                  </View>
                </View>
              )}
            {container.Items?.length > 0 &&
              container.Name !== 'Take Many Exposures_Container' && (
                <View className="p-2">
                  <SequenceHeader icon="chevron-right" title={container.Name} />
                  <View className="ml-2">
                    {container.Items?.filter(filterOutEmptyStep).map(
                      (item: any, idx: number) => (
                        <SequenceContainer
                          container={item}
                          hourDate={hourDate}
                          latitude={latitude}
                          longitude={longitude}
                          spinValue={spinValue}
                          index={idx}
                        />
                      ),
                    )}
                  </View>
                </View>
              )}
          </View>
        )}
    </>
  );
};
