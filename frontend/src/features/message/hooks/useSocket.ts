import {io, Socket} from "socket.io-client";
import { useEffect, useState } from "react";

export const useSocket = (token: string) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    
    useEffect(() => {
        if (!token) return;

        const newSocket = io("http://localhost:5000", {
            auth: {
                token
            }
        });
        
        newSocket.on("connect", () => {
            console.log("Connected to socket server");
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);
    
    return socket;
}