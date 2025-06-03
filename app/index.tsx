/* eslint-disable global-require */
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, Text } from 'react-native';

import { getApplicationVersion, scanHosts } from '@/actions/hosts';
import { ConnectionStatus, useConfigStore } from '@/stores/config.store';

export default function Layout() {
  const router = useRouter();
  const configState = useConfigStore();

  useEffect(() => {
    if (configState.currentDevice !== null) {
      getApplicationVersion(true);
    } else {
      scanHosts(true);
    }

    const connectionTimeout = setTimeout(() => {
      configState.set({ connectionStatus: ConnectionStatus.FAILED });
    }, 5000);

    return () => {
      clearTimeout(connectionTimeout);
    };
  }, []);

  useEffect(() => {
    if (
      configState.isConnected ||
      configState.connectionStatus !== ConnectionStatus.IDLE
    ) {
      setTimeout(() => {
        router.replace('/main');
      }, 100);
    }
  }, [configState.isConnected, configState.connectionStatus]);

  return (
    <>
      <Image
        className="h-full w-full"
        resizeMode="cover"
        source={require('../assets/splash.png')}
      />
      <Text className="absolute bottom-8 right-16 text-white">
        Connecting to N.I.N.A...
      </Text>
    </>
  );
}
