/* eslint-disable no-bitwise */
const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let result = '';
  let i = 0;

  for (; i + 2 < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;

    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += BASE64_CHARS[((b1 & 15) << 2) | (b2 >> 6)];
    result += BASE64_CHARS[b2 & 63];
  }

  const remaining = bytes.length - i;
  if (remaining === 1) {
    const b0 = bytes[i] ?? 0;

    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[(b0 & 3) << 4];
    result += '==';
  } else if (remaining === 2) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;

    result += BASE64_CHARS[b0 >> 2];
    result += BASE64_CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += BASE64_CHARS[(b1 & 15) << 2];
    result += '=';
  }

  return result;
};
