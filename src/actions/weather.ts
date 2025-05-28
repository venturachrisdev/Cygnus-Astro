import Axios from 'axios';

import { useWeatherStore } from '@/stores/weather.store';

import { getApiUrl } from './hosts';

export const parseNaNValue = (
  value: string | number,
): string | number | undefined => {
  if (value === 'NaN') {
    return undefined;
  }

  return value;
};

export const getWeatherInfo = async () => {
  const weatherState = useWeatherStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/weather/info`)
    ).data;

    if (response.Response?.DeviceId) {
      weatherState.set({
        currentDevice: {
          id: response.Response.DeviceId,
          name: response.Response.DisplayName,
        },
      });
    }

    weatherState.set({
      isConnected: response.Response.Connected,
      cloudCover: parseNaNValue(response.Response.CloudCover),
      dewPoint: parseNaNValue(response.Response.DewPoint),
      humidity: parseNaNValue(response.Response.Humidity),
      pressure: parseNaNValue(response.Response.Pressure),
      rainRate: parseNaNValue(response.Response.RainRate),
      skyBrightness: parseNaNValue(response.Response.SkyBrightness),
      skyQuality: parseNaNValue(response.Response.SkyQuality),
      skyTemperature: parseNaNValue(response.Response.SkyTemperature),
      starFWHM: parseNaNValue(response.Response.StarFWHM),
      temperature: parseNaNValue(response.Response.Temperature),
      windDirection: parseNaNValue(response.Response.WindDirection),
      windGust: parseNaNValue(response.Response.WindGust),
      windSpeed: parseNaNValue(response.Response.WindSpeed),
    });
  } catch (e) {
    console.log('Error getting weather', e);
  }
};

export const listWeatherDevices = async () => {
  const weatherState = useWeatherStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/weather/list-devices`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    weatherState.set({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting weather', e);
  }
};

export const rescanWeatherDevices = async () => {
  const weatherState = useWeatherStore.getState();

  try {
    const response = (
      await Axios.get(`${await getApiUrl()}/equipment/weather/rescan`)
    ).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    weatherState.set({ devices });
    await getWeatherInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting weather', e);
  }
};

export const connectWeather = async () => {
  try {
    const weatherState = useWeatherStore.getState();
    const id = weatherState.currentDevice?.id;

    if (!id) {
      return;
    }
    console.log('Connecting to', id);
    await Axios.get(`${await getApiUrl()}/equipment/weather/connect`, {
      params: {
        to: id,
      },
    });
    await getWeatherInfo();
  } catch (e) {
    console.log('Error getting weather', e);
  }
};

export const disconnectWeather = async () => {
  try {
    await Axios.get(`${await getApiUrl()}/equipment/weather/disconnect`);
    await getWeatherInfo();
  } catch (e) {
    console.log('Error getting weather', e);
  }
};
