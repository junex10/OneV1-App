import React, { useState } from "react";
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
import { Colors } from "./../../../resources/utils";

const PIC_SIZE = 56;

// Dummy data for testing
const mockChats = [
  {
    id: "1",
    username: "Alice",
    photo: "https://randomuser.me/api/portraits/women/1.jpg",
    lastMessage: "Hey, how are you doing today?",
  },
  {
    id: "2",
    username: "Bob",
    photo: "https://randomuser.me/api/portraits/men/2.jpg",
    lastMessage: "Let's catch up soon!",
  },
];

const ChatListScreen: React.FC = () => {
  const [chats] = useState(mockChats);
  const router = useRouter();

  const handlePressChat = (chat: (typeof mockChats)[0]) => {
    // Navigate to chat screen, pass chat id or data as needed
    router.push(`/src/chat/chat?id=${chat.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.blue_dark_2 }}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => handlePressChat(item)}
          >
            <Image source={{ uri: item.photo }} style={styles.pic} />
            <View style={styles.chatInfo}>
              <Text
                style={styles.username}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.username}
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
