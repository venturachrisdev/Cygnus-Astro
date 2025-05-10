import { WebSocketService } from '@/services/web-socket.service';

const tppaSocket = new WebSocketService();
const eventsSocket = new WebSocketService();

export const initializeTPPASocket = (onMessage: (message: any) => void) => {
  tppaSocket.connect('/v2/tppa', onMessage);
};

export const initializeEventsSocket = (onMessage: (message: any) => void) => {
  eventsSocket.connect('/v2/socket', onMessage);
};

export const stopTPPAAlignment = () => {
  tppaSocket.send('stop-alignment');
};

export const startTPPAAlignment = () => {
  stopTPPAAlignment();
  tppaSocket.send('start-alignment');
};

export const pauseTPPAAlignment = () => {
  tppaSocket.send('pause-alignment');
};

export const resumeTPPAAlignment = () => {
  tppaSocket.send('resume-alignment');
};
