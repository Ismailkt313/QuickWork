import { useEffect, useMemo } from "react";
import { Socket } from "socket.io-client";
import { socketService } from "../../../services/socket.service";

export const useSocket = (token: string) => {
  useEffect(() => {
    if (!token) {
      socketService.disconnect();
    }
  }, [token]);

  const socket = useMemo(() => {
    if (!token) return null;
    return socketService.getSocket(token);
  }, [token]);

  return socket as Socket | null;
};
