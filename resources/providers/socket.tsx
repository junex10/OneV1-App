import React, { createContext, useContext, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import Constants from "expo-constants";
import { SocketEvents, eventBus } from "../utils/global";
import { Storage } from "../utils";

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
  let interval: NodeJS.Timeout | undefined;

  useEffect(() => {
    socketRef.current = socket;

    // Listeners
    socket?.on(SocketEvents.NEW_MESSAGE, (data: any) =>
      eventBus.emit(SocketEvents.NEW_MESSAGE, data)
    );
    socket?.on(SocketEvents.NEW_PIC_MESSAGE, (data: any) =>
      eventBus.emit(SocketEvents.NEW_PIC_MESSAGE, data)
    );
    socket?.on(SocketEvents.EVENTS.NEW_EVENT_INCOMING, async (data: any) => {
      if (data.places?.length > 0) {
        const sendData = {
          places: data.places[0],
        };
        await Storage.set("current_event", sendData);
        eventBus.emit(SocketEvents.EVENTS.NEW_EVENT_INCOMING, sendData);
      } else {
        Storage.remove("current_event");
        eventBus.emit(SocketEvents.EVENTS.NEW_EVENT_INCOMING, null);
      }
    });

    // We check if there is any event that we're hosting coming out
    (async () => {
      const user = await Storage.get("user");
      if (user?.user?.id) {
        interval = setInterval(() => {
          socket.emit(SocketEvents.EVENTS.NEW_EVENT_INCOMING, {
            user_id: user?.user?.id,
          });
        }, 3000);
      }
    })();

    return () => {
      socket.disconnect();
      if (interval) clearInterval(interval);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
