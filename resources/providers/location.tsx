import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Linking, Platform } from "react-native";
import * as Location from "expo-location";
import { socket } from "./socket";
import { SocketEvents } from "../utils/global";
import { Storage } from "../utils";

const LocationContext = createContext(null);

export const LocationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let timeout: NodeJS.Timeout | undefined;

    const requestAndWatch = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        if (Platform.OS === "ios") {
          Linking.openURL("app-settings:");
        } else {
          Linking.openSettings();
        }
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        async (loc: any) => {
          const user = await Storage.get("user");
          if (user) {
            const coordinates = {
              latitude: loc?.coords?.latitude.toString(),
              longitude: loc?.coords?.longitude.toString(),
              user_id: user?.user?.id,
            };
            timeout = setTimeout(() => {
              socket.emit(SocketEvents.USER_LOCATION, coordinates);
            }, 5000);
          }
          setLocation(loc);
        }
      );
    };

    requestAndWatch();

    return () => {
      if (subscription) {
        subscription.remove();
        clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
