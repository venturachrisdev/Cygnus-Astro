import Axios from 'axios';

import { WebSocketService } from '@/services/web-socket.service';
import { useMountStore } from '@/stores/mount.store';

import {
  API_MOUNT_CONNECT,
  API_MOUNT_DISCONNECT,
  API_MOUNT_HOME,
  API_MOUNT_INFO,
  API_MOUNT_LIST,
  API_MOUNT_PARK,
  API_MOUNT_RESCAN,
  API_MOUNT_UNPARK,
} from './constants';
import { getApiUrl } from './hosts';

const mountSocket = new WebSocketService();

export const initializeMountSocket = (onMessage: (message: any) => void) => {
  mountSocket.connect('/v2/mount', onMessage);
};

export const sendMountEvent = (message: any) => {
  mountSocket.send(message);
};

export const getMountInfo = async () => {
  const mountState = useMountStore.getState();

  try {
    const response = (await Axios.get(`${await getApiUrl()}/${API_MOUNT_INFO}`))
      .data;

    if (response.Response?.DeviceId) {
      mountState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    mountState.set({
      isParked: response.Response.AtPark,
      isSlewing: response.Response.Slewing,
      isConnected: response.Response.Connected,
      isHome: response.Response.AtHome,
      isTracking: response.Response.TrackingEnabled,
      latitude: response.Response.SiteLatitude,
      longitude: response.Response.SiteLongitude,
      elevation: response.Response.SiteElevation,
      sideOfPier: response.Response.SideOfPier.replace(/pier/g, ''),
      ra: response.Response.Coordinates.RAString,
      dec: response.Response.Coordinates.DecString,
      timeToMeridianFlip: response.Response.TimeToMeridianFlipString,
      epoch: response.Response.Coordinates.Epoch,
      siderealTime: response.Response.SiderealTimeString,
    });
    return response.Response;
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const listMountDevices = async () => {
  const mountState = useMountStore.getState();

  try {
    const response = (await Axios.get(`${await getApiUrl()}/${API_MOUNT_LIST}`))
      .data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    mountState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const rescanMountDevices = async () => {
  const mountState = useMountStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/${API_MOUNT_RESCAN}`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    mountState.set({ devices });
    await getMountInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const connectMount = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/${API_MOUNT_CONNECT}`, {
      params: {
        to: id,
      },
    });
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const setMountTrackingMode = async (mode: number) => {
  try {
    console.log('Setting mount mode to', mode);
    await Axios.get(
      `${await getApiUrl()}/equipment/mount/tracking?mode=${mode}`,
    );
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const disconnectMount = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_MOUNT_DISCONNECT}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const homeMount = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_MOUNT_HOME}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const parkMount = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_MOUNT_PARK}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const unParkMount = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/${API_MOUNT_UNPARK}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const stopSlewMount = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/mount/slew/stop`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const slewMount = async (ra: number, dec: number) => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/mount/slew`, {
      params: {
        ra,
        dec,
      },
    });
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const setMountPark = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/mount/set-park-position`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

/// //////

export const convertHMStoDegrees = (ra: string, useColon: boolean = false) => {
  const matches = useColon
    ? ra.match(/(\d+):\s*(\d+):\s*([\d.]+)/)
    : ra.match(/(\d+)h\s*(\d+)m\s*([\d.]+)s/);

  if (matches) {
    return (
      15 *
      ((parseInt(matches[1]!) || 0) +
        (parseInt(matches[2]!) || 0) / 60 +
        (parseFloat(matches[3]!) || 0) / 3600)
    );
  }

  return 0;
};

export const convertDMStoDegrees = (dec: string, useColon: boolean = false) => {
  const matches = useColon
    ? dec.match(/([+-]?)(\d+):\s*(\d+):\s*([\d.]+)/)
    : dec.match(/([+-]?)(\d+)°\s*(\d+)′\s*([\d.]+)″/);

  if (matches) {
    const sign = matches[1]! === '-' ? -1 : 1;
    return (
      sign *
      ((parseInt(matches[2]!) || 0) +
        (parseInt(matches[3]!) || 0) / 60 +
        (parseFloat(matches[4]!) || 0) / 3600)
    );
  }

  return 0;
};

export const convertDegreesToHMS = (degrees: number) => {
  const hours = degrees / 15;
  const hoursUnit = Math.floor(hours);
  const remainingHours = hoursUnit - hours;

  const minutes = remainingHours * 60;
  const minutesUnit = Math.floor(minutes);
  const remainingMinutes = minutesUnit - minutes;

  const secondsUnit = remainingMinutes * 60;

  const hh = String(hoursUnit).padStart(2, '0');
  const mm = String(minutesUnit).padStart(2, '0');
  const ss = String(secondsUnit).padStart(2, '0');

  return `${hh}:${mm}:${ss}`;
};

export const convertDegreesToDMS = (degrees: number) => {
  const sign = degrees < 0 ? '-' : '';

  const posDegrees = Math.abs(degrees);
  const degreesUnit = Math.floor(posDegrees);
  const remainingDegrees = posDegrees - degreesUnit;

  const minutes = remainingDegrees * 60;
  const minutesUnit = Math.floor(minutes);
  const remainingMinutes = minutes - minutesUnit;

  const secondsUnit = remainingMinutes * 60;

  const d = String(degreesUnit).padStart(2, '0');
  const m = String(minutesUnit).padStart(2, '0');
  const s = String(Math.ceil(secondsUnit)).padStart(2, '0');

  return `${sign}${d}° ${m}' ${s}''`;
};

export const calculateAltitude = (
  latitude: number,
  decDeg: number,
  hourAngleDeg: number,
) => {
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  const haRad = (hourAngleDeg * Math.PI) / 180;
  return (
    (Math.asin(
      Math.sin(latRad) * Math.sin(decRad) +
        Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad),
    ) *
      180) /
    Math.PI
  );
};

export const getSiderealTime = (date: Date, longitudeDeg = 0) => {
  // 1. Convert the date to Julian Day (UTC)
  const JD = date.getTime() / 86400000 + 2440587.5;

  // 2. Julian centuries since J2000.0
  const T = (JD - 2451545.0) / 36525;

  // 3. Greenwich Mean Sidereal Time in seconds
  const GMSTsec =
    67310.54841 + // constant term (s)
    (876600 * 3600 + 8640184.812866) * T + //  8640184.812866 T + 0.093104 T² − 6.2e-6 T³
    0.093104 * T * T -
    6.2e-6 * T * T * T;

  // 4. Wrap to [0, 86400) seconds and convert to degrees
  const GMSTdeg = (((GMSTsec % 86400) + 86400) % 86400) / 240; // 360° / 86400 s = 1/240

  // 5. Local Sidereal Time
  const LSTdeg = (((GMSTdeg + longitudeDeg) % 360) + 360) % 360;

  return {
    gstDeg: GMSTdeg,
    gstHours: GMSTdeg / 15, // 15° = 1 sidereal hour
    lstDeg: LSTdeg,
    lstHours: LSTdeg / 15,
  };
};

export const getHourAngle = (
  lst: number,
  ra: number,
  { inHours = false } = {},
) => {
  const circle = inHours ? 24 : 360; // full circle in chosen units
  // Normalize inputs to 0–circle
  const L = ((lst % circle) + circle) % circle;
  const A = ((ra % circle) + circle) % circle;
  const H = (L - A + circle) % circle; // wrap the difference
  return H; // hour angle
};

export const getAltitude = (args: {
  decDeg: number;
  latDeg: number;
  hourAngleDeg?: number;
  raDeg: number;
  lonDeg: number;
  date: Date;
}) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const { latDeg, decDeg } = args;
  let { hourAngleDeg } = args;

  // Branch B: derive hour angle on demand
  if (hourAngleDeg === undefined) {
    const { raDeg, date, lonDeg = 0 } = args;
    if (raDeg === undefined || date === undefined)
      throw new Error('Need either hourAngleDeg OR (raDeg, date, lonDeg).');

    // siderealTime() and hourAngle() are the helper functions we defined earlier
    const { lstDeg } = getSiderealTime(date, lonDeg);
    hourAngleDeg = getHourAngle(lstDeg, raDeg); // in degrees
  }

  // 1. Convert angles to radians
  const φ = toRad(latDeg); // observer latitude
  const δ = toRad(decDeg); // object declination
  const H = toRad(hourAngleDeg);

  // 2. Spherical-astronomy formula
  const sinAlt =
    Math.sin(φ) * Math.sin(δ) + Math.cos(φ) * Math.cos(δ) * Math.cos(H);

  // Guard against rounding outside ±1
  const sinAltClamped = Math.min(1, Math.max(-1, sinAlt));
  const altDeg = (Math.asin(sinAltClamped) * 180) / Math.PI;

  return {
    altDeg,
    sinAlt: sinAltClamped,
    cosAlt: Math.cos(Math.asin(sinAltClamped)), // sometimes handy
  };
};

