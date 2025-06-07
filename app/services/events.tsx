import { Coordinates } from "./../interfaces";
import Constants from "expo-constants";
import { api } from "./../providers/api";

const API = Constants.expoConfig?.extra?.API;

interface GetEventDTO {
  event_id: number;
}
interface GetEventsByUserDTO {
  user_id: number;
}

const Events = {
  getEvents: async (coordinates: Coordinates) => {
    try {
      const response = await api.post(
        `${API}app/events/getEvents`,
        coordinates
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  setEvent: async (event: FormData) => {
    try {
      const response = await api.post(`${API}app/events/setEvent`, event, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getEvent: async (request: GetEventDTO) => {
    try {
      const response = await api.post(`${API}app/events/getEvent`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getEventsByUser: async (request: GetEventsByUserDTO) => {
    try {
      const response = await api.post(
        `${API}app/events/getEventsByUser`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default Events;
