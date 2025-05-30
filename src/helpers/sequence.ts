import {
  convertDMStoDegrees,
  convertHMStoDegrees,
  getAltitude,
} from '@/actions/mount';
import { convertTimespanToHMS } from '@/actions/sequence';
import type { NGCObject } from '@/stores/ngc.store';

const trackingMode: Record<String, String> = {
  '0': 'Sidereal',
  '5': 'Stopped',
  '1': 'Lunar',
  '2': 'Solar',
};

const altitudeComparator = ['', '<', '<=', '>', '>='];

export const getAltitudePoints = (
  ngc: Partial<NGCObject>,
  longitude: number,
  latitude: number,
) =>
  [...Array(24).keys()].map((i: number) => {
    const now = new Date().addHours(i);

    const altitude = getAltitude({
      decDeg: convertDMStoDegrees(ngc.dec!, true),
      latDeg: latitude,
      raDeg: convertHMStoDegrees(ngc.ra!, true),
      date: now,
      lonDeg: longitude,
    });

    return altitude.altDeg;
  });

export const getCurrentAltitude = (
  ngc: Partial<NGCObject>,
  longitude: number,
  latitude: number,
) => {
  const now = new Date();

  const altitude = getAltitude({
    decDeg: convertDMStoDegrees(ngc.dec!, true),
    latDeg: latitude,
    raDeg: convertHMStoDegrees(ngc.ra!, true),
    date: now,
    lonDeg: longitude,
  });

  return altitude.altDeg;
};

export const getParsedContainerName = (name: string): string => {
  if (!name) {
    return '';
  }

  return name
    .replace('_Container', '')
    .replace('_Trigger', '')
    .replace('_Condition', '');
};

export const getTextForStep = (item: any): string => {
  if (!item.Name) {
    return '';
  }

  if (
    item.Name.includes('Take Many Exposures') ||
    item.Name.includes('Smart Exposure')
  ) {
    const count =
      item.Conditions[0]?.Iterations ||
      item.Items[0]?.ExposureCount ||
      item.Conditions[1]?.Iterations ||
      item.Items[1]?.ExposureCount ||
      0;
    const exposureTime =
      item.Items[0]?.ExposureTime || item.Items[1]?.ExposureTime || 0;
    const imageType =
      item.Items[0]?.ImageType || item.Items[1]?.ImageType || '';
    return `Count: ${count},  Duration: ${exposureTime}s,  Type: ${imageType}`;
  }

  if (
    item.Name.includes('Take Exposure') ||
    item.Name.includes('Take Subframe Exposure')
  ) {
    const exposureTime = item.ExposureTime || 0;
    const imageType = item.ImageType || '';
    return `Duration: ${exposureTime}s,  Type: ${imageType}`;
  }

  if (item.Name.includes('Set USB Limit')) {
    return `Limit: ${item.USBLimit || 0}`;
  }

  if (item.Name.includes('Dew Heater')) {
    return `${item.OnOff ? 'On' : 'Off'}`;
  }

  if (item.Name.includes('Set Readout Mode')) {
    return `Mode: ${item.Mode || 0}`;
  }

  if (item.Name.includes('Wait for Time Span')) {
    return `Delay: ${item.Time}s`;
  }

  if (
    item.Name.includes('Wait for Time') ||
    item.Name.includes('Loop Until Time') ||
    item.Name.includes('Loop for Time Span')
  ) {
    return `${String(item.Hours).padStart(2, '0')}:${String(
      item.Minutes,
    ).padStart(2, '0')}:${String(item.Seconds).padStart(2, '0')}`;
  }

  if (item.Name.includes('Cool Camera')) {
    return `Temperature: ${item.Temperature}°`;
  }

  if (item.Name.includes('Warm Camera')) {
    return `Min duration: ${item.Duration}s`;
  }

  if (item.Name.includes('Set Tracking')) {
    return `${trackingMode[item.TrackingMode] || 'Unknown'}`;
  }

  if (item.Name.includes('Center After Drift')) {
    return `After Exposures: ${item.AfterExposures}`;
  }

  if (item.Name.includes('Meridian Flip')) {
    return `Time to flip: ${convertTimespanToHMS(item.TimeToMeridianFlip)}`;
  }

  if (item.Name.includes('Switch Filter')) {
    return `Filter: ${item.Filter?._name || ''}`;
  }

  if (item.Name.includes('Start Guiding')) {
    return `Force calibration: ${item.ForceCalibration ? 'Yes' : 'No'}`;
  }

  if (item.Name.includes('AF After HFR Increase')) {
    return `Amount: ${item.Amount}%,   Sample size: ${item.SampleSize}`;
  }

  if (item.Name.includes('AF After # Exposures')) {
    return `After: ${item.AfterExposures}`;
  }
  if (item.Name.includes('AF After Temperature Change')) {
    return `Temperature: ${item.Amount}°`;
  }
  if (item.Name.includes('AF After Time')) {
    return `After: ${item.Amount} min`;
  }

  if (item.Name.includes('Send WebSocket Event')) {
    return `Message: ${item.Message}`;
  }

  if (
    item.Name.includes('Connect Equipment') ||
    item.Name.includes('Disconnect Equipment')
  ) {
    return `Device: ${item.SelectedDevice}`;
  }

  if (item.Name.includes('Filter Offset Calculator')) {
    return `Iterations: ${item.Loops}`;
  }

  if (item.Name.includes('Dither after Exposures')) {
    return `After ${item.AfterExposures}`;
  }

  if (item.Name.includes('Set Switch Value')) {
    return `Switch: ${item.SelectedSwitch?.Name}, Value: ${item.Value}`;
  }

  if (item.Name.includes('Annotation') || item.Name.includes('Message Box')) {
    return `Note: ${item.Text || item.Message || ''}`;
  }

  if (item.Name.includes('Moon illumination')) {
    return `Loop until illumination ${altitudeComparator[item.Comparator]} ${
      item.UserMoonIllumination
    }%    (Current: ${Math.ceil(item.CurrentMoonIllumination)}%)`;
  }

  if (
    ((item.Name.includes('Wait') || item.Name.includes('Loop')) &&
      item.Name.includes('Altitude')) ||
    item.Name.includes('Above horizon')
  ) {
    if (item.Data) {
      return `Altitude ${altitudeComparator[item.Data?.Comparator]} ${item.Data
        ?.Offset}°`;
    }
    return `Altitude: ${item.Data?.Offset}°`;
  }

  if (item.Name.includes('Loop For Iterations')) {
    return `Iterations: ${item.CompletedIterations}/${item.Iterations}`;
  }

  if (item.Name.includes('Loop while Altitude Above Horizon')) {
    const currentAltitude = getCurrentAltitude({
      ra: `${item.Data.Coordinates.RAHours}:${item.Data.Coordinates.RAMinutes}:${item.Data.Coordinates.RASeconds}`,
      dec: `${item.Data.Coordinates.DecDegrees}:${item.Data.Coordinates.DecMinutes}:${item.Data.Coordinates.DecSeconds}`,
    });

    return `Offset: ${item.Data.Offset}°,  Altitude: ${Math.ceil(
      currentAltitude,
    )}°`;
  }

  return '';
};

