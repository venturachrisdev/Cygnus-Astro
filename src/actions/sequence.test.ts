import Axios from 'axios';

import {
  convertTimespanToHMS,
  listAvailableSequences,
  loadSequence,
  skipSequence,
} from '@/actions/sequence';
import { useAlertsStore } from '@/stores/alerts.store';
import { useSequenceStore } from '@/stores/sequence.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: [] } });
  useSequenceStore.getState().set({
    isRunning: false,
    isLoadingImages: false,
    images: [],
    sequence: [],
    availableSequences: [],
  });
  useAlertsStore.getState().set({ message: null, type: null });
});

describe('listAvailableSequences', () => {
  it('stores the returned sequence names', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Response: ['target1', 'target2'] },
    });

    const result = await listAvailableSequences();

    expect(mockedGet).toHaveBeenCalledWith(
      'http://nina.test/v2/api/sequence/list-available',
    );
    expect(useSequenceStore.getState().availableSequences).toEqual([
      'target1',
      'target2',
    ]);
    expect(result).toEqual(['target1', 'target2']);
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));

    await expect(listAvailableSequences()).resolves.toBeUndefined();
  });
});

describe('loadSequence', () => {
  it('loads the sequence, refreshes state, and alerts on success', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: 'Sequence updated' } });
    mockedGet.mockResolvedValueOnce({ data: { Response: [] } });

    await loadSequence('target1');

    expect(mockedGet).toHaveBeenNthCalledWith(
      1,
      'http://nina.test/v2/api/sequence/load',
      { params: { sequenceName: 'target1' } },
    );
    expect(useAlertsStore.getState()).toMatchObject({
      message: 'Sequence loaded successfully!',
      type: 'success',
    });
  });

  it('alerts with the error message when the API reports a JSON error in a 200 response', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Error: 'Sequence is already running', StatusCode: 409 },
    });

    await loadSequence('target1');

    expect(useAlertsStore.getState()).toMatchObject({
      message: 'Sequence is already running',
      type: 'error',
    });
  });

  it('alerts on request failure', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));

    await loadSequence('target1');

    expect(useAlertsStore.getState()).toMatchObject({
      message: 'Sequence could not be loaded',
      type: 'error',
    });
  });
});

describe('skipSequence', () => {
  it('skips the current items, refreshes state, and alerts on success', async () => {
    mockedGet.mockResolvedValueOnce({ data: { Response: 'Skipped' } });
    mockedGet.mockResolvedValueOnce({ data: { Response: [] } });

    await skipSequence('CurrentItems');

    expect(mockedGet).toHaveBeenNthCalledWith(
      1,
      'http://nina.test/v2/api/sequence/skip',
      { params: { type: 'CurrentItems' } },
    );
    expect(useAlertsStore.getState()).toMatchObject({
      message: 'Sequence step skipped',
      type: 'success',
    });
  });

  it('alerts with the error message when the sequence is not running', async () => {
    mockedGet.mockResolvedValueOnce({
      data: { Error: 'Sequence is not running', StatusCode: 409 },
    });

    await skipSequence('CurrentItems');

    expect(useAlertsStore.getState()).toMatchObject({
      message: 'Sequence is not running',
      type: 'error',
    });
  });

  it('alerts on request failure', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));

    await skipSequence('ToEnd');

    expect(useAlertsStore.getState()).toMatchObject({
      message: 'Sequence step could not be skipped',
      type: 'error',
    });
  });
});

describe('convertTimespanToHMS', () => {
  it('treats the sentinel value 24 as midnight', () => {
    expect(convertTimespanToHMS(24)).toBe('00:00:00');
  });

  it('formats whole hours', () => {
    expect(convertTimespanToHMS(1)).toBe('01:00:00');
  });

  it('formats fractional hours as minutes', () => {
    expect(convertTimespanToHMS(2.5)).toBe('02:30:00');
  });

  it('formats zero', () => {
    expect(convertTimespanToHMS(0)).toBe('00:00:00');
  });
});
