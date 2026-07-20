import Axios from 'axios';

import {
  advanceFramingCompletion,
  FRAMING_COMPLETION_IDLE_TICKS,
  framingSlew,
  framingStatusLabel,
  initialFramingCompletionTracker,
} from '@/actions/framing';
import { useAlertsStore } from '@/stores/alerts.store';
import { useNGCStore } from '@/stores/ngc.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
  useNGCStore.getState().set({ isRunning: false });
  useAlertsStore.getState().set({ message: null, type: null });
});

describe('advanceFramingCompletion', () => {
  it('never completes before any activity is seen', () => {
    let tracker = initialFramingCompletionTracker;

    for (let i = 0; i < FRAMING_COMPLETION_IDLE_TICKS + 5; i += 1) {
      const result = advanceFramingCompletion(tracker, false);
      tracker = result.tracker;
      expect(result.complete).toBe(false);
    }

    expect(tracker.sawActivity).toBe(false);
  });

  it('records activity and resets the idle counter while busy', () => {
    const result = advanceFramingCompletion(
      initialFramingCompletionTracker,
      true,
    );

    expect(result.complete).toBe(false);
    expect(result.tracker).toEqual({ sawActivity: true, idleTicks: 0 });
  });

  it('completes only after enough consecutive idle ticks post-activity', () => {
    let { tracker } = advanceFramingCompletion(
      initialFramingCompletionTracker,
      true,
    );

    for (let i = 1; i < FRAMING_COMPLETION_IDLE_TICKS; i += 1) {
      const result = advanceFramingCompletion(tracker, false);
      tracker = result.tracker;
      expect(result.complete).toBe(false);
      expect(tracker.idleTicks).toBe(i);
    }

    const final = advanceFramingCompletion(tracker, false);
    expect(final.complete).toBe(true);
    expect(final.tracker.idleTicks).toBe(FRAMING_COMPLETION_IDLE_TICKS);
  });

  it('resets the idle counter when activity resumes mid-idle (a centering iteration)', () => {
    let { tracker } = advanceFramingCompletion(
      initialFramingCompletionTracker,
      true,
    );
    tracker = advanceFramingCompletion(tracker, false).tracker;
    tracker = advanceFramingCompletion(tracker, false).tracker;
    expect(tracker.idleTicks).toBe(2);

    const resumed = advanceFramingCompletion(tracker, true);
    expect(resumed.tracker.idleTicks).toBe(0);
    expect(resumed.complete).toBe(false);
  });
});

describe('framingStatusLabel', () => {
  it('prioritises a plate-solve failure over other states', () => {
    expect(
      framingStatusLabel({
        didPlatesolveFail: true,
        isSlewing: true,
        isExposing: true,
      }),
    ).toBe('Platesolve failed. Retrying...');
  });

  it('reports slewing, then exposing, then a generic framing fallback', () => {
    expect(
      framingStatusLabel({
        didPlatesolveFail: false,
        isSlewing: true,
        isExposing: false,
      }),
    ).toBe('Slewing to target...');
    expect(
      framingStatusLabel({
        didPlatesolveFail: false,
        isSlewing: false,
        isExposing: true,
      }),
    ).toBe('Exposing...');
    expect(
      framingStatusLabel({
        didPlatesolveFail: false,
        isSlewing: false,
        isExposing: false,
      }),
    ).toBe('Framing...');
  });
});

describe('framingSlew', () => {
  it('marks the operation running and clears it on success', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: {} } });

    await framingSlew(true, true);

    expect(useNGCStore.getState().isRunning).toBe(false);
    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/framing/slew',
      expect.objectContaining({
        params: { waitForResult: true, slew_option: 'Center' },
      }),
    );
  });

  it('surfaces an error alert when the request fails while still running', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));

    await framingSlew(true, true);

    expect(useNGCStore.getState().isRunning).toBe(false);
    expect(useAlertsStore.getState().message).toBe('Unable to frame target');
    expect(useAlertsStore.getState().type).toBe('error');
  });

  it('does not surface a false failure when poll-based completion already ended the op', async () => {
    /* Simulate the poll loop flipping isRunning to false (framing finished)
       before the long-poll request rejects on its 5-minute timeout. */
    mockedGet.mockImplementationOnce(async () => {
      useNGCStore.getState().set({ isRunning: false });
      throw new Error('timeout of 300000ms exceeded');
    });

    await framingSlew(true, true);

    expect(useNGCStore.getState().isRunning).toBe(false);
    expect(useAlertsStore.getState().message).toBeNull();
  });
});
