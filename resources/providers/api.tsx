import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import Constants from "expo-constants";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { CustomModal, Storage, Colors } from "../utils";
import { useRouter } from "expo-router";

const API = Constants.expoConfig?.extra?.API;

const SpinnerContext = createContext({
  spinner: false,
  setSpinner: (v: boolean) => {},
});

export const useSpinner = () => useContext(SpinnerContext);

export const api = axios.create({
  baseURL: API,
  timeout: 60000,
});

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [spinner, setSpinner] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Set up interceptors only once
  React.useEffect(() => {
    const req = api.interceptors.request.use(
      async (config) => {
        setSpinner(true);
        try {
          const user = await Storage.get("user");
          if (user && user.token) {
            config.headers = config.headers || {};
            config.headers["authorization"] = user.token;
          }
        } catch (e) {
          // ignore storage errors
        }
        return config;
      },
      (error) => {
        setSpinner(false);
        return Promise.reject(error);
      }
    );
    const res = api.interceptors.response.use(
      async (response) => {
        setSpinner(false);
        if (response?.status === 204) {
          //await Storage.remove("user");
          setSessionExpired(true);
          setShouldRedirect(true);
        }
        return response;
      },
      (error) => {
        setSpinner(false);
        if (error?.response?.status === 403) {
          setModalMessage("You do not have permission to access this screen.");
          setModalVisible(true);
          setShouldRedirect(true);
        }
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
          <ActivityIndicator size="large" color={Colors.purple} />
        </View>
      )}
      <CustomModal
        visible={modalVisible}
        iconName="warning"
        title="Access Denied"
        message={modalMessage}
        onClose={() => {
          setModalVisible(false);
          if (shouldRedirect) {
            setShouldRedirect(false);
            router.replace("/src/map/map");
          }
        }}
        timeout={3000}
      />
      <CustomModal
        visible={sessionExpired}
        iconName="warning"
        title="Session Expired"
        message="Your session has expired. Please log in again."
        onClose={() => {
          setSessionExpired(false);
          if (shouldRedirect) {
            setShouldRedirect(false);
            router.replace("/");
          }
        }}
        timeout={3000}
      />
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
