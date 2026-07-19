import { safeToFixed, safeToPrecision } from '@/helpers/parse';

describe('safeToFixed', () => {
  it('formats a number to the requested number of decimals', () => {
    expect(safeToFixed(3.14159, 2)).toBe('3.14');
  });

  it('defaults to zero decimals', () => {
    expect(safeToFixed(10)).toBe('10');
  });

  it('returns "0" for a falsy value', () => {
    expect(safeToFixed(0, 2)).toBe('0');
  });

  it('returns "0" when the API sends the string "NaN"', () => {
    // @ts-expect-error - the Advanced API can send "NaN" as a string
    expect(safeToFixed('NaN')).toBe('0');
  });

  it('returns "0" for NaN', () => {
    expect(safeToFixed(Number.NaN)).toBe('0');
  });
});

describe('safeToPrecision', () => {
  it('formats a number to the requested precision', () => {
    expect(safeToPrecision(123.456, 4)).toBe('123.5');
  });

  it('returns "0" for a falsy value', () => {
    expect(safeToPrecision(0, 3)).toBe('0');
  });

  it('returns "0" when the API sends the string "NaN"', () => {
    // @ts-expect-error - the Advanced API can send "NaN" as a string
    expect(safeToPrecision('NaN')).toBe('0');
  });
});
