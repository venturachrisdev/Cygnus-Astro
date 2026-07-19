import { WebSocketService } from '@/services/web-socket.service';
import { useTPPAStore } from '@/stores/tppa.store';

const tppaSocket = new WebSocketService();
const eventsSocket = new WebSocketService();

export const initializeTPPASocket = (onMessage: (message: any) => void) => {
  tppaSocket.connect('/v2/tppa', onMessage);
};

export const initializeEventsSocket = (onMessage: (message: any) => void) => {
  eventsSocket.connect('/v2/socket', onMessage);
};

export const disconnectTPPASocket = () => {
  tppaSocket.disconnect();
};

export const disconnectEventsSocket = () => {
  eventsSocket.disconnect();
};

/* Settings accepted by the start-alignment JSON payload. Anything omitted falls
   back to the TPPA plugin's configured defaults. */
export interface TPPAStartSettings {
  StartFromCurrentPosition?: boolean;
  TargetDistance?: number;
}

/* The bare-string commands are deprecated by the Advanced API in favour of a
   JSON payload ({ Action, ...settings }); send the JSON form. */
export const stopTPPAAlignment = () => {
  tppaSocket.send({ Action: 'stop-alignment' });
};

export const startTPPAAlignment = (settings: TPPAStartSettings = {}) => {
  stopTPPAAlignment();
  tppaSocket.send({ Action: 'start-alignment', ...settings });
};

export const pauseTPPAAlignment = () => {
  tppaSocket.send({ Action: 'pause-alignment' });
};

export const resumeTPPAAlignment = () => {
  tppaSocket.send({ Action: 'resume-alignment' });
};

/* The TPPA socket sends one of three Response shapes (Advanced API >= 2.2.4.1):
   a procedure confirmation string, an alignment-error object, or - added in the
   2025-09 plugin update - a progress object with Status and Progress. */
type TPPAProcedureResponse =
  | 'started procedure'
  | 'stopped procedure'
  | 'paused procedure'
  | 'resumed procedure';

interface TPPAAlignmentError {
  AzimuthError: number;
  AltitudeError: number;
  TotalError: number;
}

interface TPPAProgress {
  Status: string;
  Progress: number;
}

export interface TPPASocketMessage {
  Response: TPPAProcedureResponse | TPPAAlignmentError | TPPAProgress;
}

export interface TPPAEventMessage {
  Response?: { Event?: string };
}

export const handleTPPAMessage = (message: TPPASocketMessage) => {
  const tppaState = useTPPAStore.getState();
  const { Response } = message;

  if (Response === 'started procedure') {
    tppaState.set({
      altitudeError: 0,
      azimuthError: 0,
      totalError: 0,
      status: null,
      progress: 0,
      didPlatesolveFail: false,
      isRunning: true,
      isPaused: false,
    });
  } else if (Response === 'stopped procedure') {
    tppaState.set({
      didPlatesolveFail: false,
      isRunning: false,
      isPaused: false,
      status: null,
      progress: 0,
    });
  } else if (Response === 'paused procedure') {
    tppaState.set({ isRunning: true, isPaused: true });
  } else if (Response === 'resumed procedure') {
    tppaState.set({ isRunning: true, isPaused: false });
  } else if (typeof Response === 'object' && Response !== null) {
    if ('TotalError' in Response) {
      tppaState.set({
        isRunning: true,
        isPaused: true,
        altitudeError: Response.AltitudeError,
        azimuthError: Response.AzimuthError,
        totalError: Response.TotalError,
      });
      pauseTPPAAlignment();
    } else if ('Status' in Response) {
      tppaState.set({
        isRunning: true,
        status: Response.Status,
        progress: Response.Progress,
      });
    }
  }
};

export const handleTPPAEventMessage = (message: TPPAEventMessage) => {
  if (message.Response?.Event === 'ERROR-PLATESOLVE') {
    useTPPAStore.getState().set({ didPlatesolveFail: true });
  }
};
