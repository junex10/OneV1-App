import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

const GoogleMaps = {
  placesNearby: async (coordinates: Coordinates) => {
    try {
      const response = await api.post(
        `${API}app/map/placesNearby`,
        coordinates
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default GoogleMaps;
