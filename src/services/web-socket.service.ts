import { getApiUrl } from '@/actions/hosts';

export class WebSocketService {
  socket: WebSocket | null = null;

  async getSocketUrl(): Promise<string> {
    return `ws://${await getApiUrl(true, false)}`;
  }

  async connect(endpoint: string, onMessage: (message: any) => void) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Skipping connection. Socket is connected');
      return;
    }

    const url = `${await this.getSocketUrl()}${endpoint}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log(`Socket connected to ${url}`);
    };

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Socket Message', message);
      onMessage(message);
    };

    this.socket.onerror = (error) => {
      console.log('Socket Error', error);
    };

    this.socket.onclose = () => {
      console.log('Socket has been closed');
    };
  }

  send(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      console.log('Sending', message);
      this.socket.send(
        typeof message === 'string' ? message : JSON.stringify(message),
      );
    } else {
      console.log('Attempting to send message to closed socket');
    }
  }
}
