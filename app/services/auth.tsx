import { Coordinates } from "./../interfaces";
import Constants from "expo-constants";
import { api } from "./../providers/api";

const API = Constants.expoConfig?.extra?.API;

interface NewUser {
  email: string;
  password: string;
  phone: string;
  photo?: any;
  username: string;
}

const Auth = {
  newUser: async (request: FormData) => {
    try {
      const response = await api.post(`${API}app/auth/register`, request, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  verifyUser: async (code: number) => {
    try {
      const response = await api.post(`${API}app/auth/verify`, { code });
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  verifyNewAccount: async (request: any) => {
    try {
      const response = await api.post(
        `${API}app/auth/verify-new-account`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  checkCode: async (request: any) => {
    try {
      const response = await api.post(`${API}app/auth/check-code`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  resetPassword: async (request: any) => {
    try {
      const response = await api.post(`${API}app/auth/reset`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default Auth;
