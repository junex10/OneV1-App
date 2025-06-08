import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

const ProfileService = {
  update: async (event: FormData) => {
    try {
      const response = await api.post(`${API}app/profile/update`, event, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default ProfileService;
