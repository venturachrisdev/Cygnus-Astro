import { getApiUrl } from '@/actions/hosts';
import { useAlertsStore } from '@/stores/alerts.store';

export class WebSocketService {
  socket: WebSocket | null = null;

  async getSocketUrl(): Promise<string> {
    return `ws://${await getApiUrl(true, false)}`;
  }

  async disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket');
      this.socket.close();
    }
  }

  async connect(endpoint: string, onMessage: (message: any) => void) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      const url = `${await this.getSocketUrl()}${endpoint}`;
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log(`Socket connected to ${url}`);
      };

      this.socket.onerror = (error) => {
        console.log('Socket Error', error);
      };

      this.socket.onclose = () => {
        console.log('Socket has been closed');
      };
    }

    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Socket Message', message);
      onMessage(message);
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
      const alertState = useAlertsStore.getState();
      alertState.set({
        message: 'Error communicating with the server. Please try again',
        type: 'error',
      });
    }
  }
}
