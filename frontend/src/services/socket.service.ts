import { io, Socket } from "socket.io-client";

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  public getSocket(token: string): Socket {
    const socketUrl = import.meta.env.VITE_API_URL || "";

    if (this.socket && this.token === token) {
      return this.socket;
    }

    if (this.socket) {
      this.socket.disconnect();
    }

    this.token = token;
    this.socket = io(socketUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    this.socket.on("connect", () => {
      console.log("DEBUG: Socket connected as singleton", this.socket?.id);
    });

    this.socket.on("connect_error", (error) => {
      console.error("DEBUG: Socket connection error:", error.message);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("DEBUG: Socket disconnected", reason);
    });

    return this.socket;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.token = null;
    }
  }
}

export const socketService = new SocketService();
