import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { ActivityIndicator, View, StyleSheet } from "react-native";

const API = Constants.expoConfig?.extra?.API;

const SpinnerContext = createContext({
  spinner: false,
  setSpinner: (v: boolean) => {},
});

export const useSpinner = () => useContext(SpinnerContext);

export const api = axios.create({
  baseURL: API,
  timeout: 10000,
});

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [spinner, setSpinner] = useState(false);

  // Set up interceptors only once
  React.useEffect(() => {
    const req = api.interceptors.request.use(
      (config) => {
        setSpinner(true);
        return config;
      },
      (error) => {
        setSpinner(false);
        return Promise.reject(error);
      }
    );
    const res = api.interceptors.response.use(
      (response) => {
        setSpinner(false);
        return response;
      },
      (error) => {
        setSpinner(false);
        return Promise.reject(error);
      }
    );
    return () => {
      api.interceptors.request.eject(req);
      api.interceptors.response.eject(res);
    };
  }, []);

  return (
    <SpinnerContext.Provider value={{ spinner, setSpinner }}>
      {children}
      {spinner && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#FD3A73" />
        </View>
      )}
    </SpinnerContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
});
