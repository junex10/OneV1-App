import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors, Storage } from "./../../../resources/utils";
import { ChatService } from "../../../resources/services";
import Constants from "expo-constants";

const PIC_SIZE = 56;
const server = Constants.expoConfig?.extra?.SERVER;

// Dummy data for testing

const ChatListScreen: React.FC = () => {
  const [chats, setChats] = useState<any>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const data = await ChatService.getChats(getUser?.user?.id);
      setChats(data?.chats);
    })();
  }, []);

  const handlePressChat = (otherUser: any) => {
    router.push({
      pathname: "src/chat/chat",
      params: {
        friend: JSON.stringify(otherUser),
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.blue_dark_2 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) =>
          item?.lastLog?.id?.toString() ?? Math.random().toString()
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handlePressChat(item.otherUser)}
            key={index}
          >
            <Image
              source={{
                uri: item?.otherUser?.photo
                  ? `${server}storage/${item?.otherUser?.photo}`
                  : `${server}img/random_location.jpg`,
              }}
              style={styles.pic}
            />
            <View style={styles.chatInfo}>
              <Text
                style={styles.username}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.otherUser.person.username}
              </Text>
              <Text
                style={styles.lastMessage}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.lastMessage}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors.purple}
              style={styles.arrow}
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 48,
    paddingBottom: 18,
    paddingHorizontal: 18,
    backgroundColor: Colors.blue_dark_2,
  },
  backBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listContainer: {
    paddingVertical: 12,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 18,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pic: {
    width: PIC_SIZE,
    height: PIC_SIZE,
    borderRadius: PIC_SIZE / 2,
    marginRight: 16,
    borderWidth: 2,
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
  },
  chatInfo: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 2,
  },
  lastMessage: {
    color: "#bfc3c9",
    fontSize: 15,
    opacity: 0.85,
  },
  arrow: {
    marginLeft: 8,
  },
});

export default ChatListScreen;
