import Axios from "axios";
import { API_MOUNT_CONNECT, API_MOUNT_DISCONNECT, API_MOUNT_HOME, API_MOUNT_INFO, API_MOUNT_LIST, API_MOUNT_PARK, API_MOUNT_RESCAN, API_MOUNT_UNPARK, API_URL } from "./constants";
import { useMountStore } from "@/stores/mount.store";

export const getMountInfo = async () => {
  const mountState = useMountStore.getState();

  try {
    const response = (await Axios.get(`${API_URL}/${API_MOUNT_INFO}`)).data;
    mountState.setMount({
      isParked: response.Response.AtPark,
      isSlewing: response.Response.Slewing,
      isConnected: response.Response.Connected,
      isHome: response.Response.AtHome,
      isTracking: response.Response.TrackingEnabled,
    });

    mountState.setCurrentDevice({
      id: response.Response.DeviceId,
      name: response.Response.DisplayName,
    });

    return response.Response;
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const listMountDevices = async () => {
  const mountState = useMountStore.getState();

  try {
    const response = (await Axios.get(`${API_URL}/${API_MOUNT_LIST}`)).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    mountState.setMount({ devices });

    return response.Response;
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const rescanMountDevices = async () => {
  const mountState = useMountStore.getState();

  try {
    const response = (await Axios.get(`${API_URL}/${API_MOUNT_RESCAN}`)).data;
    const devices = response.Response.map((device: any) => ({
      id: device.Id,
      name: device.DisplayName,
    }));

    mountState.setMount({ devices });
    await getMountInfo();

    return response.Response;
  } catch (e) {
    console.log('Error getting mount', e);
  }
};


export const connectMount = async (id: string) => {
  try {
    console.log('Connecting to', id);
    await Axios.get(`${API_URL}/${API_MOUNT_CONNECT}?to=${id}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const disconnectMount = async () => {
  try {
    await Axios.get(`${API_URL}/${API_MOUNT_DISCONNECT}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};


export const homeMount = async () => {
  try {
    await Axios.get(`${API_URL}/${API_MOUNT_HOME}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const parkMount = async () => {
  try {
    await Axios.get(`${API_URL}/${API_MOUNT_PARK}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};

export const unParkMount = async () => {
  try {
    await Axios.get(`${API_URL}/${API_MOUNT_UNPARK}`);
    await getMountInfo();
  } catch (e) {
    console.log('Error getting mount', e);
  }
};