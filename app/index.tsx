import { Stack } from 'expo-router';

import { Welcome } from '@/templates/Welcome';

const Home = () => (
  <>
    <Stack.Screen
      options={{
        title: 'Cygnus',
        headerShown: false,
      }}
    />
    <Welcome />
  </>
);

export default Home;
