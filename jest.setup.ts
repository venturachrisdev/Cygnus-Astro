// Import Jest Native matchers
import '@testing-library/jest-native/extend-expect';

// Persisted zustand stores read AsyncStorage at creation; use the official mock.
jest.mock('@react-native-async-storage/async-storage', () =>
  // eslint-disable-next-line global-require
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// hosts.ts imports the native LAN scanner at module load; stub it so imports resolve under jest.
jest.mock('react-native-lan-port-scanner', () => ({
  __esModule: true,
  default: {
    getNetworkInfo: jest.fn(),
    startScan: jest.fn(),
  },
}));

jest.mock('react-native-get-location', () => ({
  __esModule: true,
  default: { getCurrentPosition: jest.fn() },
}));
