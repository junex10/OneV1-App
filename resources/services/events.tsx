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
interface GetAllMyEvents {
  user_id: number;
  latitude: number;
  longitude: number;
}

interface GetViewers {
  event_id: number;
  user_id?: number;
}
interface GetCommentsDTO {
  event_id: number;
  count_comments?: boolean;
  last_comment?: boolean;
}
interface GetAllPopularEvents {
  user_id?: number;
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
  getAllMyEvents: async (request: GetAllMyEvents) => {
    try {
      const response = await api.post(
        `${API}app/events/getAllMyEvents`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getAllPopularEvents: async (request: GetAllPopularEvents) => {
    try {
      const response = await api.post(
        `${API}app/events/getAllPopularEvents`,
        request
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getViewers: async (request: GetViewers) => {
    try {
      const response = await api.post(`${API}app/events/getViewers`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getComments: async (request: GetCommentsDTO) => {
    try {
      const response = await api.post(`${API}app/events/getComments`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default Events;
