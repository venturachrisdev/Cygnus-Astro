import { useAlertsStore } from '@/stores/alerts.store';
import { useCameraStore } from '@/stores/camera.store';
import { useCaptureStore } from '@/stores/capture.store';
import { useConfigStore } from '@/stores/config.store';
import { useDomeStore } from '@/stores/dome.store';
import { useFavoritesStore } from '@/stores/favorites.store';
import { useFilterWheelStore } from '@/stores/filterwheel.store';
import { useFlatPanelStore } from '@/stores/flatpanel.store';
import { useFocuserStore } from '@/stores/focuser.store';
import { useGuiderStore } from '@/stores/guider.store';
import { useMountStore } from '@/stores/mount.store';
import { useNGCStore } from '@/stores/ngc.store';
import { useRotatorStore } from '@/stores/rotator.store';
import { useSafetyMonitorStore } from '@/stores/safetymonitor.store';
import { useSequenceStore } from '@/stores/sequence.store';
import { useSwitchesStore } from '@/stores/switches.stores';
import { useTPPAStore } from '@/stores/tppa.store';
import { useWeatherStore } from '@/stores/weather.store';

const stores = [
  ['alerts', useAlertsStore],
  ['camera', useCameraStore],
  ['capture', useCaptureStore],
  ['config', useConfigStore],
  ['dome', useDomeStore],
  ['favorites', useFavoritesStore],
  ['filterwheel', useFilterWheelStore],
  ['flatpanel', useFlatPanelStore],
  ['focuser', useFocuserStore],
  ['guider', useGuiderStore],
  ['mount', useMountStore],
  ['ngc', useNGCStore],
  ['rotator', useRotatorStore],
  ['safetymonitor', useSafetyMonitorStore],
  ['sequence', useSequenceStore],
  ['switches', useSwitchesStore],
  ['tppa', useTPPAStore],
  ['weather', useWeatherStore],
] as const;

describe('zustand stores', () => {
  it.each(stores)(
    '%s exposes an object state with a set() action',
    (_name, useStore) => {
      const state = useStore.getState();
      expect(typeof state).toBe('object');
      expect(typeof state.set).toBe('function');
    },
  );

  it('camera store merges partial updates via set()', () => {
    useCameraStore.getState().set({ duration: 5, isConnected: true });
    expect(useCameraStore.getState().duration).toBe(5);
    expect(useCameraStore.getState().isConnected).toBe(true);
  });

  it('alerts store updates the message and type', () => {
    useAlertsStore.getState().set({ message: 'hello', type: 'error' });
    expect(useAlertsStore.getState().message).toBe('hello');
    expect(useAlertsStore.getState().type).toBe('error');
  });

  it('config store defaults observer astrometry to zero', () => {
    const { astrometry } = useConfigStore.getState().config;
    expect(astrometry.latitude).toBe(0);
    expect(astrometry.longitude).toBe(0);
  });
});
