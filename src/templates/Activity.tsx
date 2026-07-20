import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { fetchEventHistory } from '@/actions/events';
import { useConfigStore } from '@/stores/config.store';
import type { ActivityEvent } from '@/stores/events.store';
import { useEventsStore } from '@/stores/events.store';

export const Activity = () => {
  const eventsState = useEventsStore();

  useEffect(() => {
    if (useConfigStore.getState().isConnected) {
      fetchEventHistory();
    }
  }, []);

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <Text className="mb-4 text-xl font-semibold text-white">Activity</Text>

      {eventsState.events.length === 0 && (
        <View className="mt-20 flex h-full w-full flex-1 items-center justify-center">
          <Text className="w-full px-24 text-center text-gray-700">
            Activity from N.I.N.A. will appear here as it happens.
          </Text>
        </View>
      )}

      {eventsState.events.map((item: ActivityEvent) => (
        <View
          key={item.id}
          className="mb-2 flex w-full flex-row items-center justify-between rounded-lg bg-neutral-900 px-4 py-3"
        >
          <Text className="text-sm font-medium text-white">{item.label}</Text>
          <Text className="text-xs text-gray-500">
            {new Date(item.time).toLocaleTimeString()}
          </Text>
        </View>
      ))}

      <View className="h-32" />
    </ScrollView>
  );
};
