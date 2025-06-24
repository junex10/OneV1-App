import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

interface GetEventDTO {
  event_id: number;
}
interface GetEventsByUserDTO {
  user_id: number;
}
interface SetEventDTO {
  title: string;
  user_id: number;
  event_type_id: number;
  main_pic: any;
  content: string;
  latitude: number;
  longitude: number;
  expiration_time?: Date;
  starting_event?: Date;
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
  setEvent: async (event: SetEventDTO) => {
    try {
      const response = await api.post(`${API}app/events/setEvent`, event);
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
  getEventsType: async () => {
    try {
      const response = await api.post(`${API}app/events/getEventsType`);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getEventsTypeById: async (event_type_id: number) => {
    try {
      const response = await api.post(`${API}app/events/getEventsTypeById`, {
        event_type_id,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default Events;
