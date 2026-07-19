import { convertTimespanToHMS } from '@/actions/sequence';

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
