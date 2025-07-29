import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

const Notifications = {
  getNotifications: async (request: { user_id: number }) => {
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
};

export default Notifications;
