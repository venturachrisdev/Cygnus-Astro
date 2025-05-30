/* eslint-disable no-underscore-dangle */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import {
  getSequenceState,
  resetSequence,
  startSequence,
  stopSequence,
} from '@/actions/sequence';
import { CircleButton } from '@/components/CircleButton';
import { CustomButton } from '@/components/CustomButton';
import { SequenceContainer } from '@/components/sequence/SequenceContainer';
import { useConfigStore } from '@/stores/config.store';
import { useSequenceStore } from '@/stores/sequence.store';

export const Sequence = () => {
  const sequenceState = useSequenceStore();
  const configState = useConfigStore();
  const router = useRouter();

  useEffect(() => {
    getSequenceState();

    const interval = setInterval((_) => {
      getSequenceState();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  let hours = now.getHours();
  hours = hours < 12 ? hours + 12 : hours - 12;
  const minutes = now.getMinutes();
  const hourDate = hours + minutes / 60;

  return (
    <>
      <ScrollView
        bounces={false}
        className="flex h-full flex-1 bg-neutral-950 px-4"
      >
        <View className="flex w-full flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-white">Sequence</Text>
          <View>
            <CustomButton
              onPress={() => router.push('/target-search')}
              color="transparent"
              icon="star-shooting-outline"
              iconSize={28}
            />
          </View>
        </View>

        <View>
          {sequenceState.sequence.map((sequence: any, idx: number) => {
            if (!sequence.Status || !sequence.Name) {
              return null;
            }

            return (
              <SequenceContainer
                container={sequence}
                hourDate={hourDate}
                latitude={configState.config.astrometry.latitude}
                longitude={configState.config.astrometry.longitude}
                index={idx}
              />
            );
          })}
        </View>

        {sequenceState.sequence.length === 0 && (
          <View className="mt-20 flex h-full w-full flex-1 items-center justify-center">
            <Text className="w-full px-24 text-center text-gray-700">
              No sequence found. Make sure your sequence is loaded in N.I.N.A.
              Advance Sequencer and it contains a Deep Sky Object.
            </Text>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-5 right-5 flex flex-row items-center justify-end gap-x-3 p-3">
        {!sequenceState.isRunning && (
          <CircleButton
            disabled={!configState.isConnected}
            onPress={() => resetSequence()}
            color="blue"
            icon="refresh"
          />
        )}

        {!sequenceState.isRunning && (
          <CircleButton
            disabled={!configState.isConnected}
            onPress={() => startSequence()}
            color="green"
            icon="play"
          />
        )}

        {sequenceState.isRunning && (
          <CircleButton
            disabled={!configState.isConnected}
            onPress={() => stopSequence()}
            color="red"
            icon="stop"
          />
        )}
      </View>
    </>
  );
};
