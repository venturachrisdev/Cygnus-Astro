import type { ReactNode } from 'react';

/* React 19 no longer supplies implicit `children` to class components, and this
   unmaintained library never declared it. Merge it back onto the props class. */
declare module 'react-native-image-pan-zoom/built/image-zoom/image-zoom.type' {
  interface ImageZoomProps {
    children?: ReactNode;
  }
}
