import {
  filterOutEmptyStep,
  getAltitudePoints,
  getCurrentAltitude,
  getIconNameForStep,
  getParsedContainerName,
  getRunningStep,
  getTextForStep,
} from '@/helpers/sequence';

describe('getParsedContainerName', () => {
  it('strips the container/trigger/condition suffixes', () => {
    expect(getParsedContainerName('M31_Container')).toBe('M31');
    expect(getParsedContainerName('Focus_Trigger')).toBe('Focus');
    expect(getParsedContainerName('Cool_Condition')).toBe('Cool');
  });

  it('returns an empty string for a falsy name', () => {
    expect(getParsedContainerName('')).toBe('');
  });
});

describe('getIconNameForStep', () => {
  it('returns an empty string for a falsy name', () => {
    expect(getIconNameForStep('')).toBe('');
  });

  it('maps known step names to icons, case-insensitively', () => {
    expect(getIconNameForStep('Home Telescope')).toBe('home');
    expect(getIconNameForStep('Cool Camera')).toBe('fan');
    expect(getIconNameForStep('Wait for time')).toBe('clock-time-two-outline');
  });

  it('falls back to a default icon for unknown steps', () => {
    expect(getIconNameForStep('zzz qqq')).toBe('debug-step-into');
  });
});

describe('filterOutEmptyStep', () => {
  it('filters out the synthetic empty containers', () => {
    expect(filterOutEmptyStep({ Name: '_Container' })).toBe(false);
    expect(filterOutEmptyStep({ Name: '_Condition' })).toBe(false);
    expect(filterOutEmptyStep({ Name: '_Trigger' })).toBe(false);
  });

  it('keeps real steps', () => {
    expect(filterOutEmptyStep({ Name: 'Take Exposure' })).toBe(true);
  });
});

describe('getRunningStep', () => {
  it('returns null when nothing is running', () => {
    expect(getRunningStep([])).toBeNull();
    expect(getRunningStep([{ Status: 'FINISHED', Name: 'A' }])).toBeNull();
  });

  it('returns a running leaf step', () => {
    const leaf = { Status: 'RUNNING', Name: 'Leaf' };
    expect(getRunningStep([leaf])).toBe(leaf);
  });

  it('descends into nested running items', () => {
    const child = { Status: 'RUNNING', Name: 'Child' };
    const parent = { Status: 'RUNNING', Name: 'Parent', Items: [child] };
    expect(getRunningStep([parent])).toBe(child);
  });
});

describe('getTextForStep', () => {
  it('returns an empty string for a step with no name', () => {
    expect(getTextForStep({ Name: '' })).toBe('');
  });

  it('describes a warm-camera step', () => {
    expect(getTextForStep({ Name: 'Warm Camera', Duration: 5 })).toBe(
      'Min duration: 5s',
    );
  });

  it('describes a loop-for-iterations step', () => {
    expect(
      getTextForStep({
        Name: 'Loop For Iterations',
        CompletedIterations: 2,
        Iterations: 10,
      }),
    ).toBe('Iterations: 2/10');
  });

  it('resolves known tracking modes and falls back to Unknown', () => {
    expect(getTextForStep({ Name: 'Set Tracking', TrackingMode: '0' })).toBe(
      'Sidereal',
    );
    expect(getTextForStep({ Name: 'Set Tracking', TrackingMode: '9' })).toBe(
      'Unknown',
    );
  });
});

describe('altitude helpers', () => {
  it('getAltitudePoints returns 24 finite hourly altitudes', () => {
    const points = getAltitudePoints(
      { dec: '45:00:00', ra: '12:00:00' },
      0,
      45,
    );
    expect(points).toHaveLength(24);
    expect(points.every((p) => Number.isFinite(p))).toBe(true);
  });

  it('getCurrentAltitude returns a finite altitude using the stored location', () => {
    const altitude = getCurrentAltitude({ dec: '45:00:00', ra: '12:00:00' });
    expect(Number.isFinite(altitude)).toBe(true);
  });
});
