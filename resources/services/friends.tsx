import { Coordinates } from "./../../resources/interfaces";
import Constants from "expo-constants";
import { api } from "./../../resources/providers/api";

const API = Constants.expoConfig?.extra?.API;

interface GetFriendsDTO {
  user_id: number;
}
interface SetFriendsDTO {
  sender_id: number;
  receiver_id: number;
  status: number;
}

const FriendService = {
  setFriend: async (request: SetFriendsDTO) => {
    try {
      const response = await api.post(`${API}app/friends/setFriend`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
  getFriends: async (request: GetFriendsDTO) => {
    try {
      const response = await api.post(`${API}app/friends/getFriends`, request);
      return response.data;
    } catch (error) {
      console.error("Error fetching places:", error);
      throw error;
    }
  },
};

export default FriendService;
