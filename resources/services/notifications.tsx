import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

interface NotificationDTO {
  user_id: number;
}

const Notifications = {
  getNotifications: async (request: NotificationDTO) => {
    try {
      const response = await api.post(
        `${API}app/notifications/getNotifications`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getCountNotifications: async (request: NotificationDTO) => {
    try {
      const response = await api.post(
        `${API}app/notifications/getCountNotifications`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  readNotifications: async (request: NotificationDTO) => {
    try {
      const response = await api.post(
        `${API}app/notifications/readNotifications`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default Notifications;