// Required helper functions
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

function toDegrees(radians: number): number {
  return radians * (180 / Math.PI);
}

/**
 * Converts Alt-Az coordinates to RA-Dec in degrees.
 * @param alt Altitude in degrees
 * @param az Azimuth in degrees (measured from North, clockwise)
 * @param lat Observer's latitude in degrees
 * @param lon Observer's longitude in degrees
 * @param datetime JavaScript Date object in UTC
 * @returns Object with RA and Dec in degrees
 */
export const convertAltAzToRaDec = (
  alt: number,
  az: number,
  lat: number,
  lon: number,
  datetime: Date,
): { ra: number; dec: number } => {
  // Convert inputs to radians
  const altRad = toRadians(alt);
  const azRad = toRadians(az);
  const latRad = toRadians(lat);

  // Declination calculation
  const sinDec =
    Math.sin(altRad) * Math.sin(latRad) +
    Math.cos(altRad) * Math.cos(latRad) * Math.cos(azRad);
  const dec = Math.asin(sinDec);

  // Hour angle calculation
  const cosH =
    (Math.sin(altRad) - Math.sin(latRad) * sinDec) /
    (Math.cos(latRad) * Math.cos(dec));
  let H = Math.acos(cosH);

  // Adjust hour angle for azimuth direction
  if (Math.sin(azRad) > 0) {
    H = 2 * Math.PI - H;
  }

  // Local Sidereal Time (LST) in degrees
  const JD = datetime.getTime() / 86400000 + 2440587.5; // Julian Date
  const D = JD - 2451545.0; // Days since J2000
  const GMST = (280.46061837 + 360.98564736629 * D) % 360;
  const LST = (GMST + lon + 360) % 360; // Ensure positive

  // Right Ascension in degrees
  const ra = (LST - toDegrees(H) + 360) % 360;

  return {
    ra,
    dec: toDegrees(dec),
  };
};

// eslint-disable-next-line no-extend-native
Date.prototype.addHours = function (h: number) {
  this.setHours(12, 0, 0, 0);
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};
