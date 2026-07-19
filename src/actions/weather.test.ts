import { parseNaNValue } from '@/actions/weather';

describe('parseNaNValue', () => {
  it('returns undefined for the API "NaN" sentinel string', () => {
    expect(parseNaNValue('NaN')).toBeUndefined();
  });

  it('parses numeric strings', () => {
    expect(parseNaNValue('12.5')).toBe(12.5);
  });

  it('passes numbers through', () => {
    expect(parseNaNValue(42)).toBe(42);
  });

  it('returns NaN for a non-numeric string that is not the sentinel', () => {
    expect(parseNaNValue('abc')).toBeNaN();
  });
});
