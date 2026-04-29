import { io } from "socket.io-client";
import { useEffect, useMemo } from "react";

export const useSocket = (token: string) => {
  const socket = useMemo(() => {
    if (!token) return null;

    const newSocket = io("http://localhost:5000", {
      auth: {
        token,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    return newSocket;
  }, [token]);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return socket;
};
