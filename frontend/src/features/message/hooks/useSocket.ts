import {io,Socket} from "socket.io-client";
import { useEffect, useRef } from "react";

export const useSocket = (token: string) => {
    const socketRef = useRef<Socket | null>(null);
    
    useEffect(() => {
        socketRef.current = io("http://localhost:5000", {
            auth: {
                token
            }
        });
        socketRef.current.on("connect", () => {
            console.log("Connected to socket server");
        });
        return () => {
            socketRef.current?.disconnect();
        };
    }, [token]);
    
    return socketRef.current;
}