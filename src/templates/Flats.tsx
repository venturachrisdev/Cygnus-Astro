import { useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import {
  getFlatsStatus,
  startAutoBrightnessFlats,
  startAutoExposureFlats,
  startSkyFlats,
  startTrainedDarkFlat,
  startTrainedFlat,
  stopFlats,
} from '@/actions/flats';
import { LabelSwitch } from '@/components/capture/LabelSwitch';
import { CustomButton } from '@/components/CustomButton';
import { TextInputLabel } from '@/components/TextInputLabel';
import { useConfigStore } from '@/stores/config.store';
import type { FlatsMode } from '@/stores/flats.store';
import { useFlatsStore } from '@/stores/flats.store';

type NumericField =
  | 'count'
  | 'minExposure'
  | 'maxExposure'
  | 'histogramMean'
  | 'meanTolerance'
  | 'brightness'
  | 'minBrightness'
  | 'maxBrightness'
  | 'exposureTime'
  | 'filterId';

const MODE_OPTIONS: { key: FlatsMode; label: string }[] = [
  { key: 'auto-exposure', label: 'Auto Exposure' },
  { key: 'auto-brightness', label: 'Auto Brightness' },
  { key: 'skyflat', label: 'Sky Flat' },
  { key: 'trained-flat', label: 'Trained' },
  { key: 'trained-dark-flat', label: 'Trained Dark' },
];

const FIELD_LABELS: Record<NumericField, string> = {
  count: 'Count',
  minExposure: 'Min exposure (s)',
  maxExposure: 'Max exposure (s)',
  histogramMean: 'Target ADU (%)',
  meanTolerance: 'Tolerance (%)',
  brightness: 'Panel brightness',
  minBrightness: 'Min brightness',
  maxBrightness: 'Max brightness',
  exposureTime: 'Exposure time (s)',
  filterId: 'Filter ID',
};

const MODE_FIELDS: Record<FlatsMode, NumericField[]> = {
  'auto-exposure': [
    'count',
    'brightness',
    'minExposure',
    'maxExposure',
    'histogramMean',
    'meanTolerance',
    'filterId',
  ],
  'auto-brightness': [
    'count',
    'minBrightness',
    'maxBrightness',
    'exposureTime',
    'histogramMean',
    'meanTolerance',
    'filterId',
  ],
  skyflat: [
    'count',
    'minExposure',
    'maxExposure',
    'histogramMean',
    'meanTolerance',
    'filterId',
  ],
  'trained-flat': ['count', 'filterId'],
  'trained-dark-flat': ['count', 'filterId'],
};

/* Empty string means "leave to the trained profile default", so omit it. */
const toNumber = (value: string) =>
  value.trim() === '' ? undefined : Number(value);

export const Flats = () => {
  const flatsState = useFlatsStore();
  const configState = useConfigStore();

  useEffect(() => {
    if (useConfigStore.getState().isConnected) {
      getFlatsStatus();
    }

    const interval = setInterval((_) => {
      if (
        useConfigStore.getState().isConnected &&
        useFlatsStore.getState().isRunning
      ) {
        getFlatsStatus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStart = () => {
    const s = useFlatsStore.getState();
    const count = toNumber(s.count);
    const filterId = toNumber(s.filterId);
    const binning = s.binning.trim() === '' ? undefined : s.binning.trim();
    const histogramMean = toNumber(s.histogramMean);
    const meanTolerance = toNumber(s.meanTolerance);

    if (s.mode === 'auto-exposure') {
      startAutoExposureFlats({
        count,
        filterId,
        binning,
        histogramMean,
        meanTolerance,
        brightness: toNumber(s.brightness),
        minExposure: toNumber(s.minExposure),
        maxExposure: toNumber(s.maxExposure),
        keepClosed: s.keepClosed,
      });
    } else if (s.mode === 'auto-brightness') {
      startAutoBrightnessFlats({
        count,
        filterId,
        binning,
        histogramMean,
        meanTolerance,
        minBrightness: toNumber(s.minBrightness),
        maxBrightness: toNumber(s.maxBrightness),
        exposureTime: toNumber(s.exposureTime),
        keepClosed: s.keepClosed,
      });
    } else if (s.mode === 'skyflat') {
      startSkyFlats({
        count,
        filterId,
        binning,
        histogramMean,
        meanTolerance,
        minExposure: toNumber(s.minExposure),
        maxExposure: toNumber(s.maxExposure),
        dither: s.dither,
      });
    } else if (s.mode === 'trained-flat') {
      startTrainedFlat({ count, filterId, binning, keepClosed: s.keepClosed });
    } else {
      startTrainedDarkFlat({
        count,
        filterId,
        binning,
        keepClosed: s.keepClosed,
      });
    }
  };

  const canStart = configState.isConnected && !flatsState.isRunning;

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <Text className="mt-3 text-lg font-semibold text-white">
        Automated Flats
      </Text>

      <View className="mt-4 flex flex-row flex-wrap gap-2">
        {MODE_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            disabled={flatsState.isRunning}
            onPress={() => flatsState.set({ mode: option.key })}
            className={`${
              flatsState.mode === option.key ? 'bg-green-800' : 'bg-neutral-900'
            } rounded-lg px-4 py-2`}
          >
            <Text className="text-sm font-medium text-white">
              {option.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View className="mt-4 flex flex-row flex-wrap">
        {MODE_FIELDS[flatsState.mode].map((field) => (
          <View key={field} className="m-2 w-64">
            <TextInputLabel
              label={FIELD_LABELS[field]}
              placeholder="default"
              value={flatsState[field]}
              disabled={flatsState.isRunning}
              onChange={(value) =>
                flatsState.set({ [field]: value } as Partial<
                  ReturnType<typeof useFlatsStore.getState>
                >)
              }
            />
          </View>
        ))}
        <View className="m-2 w-64">
          <TextInputLabel
            label="Binning"
            placeholder="e.g. 1x1"
            value={flatsState.binning}
            disabled={flatsState.isRunning}
            onChange={(value) => flatsState.set({ binning: value })}
          />
        </View>
      </View>

      <View className="ml-2 flex flex-row gap-x-12">
        {flatsState.mode === 'skyflat' && (
          <LabelSwitch
            label="Dither"
            value={flatsState.dither}
            disabled={flatsState.isRunning}
            onChange={(value) => flatsState.set({ dither: value })}
          />
        )}
        {flatsState.mode !== 'skyflat' && (
          <LabelSwitch
            label="Keep panel closed"
            value={flatsState.keepClosed}
            disabled={flatsState.isRunning}
            onChange={(value) => flatsState.set({ keepClosed: value })}
          />
        )}
      </View>

      {flatsState.isRunning && (
        <View className="mx-2 mt-8 flex flex-row items-center rounded-xl bg-neutral-900 p-4">
          <Text className="text-base font-medium text-white">
            {flatsState.state || 'Running'}
          </Text>
          <Text className="ml-4 text-base font-light text-white">
            {flatsState.completedIterations < 0
              ? 0
              : flatsState.completedIterations}{' '}
            / {flatsState.totalIterations < 0 ? 0 : flatsState.totalIterations}
          </Text>
        </View>
      )}

      <View className="mx-2 my-8 flex flex-row items-center justify-between gap-x-4">
        <View className="flex-1">
          <CustomButton
            disabled={!canStart}
            onPress={handleStart}
            label="Start Flats"
            icon="play"
          />
        </View>
        <View className="flex-1">
          <CustomButton
            disabled={!flatsState.isRunning}
            onPress={() => stopFlats()}
            label="Stop"
            color="red"
            icon="stop"
          />
        </View>
      </View>

      <View className="h-32" />
    </ScrollView>
  );
};
