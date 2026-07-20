/* eslint-disable no-underscore-dangle */
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import {
  getSequenceState,
  listAvailableSequences,
  loadSequence,
  resetSequence,
  skipSequence,
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
  const [showLoadSequenceModal, setShowLoadSequenceModal] = useState(false);
  const spinValue = useRef(new Animated.Value(0)).current;
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    if (useConfigStore.getState().isConnected) {
      getSequenceState();
    }

    const interval = setInterval((_) => {
      if (useConfigStore.getState().isConnected) {
        getSequenceState();
      }
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
        <View className="flex w-full flex-row items-center justify-between pt-2">
          <Text className="text-xl font-semibold text-white">Sequence</Text>
          <View className="flex flex-row items-center gap-x-3">
            <CustomButton
              onPress={() => {
                setShowLoadSequenceModal(true);
                listAvailableSequences();
              }}
              disabled={!configState.isConnected}
              color="transparent"
              label="Load"
              icon="folder-open-outline"
              iconSize={18}
              textSize="medium"
              reverse
            />
            <CustomButton
              onPress={() => router.push('/target-search')}
              color="transparent"
              label="Targets"
              icon="star-shooting-outline"
              iconSize={24}
              reverse
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
                spinValue={spin}
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

        <CircleButton
          disabled={!sequenceState.isRunning}
          onPress={() => skipSequence('CurrentItems')}
          color="yellow"
          icon="skip-next"
        />
      </View>

      <Modal
        visible={showLoadSequenceModal}
        transparent
        supportedOrientations={['landscape']}
      >
        <View className="absolute h-full w-full bg-black opacity-90">
          <View className="flex flex-1 items-center justify-center">
            <View className="flex max-h-[80%] w-96 rounded-lg bg-neutral-900 p-5">
              <View className="flex w-full flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-white">
                  Load Sequence
                </Text>
                <CustomButton
                  onPress={() => setShowLoadSequenceModal(false)}
                  color="transparent"
                  icon="close"
                  iconSize={20}
                />
              </View>

              {sequenceState.availableSequences.length === 0 && (
                <Text className="mt-6 text-center text-gray-600">
                  No saved sequences found.
                </Text>
              )}

              {sequenceState.availableSequences.length > 0 && (
                <ScrollView className="mt-4">
                  {sequenceState.availableSequences.map((name) => (
                    <Pressable
                      key={name}
                      onPress={async () => {
                        await loadSequence(name);
                        setShowLoadSequenceModal(false);
                      }}
                      className="px-3 py-4"
                    >
                      <Text className="font-medium text-white">{name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
