import { Stack } from 'expo-router';

import { Capture } from '@/templates/Capture';
import { Mount } from '@/templates/Mount';
import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';

const Home = () => (
  <>
    <Stack.Screen
      options={{
        title: 'Cygnus',
        headerShown: false,
      }}
    />
    <SafeAreaView edges={['left', 'right']} style={{ backgroundColor: '#171717' }}>
      <Mount />
    </SafeAreaView>
  </>
);

export default Home;
