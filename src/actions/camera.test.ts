import Axios from 'axios';

import {
  captureImage,
  getCapturedImageWithRetries,
  sendCapture,
} from '@/actions/camera';
import { useCameraStore } from '@/stores/camera.store';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: { Image: 'base64data' } } });
  useCameraStore.getState().set({
    image: null,
    isLoading: false,
    isCapturing: false,
    loop: false,
    duration: 1,
    platesolve: false,
  });
});

describe('sendCapture', () => {
  it('captures without saving so snapshots stay out of the sequence gallery', async () => {
    await sendCapture(5, false);

    const url = mockedGet.mock.calls[0][0] as string;
    expect(url).toContain('/equipment/camera/capture');
    expect(url).toContain('duration=5');
    expect(url).toContain('solve=false');
    // save would enqueue the snapshot into NINA's image history / gallery
    expect(url).not.toContain('save=true');
  });

  it('forwards the solve flag', async () => {
    await sendCapture(3, true);
    expect(mockedGet.mock.calls[0][0]).toContain('solve=true');
  });
});

describe('getCapturedImageWithRetries', () => {
  it('stores the returned image and clears the loading state', async () => {
    await getCapturedImageWithRetries();

    const state = useCameraStore.getState();
    expect(state.image).toBe('base64data');
    expect(state.isLoading).toBe(false);
  });
});

describe('captureImage', () => {
  it('starts an unsaved capture and retrieves the image for short exposures', async () => {
    await captureImage();

    expect(mockedGet.mock.calls[0][0]).not.toContain('save=true');
    expect(useCameraStore.getState().image).toBe('base64data');
  });
});
