import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "../../../services/socket.service";

export const useSocket = (token: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      socketService.disconnect();
      setSocket(null);
      return;
    }

    const s = socketService.getSocket(token);
    setSocket(s);

    {}
    return () => {
      {}
    };
  }, [token]);

  return socket;
};
