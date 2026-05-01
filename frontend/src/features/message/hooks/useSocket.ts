import { io } from "socket.io-client";
import { useEffect, useMemo } from "react";

export const useSocket = (token: string) => {
  const socket = useMemo(() => {
    if (!token) return null;

    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

    const newSocket = io(socketUrl, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: false, 
    });

    newSocket.on("connect", () => {
      console.log("DEBUG: Socket connected to", socketUrl, "with ID:", newSocket.id);
    });

    newSocket.on("connect_error", (error) => {
      console.error("DEBUG: Socket connection error:", error.message);
    });

    return newSocket;
  }, [token]);

  useEffect(() => {
    if (socket) {
      console.log("DEBUG: useSocket effect connecting...");
      socket.connect();
      return () => {
        console.log("DEBUG: useSocket effect disconnecting...");
        socket.disconnect();
      };
    }
  }, [socket]);

  return socket;
};
