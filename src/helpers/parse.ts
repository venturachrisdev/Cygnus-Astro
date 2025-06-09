/**
 * Ensure the value is a proper string before calling .toFixed()
 * The Advanced API can return "NaN" (string) is the value is not present.
 * @param value
 * @param decimals
 * @returns
 */
export const safeToFixed = (value: number, decimals = 0): string => {
  if (value && value.toFixed) {
    return value.toFixed(decimals);
  }

  return '0';
};
