import Axios from 'axios';

import { useAlertsStore } from '@/stores/alerts.store';
import { useNGCStore } from '@/stores/ngc.store';

import { getApiUrl } from './hosts';

export const setFramingSource = async (source: string = 'SKYATLAS') => {
  try {
    await Axios.get(`${await getApiUrl()}/framing/set-source?source=${source}`);
  } catch (e: Error | any) {
    console.log('Error setting framing', e);
  }
};

export const setFramingCoordinates = async (
  raInDegrees: number,
  decInDegrees: number,
) => {
  try {
    await Axios.get(
      `${await getApiUrl()}/framing/set-coordinates?RAangle=${raInDegrees}&DECAngle=${decInDegrees}`,
    );
  } catch (e) {
    console.log('Error setting framing', e);
  }
};

export const FRAMING_COMPLETION_IDLE_TICKS = 20;

export interface FramingCompletionTracker {
  sawActivity: boolean;
  idleTicks: number;
}

export const initialFramingCompletionTracker: FramingCompletionTracker = {
  sawActivity: false,
  idleTicks: 0,
};

/* Poll-based completion for framing/centering. NINA's waitForResult HTTP call
   can hang well past the visible end of the operation, so completion is instead
   inferred from mount/camera activity: once the rig has gone idle for
   FRAMING_COMPLETION_IDLE_TICKS consecutive polls after activity was seen, the
   op is treated as done. The idle window absorbs the settle time and plate-solve
   compute gaps that occur between centering iterations. */
export const advanceFramingCompletion = (
  tracker: FramingCompletionTracker,
  isBusy: boolean,
): { tracker: FramingCompletionTracker; complete: boolean } => {
  if (isBusy) {
    return { tracker: { sawActivity: true, idleTicks: 0 }, complete: false };
  }

  if (!tracker.sawActivity) {
    return { tracker, complete: false };
  }

  const idleTicks = tracker.idleTicks + 1;
  return {
    tracker: { sawActivity: true, idleTicks },
    complete: idleTicks >= FRAMING_COMPLETION_IDLE_TICKS,
  };
};

export const framingStatusLabel = (args: {
  didPlatesolveFail: boolean;
  isSlewing: boolean;
  isExposing: boolean;
}): string => {
  if (args.didPlatesolveFail) {
    return 'Platesolve failed. Retrying...';
  }
  if (args.isSlewing) {
    return 'Slewing to target...';
  }
  if (args.isExposing) {
    return 'Exposing...';
  }
  return 'Framing...';
};

export const framingSlew = async (
  center: boolean = false,
  waitForResult: boolean = false,
) => {
  const ngcState = useNGCStore.getState();
  const alertState = useAlertsStore.getState();

  ngcState.set({
    isRunning: true,
  });

  try {
    await Axios.get(`${await getApiUrl()}/framing/slew`, {
      params: {
        waitForResult,
        slew_option: center ? 'Center' : undefined,
      },
      timeout: 1000 * 60 * 5, // 5 mins
    });

    ngcState.set({
      isRunning: false,
    });
  } catch (e) {
    console.log('Error setting framing', e);

    /* Poll-based completion may have already ended the operation - the
       waitForResult request can time out after framing visibly finished. Only
       surface a failure if the op is still considered running. */
    if (!useNGCStore.getState().isRunning) {
      return;
    }

    ngcState.set({
      isRunning: false,
    });
    alertState.set({
      message: 'Unable to frame target',
      type: 'error',
    });
  }
};
