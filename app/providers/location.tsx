import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';

const LocationContext = createContext(null);

export const LocationProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const requestAndWatch = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (Platform.OS === 'ios') {
          Linking.openURL('app-settings:');
        } else {
          Linking.openSettings();
        }
        return;
      }

      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (loc: any) => setLocation(loc)
      );
    };

    requestAndWatch();

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return (
    <LocationContext.Provider value={location}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);