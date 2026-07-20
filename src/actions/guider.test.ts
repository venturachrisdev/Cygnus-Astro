import Axios from 'axios';

import { clearGuiderCalibration } from '@/actions/guider';

jest.mock('axios');
jest.mock('@/actions/hosts', () => ({
  getApiUrl: jest.fn().mockResolvedValue('http://nina.test/v2/api'),
}));

const mockedGet = Axios.get as jest.Mock;

beforeEach(() => {
  mockedGet.mockReset();
  mockedGet.mockResolvedValue({ data: { Response: {} } });
});

describe('clearGuiderCalibration', () => {
  it('calls the clear-calibration endpoint then refreshes guider info', async () => {
    await clearGuiderCalibration();

    expect(mockedGet).toHaveBeenNthCalledWith(
      1,
      'http://nina.test/v2/api/equipment/guider/clear-calibration',
    );
    expect(mockedGet).toHaveBeenNthCalledWith(
      2,
      'http://nina.test/v2/api/equipment/guider/info',
    );
  });

  it('swallows request errors', async () => {
    mockedGet.mockRejectedValueOnce(new Error('network down'));
    await expect(clearGuiderCalibration()).resolves.toBeUndefined();
  });
});
