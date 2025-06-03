import * as Sentry from '@sentry/react-native';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';

Sentry.init({
  dsn: 'https://e9267766ffe96a22411f7b55fec08b55@o4509426100535296.ingest.us.sentry.io/4509426112724992',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: false,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [
    Sentry.mobileReplayIntegration({
      maskAllImages: false,
      maskAllText: false,
      maskAllVectors: false,
    }),
  ],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

NativeWindStyleSheet.setOutput({
  default: 'native',
});

export default Sentry.wrap(function Layout() {
  return (
    <Stack
      screenOptions={{
        title: 'Cygnus',
        headerShown: false,
      }}
    />
  );
});
