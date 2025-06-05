import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alert } from '@/components/Alert';
import { useAlertsStore } from '@/stores/alerts.store';
import { TargetSearch } from '@/templates/TargetSearch';

const Page = () => {
  const alertsState = useAlertsStore();
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timer>();

  const dismissAlert = () => {
    alertsState.set({ message: null, type: null });
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  };

  useEffect(() => {
    if (alertsState.message && alertsState.type) {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }

      const id = setTimeout(() => {
        dismissAlert();
      }, 2000);

      setTimeoutID(id);
    }
  }, [alertsState.message, alertsState.type]);

  return (
    <SafeAreaView
      edges={['left', 'right', 'top']}
      style={{ backgroundColor: '#171717' }}
    >
      <View className="flex h-full flex-row justify-end">
        <TargetSearch />
      </View>
      <View className="absolute bottom-6 flex w-full items-center justify-center opacity-95">
        {alertsState.message && alertsState.type && (
          <View className="w-[70%]">
            <Alert
              message={alertsState.message}
              type={alertsState.type}
              onPress={dismissAlert}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Page;
