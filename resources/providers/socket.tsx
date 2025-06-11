import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { SocketEvents } from "../utils/global";
import { eventBus } from "../utils/global";

const SOCKET_URL = Constants.expoConfig?.extra?.SERVER; // Change to your backend URL

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const socket = io(SOCKET_URL, {
  transports: ["websocket"],
  autoConnect: true,
});
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = socket;

    // Listeners
    socket?.on(SocketEvents.NEW_MESSAGE, (data: any) =>
      eventBus.emit(SocketEvents.NEW_MESSAGE, data)
    );

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
