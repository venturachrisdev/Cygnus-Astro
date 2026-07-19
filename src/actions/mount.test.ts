import {
  calculateAltitude,
  convertAltAzToRaDec,
  convertDegreesToDMS,
  convertDegreesToHMS,
  convertDMStoDegrees,
  convertHMStoDegrees,
  getAltitude,
  getHourAngle,
  getSiderealTime,
} from '@/actions/mount';

describe('convertHMStoDegrees', () => {
  it('converts an "h m s" right ascension to degrees', () => {
    expect(convertHMStoDegrees('12h 00m 00s')).toBe(180);
    expect(convertHMStoDegrees('06h 30m 00s')).toBe(97.5);
    expect(convertHMStoDegrees('00h 00m 00s')).toBe(0);
  });

  it('converts a colon-separated right ascension when useColon is set', () => {
    expect(convertHMStoDegrees('18:00:00', true)).toBe(270);
  });

  it('returns 0 for an unparseable input', () => {
    expect(convertHMStoDegrees('not a coordinate')).toBe(0);
  });
});

describe('convertDMStoDegrees', () => {
  it('converts a signed DMS declination to degrees', () => {
    expect(convertDMStoDegrees('+45° 00′ 00″')).toBe(45);
    expect(convertDMStoDegrees('-30° 30′ 00″')).toBe(-30.5);
  });

  it('converts a colon-separated declination when useColon is set', () => {
    expect(convertDMStoDegrees('45:30:00', true)).toBe(45.5);
    expect(convertDMStoDegrees('-10:00:00', true)).toBe(-10);
  });

  it('returns 0 for an unparseable input', () => {
    expect(convertDMStoDegrees('not a coordinate')).toBe(0);
  });
});

describe('convertDegreesToHMS', () => {
  it('formats whole hours as HH:MM:SS', () => {
    expect(convertDegreesToHMS(180)).toBe('12:00:00');
    expect(convertDegreesToHMS(0)).toBe('00:00:00');
  });
});

describe('convertDegreesToDMS', () => {
  it('formats positive degrees', () => {
    expect(convertDegreesToDMS(45)).toBe("45° 00' 00''");
  });

  it('formats negative degrees with a leading sign', () => {
    expect(convertDegreesToDMS(-45.5)).toBe("-45° 30' 00''");
  });
});

describe('calculateAltitude', () => {
  it('returns the zenith (90°) when dec and hour angle are zero on the equator', () => {
    expect(calculateAltitude(0, 0, 0)).toBeCloseTo(90, 5);
  });

  it('equals the declination at the pole regardless of hour angle', () => {
    expect(calculateAltitude(90, 45, 123)).toBeCloseTo(45, 5);
  });
});

describe('getSiderealTime', () => {
  const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));

  it('matches the known GMST at the J2000 epoch (~280.46°)', () => {
    expect(getSiderealTime(j2000).gstDeg).toBeCloseTo(280.46, 1);
  });

  it('keeps local sidereal time within [0, 360)', () => {
    const { lstDeg, lstHours } = getSiderealTime(j2000, 123);
    expect(lstDeg).toBeGreaterThanOrEqual(0);
    expect(lstDeg).toBeLessThan(360);
    expect(lstHours).toBeCloseTo(lstDeg / 15, 6);
  });

  it('shifts local sidereal time by the observer longitude', () => {
    const base = getSiderealTime(j2000, 0).lstDeg;
    const shifted = getSiderealTime(j2000, 30).lstDeg;
    expect((shifted - base + 360) % 360).toBeCloseTo(30, 5);
  });
});

describe('getHourAngle', () => {
  it('wraps the LST minus RA difference into a full circle of degrees', () => {
    expect(getHourAngle(100, 40)).toBe(60);
    expect(getHourAngle(10, 350)).toBe(20);
    expect(getHourAngle(40, 100)).toBe(300);
  });

  it('supports an hours-based circle', () => {
    expect(getHourAngle(2, 1, { inHours: true })).toBe(1);
  });
});

describe('getAltitude', () => {
  it('returns 90° at the zenith when the hour angle is supplied directly', () => {
    const result = getAltitude({
      latDeg: 0,
      decDeg: 0,
      hourAngleDeg: 0,
      raDeg: 0,
      lonDeg: 0,
      date: new Date(Date.UTC(2024, 5, 1, 0, 0, 0)),
    });
    expect(result.altDeg).toBeCloseTo(90, 5);
    expect(result.sinAlt).toBeCloseTo(1, 5);
  });

  it('derives the hour angle from RA and date when it is not supplied', () => {
    const result = getAltitude({
      latDeg: 45,
      decDeg: 20,
      raDeg: 180,
      lonDeg: 0,
      date: new Date(Date.UTC(2024, 5, 1, 0, 0, 0)),
    });
    expect(Number.isFinite(result.altDeg)).toBe(true);
    expect(result.altDeg).toBeGreaterThanOrEqual(-90);
    expect(result.altDeg).toBeLessThanOrEqual(90);
    expect(result.sinAlt).toBeGreaterThanOrEqual(-1);
    expect(result.sinAlt).toBeLessThanOrEqual(1);
  });
});

describe('convertAltAzToRaDec', () => {
  it('returns finite RA in [0, 360) and Dec in [-90, 90]', () => {
    const { ra, dec } = convertAltAzToRaDec(
      45,
      180,
      40,
      -74,
      new Date(Date.UTC(2024, 5, 1, 3, 0, 0)),
    );
    expect(Number.isFinite(ra)).toBe(true);
    expect(ra).toBeGreaterThanOrEqual(0);
    expect(ra).toBeLessThan(360);
    expect(dec).toBeGreaterThanOrEqual(-90);
    expect(dec).toBeLessThanOrEqual(90);
  });
});

describe('Date.prototype.addHours', () => {
  it('resets to local noon and adds the given hours', () => {
    const date = new Date(2026, 0, 1, 8, 30, 15);
    date.addHours(3);
    expect(date.getHours()).toBe(15);
    expect(date.getMinutes()).toBe(0);
    expect(date.getSeconds()).toBe(0);
  });

  it('mutates and returns the same date instance', () => {
    const date = new Date(2026, 0, 1);
    expect(date.addHours(0)).toBe(date);
    expect(date.getHours()).toBe(12);
  });
});