export const getIconNameForStep = (name: string): string => {
  if (!name) {
    return '';
  }

  const parsedName = name.trim().toLocaleLowerCase();

  if (parsedName.includes('home')) {
    return 'home';
  }
  if (parsedName.includes('cool')) {
    return 'fan';
  }
  if (parsedName.includes('warm')) {
    return 'fire';
  }
  if (parsedName.includes('wait')) {
    return 'clock-time-two-outline';
  }
  if (parsedName.includes('meridian')) {
    return 'rotate-360';
  }
  if (parsedName.includes('tracking')) {
    return 'speedometer';
  }
  if (parsedName.includes('camera') || parsedName.includes('readout')) {
    return 'camera';
  }
  if (parsedName.includes('loop')) {
    return 'rotate-right';
  }
  if (parsedName.includes('dither')) {
    return 'magic-staff';
  }
  if (parsedName.includes('focus') || parsedName.includes('af')) {
    return 'focus-auto';
  }
  if (parsedName.includes('exposure')) {
    return 'camera-iris';
  }
  if (parsedName.includes('guiding')) {
    return 'target';
  }
  if (parsedName.includes('park')) {
    return 'parking';
  }
  if (parsedName.includes('filter')) {
    return 'ferris-wheel';
  }
  if (parsedName.includes('scope') || parsedName.includes('slew')) {
    return 'telescope';
  }
  if (parsedName.includes('rotate')) {
    return 'rotate-left';
  }
  if (parsedName.includes('heater')) {
    return 'air-humidifier';
  }
  if (parsedName.includes('usb')) {
    return 'usb';
  }
  if (parsedName.includes('websocket') || parsedName.includes('script')) {
    return 'code-braces';
  }
  if (parsedName.includes('disconnect') || parsedName.includes('connect')) {
    return 'connection';
  }
  if (parsedName.includes('switch')) {
    return 'toggle-switch-outline';
  }
  if (parsedName.includes('solve')) {
    return 'target';
  }
  if (parsedName.includes('annotation') || parsedName.includes('message')) {
    return 'pencil';
  }
  if (parsedName.includes('save')) {
    return 'content-save';
  }
  if (parsedName.includes('moon')) {
    return 'moon-waning-crescent';
  }

  return 'debug-step-into';
};

export const filterOutEmptyStep = (container: any): boolean => {
  if (
    container.Name === '_Container' ||
    container.Name === '_Condition' ||
    container.Name === '_Trigger'
  ) {
    return false;
  }

  return true;
};

export const getRunningStep = (sequences: any[]): any => {
  let runningStep = null;

  for (const sequence of sequences) {
    if (sequence.Status === 'RUNNING') {
      const hasItems = sequence.Items?.length > 0;
      const hasConditions = sequence.Conditions?.length > 0;
      const hasTriggers = sequence.Triggers?.length > 0;

      if (hasItems) {
        runningStep = getRunningStep(sequence.Items);
        if (runningStep && !runningStep.Name) {
          runningStep = sequence;
        }
      }

      if (hasConditions && !runningStep) {
        runningStep = getRunningStep(sequence.Conditions);
        if (runningStep && !runningStep.Name) {
          runningStep = sequence;
        }
      }

      if (hasTriggers && !runningStep) {
        runningStep = getRunningStep(sequence.Triggers);
        if (runningStep && !runningStep.Name) {
          runningStep = sequence;
        }
      }

      if (!hasConditions && !hasTriggers && !hasItems) {
        runningStep = sequence;
      }
    }
  }

  return runningStep;
};
