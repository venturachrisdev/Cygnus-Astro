export const API_URL = "http://10.0.0.250:1888/v2/api";

// Camera
export const API_CAMERA_CAPTURE = "equipment/camera/capture";
export const API_CAMERA_ABORT = "equipment/camera/abort-exposure";
export const API_CAMERA_INFO = "equipment/camera/info";

// Filterwheel
export const API_FILTERWHEEL_INFO = "equipment/filterwheel/info";
export const API_FILTERWHEEL_CHANGE = "equipment/filterwheel/change-filter";

// Focuser
export const API_FOCUSER_INFO = "equipment/focuser/info";
export const API_FOCUSER_MOVE = "equipment/focuser/move";

// Mount
export const API_MOUNT_INFO = "equipment/mount/info";
export const API_MOUNT_CONNECT  = "equipment/mount/connect";
export const API_MOUNT_DISCONNECT = "equipment/mount/disconnect";
export const API_MOUNT_LIST = "equipment/mount/list-devices";
export const API_MOUNT_RESCAN = "equipment/mount/rescan";
export const API_MOUNT_HOME = "equipment/mount/home";
export const API_MOUNT_PARK = "equipment/mount/park";
export const API_MOUNT_UNPARK = "equipment/mount/unpark";


// Helpers
export const sleep = async (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
