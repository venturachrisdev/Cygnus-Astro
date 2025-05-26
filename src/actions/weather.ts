import Axios from 'axios';

import { useWeatherStore } from '@/stores/weather.store';

import { getApiUrl } from './hosts';

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
      cloudCover: response.Response.CloudCover,
      dewPoint: response.Response.DewPoint,
      humidity: response.Response.Humidity,
      pressure: response.Response.Pressure,
      rainRate: response.Response.RainRate,
      skyBrightness: response.Response.SkyBrightness,
      skyQuality: response.Response.SkyQuality,
      skyTemperature: response.Response.SkyTemperature,
      starFWHM: response.Response.StarFWHM,
      temperature: response.Response.Temperature,
      windDirection: response.Response.WindDirection,
      windGust: response.Response.WindGust,
      windSpeed: response.Response.WindSpeed,
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

export const connectWeather = async (id: string) => {
  try {
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
