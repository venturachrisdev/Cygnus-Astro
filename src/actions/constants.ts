// Camera
export const API_CAMERA_CAPTURE = 'equipment/camera/capture';
export const API_CAMERA_ABORT = 'equipment/camera/abort-exposure';
export const API_CAMERA_INFO = 'equipment/camera/info';
export const API_CAMERA_LIST = 'equipment/camera/list-devices';
export const API_CAMERA_RESCAN = 'equipment/camera/rescan';
export const API_CAMERA_CONNECT = 'equipment/camera/connect';
export const API_CAMERA_DISCONNECT = 'equipment/camera/disconnect';

// Filterwheel
export const API_FILTERWHEEL_INFO = 'equipment/filterwheel/info';
export const API_FILTERWHEEL_CHANGE = 'equipment/filterwheel/change-filter';
export const API_FILTERWHEEL_LIST = 'equipment/filterwheel/list-devices';
export const API_FILTERWHEEL_RESCAN = 'equipment/filterwheel/rescan';
export const API_FILTERWHEEL_CONNECT = 'equipment/filterwheel/connect';
export const API_FILTERWHEEL_DISCONNECT = 'equipment/filterwheel/disconnect';

// Focuser
export const API_FOCUSER_INFO = 'equipment/focuser/info';
export const API_FOCUSER_MOVE = 'equipment/focuser/move';
export const API_FOCUSER_LIST = 'equipment/focuser/list-devices';
export const API_FOCUSER_RESCAN = 'equipment/focuser/rescan';
export const API_FOCUSER_CONNECT = 'equipment/focuser/connect';
export const API_FOCUSER_DISCONNECT = 'equipment/focuser/disconnect';
export const API_FOCUSER_AUTOFOCUS = 'equipment/focuser/auto-focus';

// Mount
export const API_MOUNT_INFO = 'equipment/mount/info';
export const API_MOUNT_CONNECT = 'equipment/mount/connect';
export const API_MOUNT_DISCONNECT = 'equipment/mount/disconnect';
export const API_MOUNT_LIST = 'equipment/mount/list-devices';
export const API_MOUNT_RESCAN = 'equipment/mount/rescan';
export const API_MOUNT_HOME = 'equipment/mount/home';
export const API_MOUNT_PARK = 'equipment/mount/park';
export const API_MOUNT_UNPARK = 'equipment/mount/unpark';

// Guider
export const API_GUIDER_INFO = 'equipment/guider/info';
export const API_GUIDER_LIST = 'equipment/guider/list-devices';
export const API_GUIDER_RESCAN = 'equipment/guider/rescan';
export const API_GUIDER_CONNECT = 'equipment/guider/connect';
export const API_GUIDER_DISCONNECT = 'equipment/guider/disconnect';
export const API_GUIDER_START = 'equipment/guider/start';
export const API_GUIDER_STOP = 'equipment/guider/stop';

// Sequence
export const API_SEQUENCE_STATE = '/sequence/state';
export const API_SEQUENCE_START = '/sequence/start';
export const API_SEQUENCE_STOP = '/sequence/stop';

// Helpers
export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface Device {
  id: string;
  name: string;
}
