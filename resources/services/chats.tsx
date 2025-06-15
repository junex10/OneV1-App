import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

interface GetLogsDTO {
  user_id: number;
  other_user_id: number;
}

const ChatService = {
  getLogs: async (request: GetLogsDTO) => {
    try {
      const response = await api.post(`${API}app/chat/getLogs`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getChats: async (user_id: number) => {
    try {
      const response = await api.post(`${API}app/chat/getChats`, { user_id });
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default ChatService;
