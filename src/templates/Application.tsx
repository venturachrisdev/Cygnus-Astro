import { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { getLogs, getNinaVersion, getScreenshot } from '@/actions/application';
import { ZoomableCameraImage } from '@/components/capture/ZoomableCameraImage';
import { CustomButton } from '@/components/CustomButton';
import { useApplicationStore } from '@/stores/application.store';
import { useConfigStore } from '@/stores/config.store';

const LOG_LEVEL_COLOR: Record<string, string> = {
  ERROR: 'text-red-400',
  WARNING: 'text-yellow-400',
  INFO: 'text-sky-300',
  DEBUG: 'text-gray-400',
};

export const Application = () => {
  const applicationState = useApplicationStore();
  const configState = useConfigStore();

  useEffect(() => {
    if (useConfigStore.getState().isConnected) {
      getNinaVersion();
      getLogs();
    }
  }, []);

  const { isConnected } = configState;

  return (
    <ScrollView
      bounces={false}
      className="flex h-full flex-1 bg-neutral-950 p-4"
    >
      <View className="mb-4 flex flex-row items-center justify-between">
        <Text className="text-lg font-semibold text-white">
          Application Control
        </Text>
        <Text className="text-sm text-gray-500">
          N.I.N.A. Version:{' '}
          <Text className="font-bold text-white">
            {applicationState.ninaVersion ?? 'Unknown'}
          </Text>
        </Text>
      </View>

      <View className="h-96 overflow-hidden rounded-lg bg-black">
        <ZoomableCameraImage
          image={applicationState.screenshot}
          isLoading={applicationState.isScreenshotLoading}
          resizeMode="contain"
        />
      </View>
      <View className="my-4 flex flex-row items-center justify-end">
        <View className="w-56">
          <CustomButton
            icon="monitor-screenshot"
            iconSize={20}
            disabled={!isConnected || applicationState.isScreenshotLoading}
            onPress={() => getScreenshot()}
            label="Take Screenshot"
          />
        </View>
      </View>

      <View className="mb-2 mt-4 flex flex-row items-center justify-between">
        <Text className="font-medium text-white">Recent Logs</Text>
        <View className="w-32">
          <CustomButton
            icon="refresh"
            iconSize={16}
            textSize="medium"
            color="neutral"
            disabled={!isConnected}
            onPress={() => getLogs()}
            label="Refresh"
          />
        </View>
      </View>
      <ScrollView nestedScrollEnabled className="h-64 rounded-lg bg-black p-3">
        {applicationState.logs.length === 0 && (
          <Text className="text-sm text-gray-500">No logs to display</Text>
        )}
        {applicationState.logs.map((log) => (
          <View
            key={`${log.timestamp}-${log.line}-${log.message}`}
            className="mb-2"
          >
            <Text
              className={`text-xs font-bold ${
                LOG_LEVEL_COLOR[log.level] ?? 'text-gray-400'
              }`}
            >
              {log.level} {log.source}
            </Text>
            <Text className="text-xs text-gray-300">{log.message}</Text>
          </View>
        ))}
      </ScrollView>

      <View className="h-24" />
    </ScrollView>
  );
};
