import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
  Dimensions,
} from "react-native";
import { Colors } from "../../../resources/utils/global";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Storage } from "../../../resources/utils";

const { width, height } = Dimensions.get("window");

const bgImage =
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80";

const comments = [
  {
    id: "1",
    user: {
      name: "Jenny Walton",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    text: "Awesome Love it ! ❤️",
  },
  {
    id: "2",
    user: {
      name: "Stila Mathew",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
    text: "Awesome !",
  },
  {
    id: "my-comment",
    user: {
      name: "You",
      avatar: "https://randomuser.me/api/portraits/men/99.jpg",
    },
    text: "This is how my comment looks!",
    mine: true,
  },
];

const eventUser = {
  name: "Hollan Martino",
  avatar: "https://randomuser.me/api/portraits/women/65.jpg",
};

const CurrentEventChat: React.FC = () => {
  const router = useRouter();
  const { current_event } = useLocalSearchParams();

  const [elapsed, setElapsed] = useState("00:00:00");
  const [user, setUser] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  useEffect(() => {
    // Fake timer for UI
    let seconds = 8 * 60 + 35; // 8 minutes, 35 seconds
    setElapsed(formatTime(seconds));
    const interval = setInterval(() => {
      seconds++;
      setElapsed(formatTime(seconds));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    const eventForm = current_event
      ? JSON.parse(current_event as string)
      : null;
    setCurrentEvent(eventForm);
    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);
    })();
  }, []);

  return (
    <ImageBackground source={{ uri: bgImage }} style={styles.bg}>
      {/* Top Bar with avatar, name, timer, close */}
      <View style={styles.topBarFull}>
        <Image source={{ uri: eventUser.avatar }} style={styles.avatar} />
        <View style={styles.topBarTextContainer}>
          <Text style={styles.userName}>{eventUser.name}</Text>
          <Text style={styles.time}>{elapsed}</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Share Button */}
      {/*<TouchableOpacity style={styles.shareBtn}>
        <Text style={styles.shareBtnText}>Share with Friend</Text>
      </TouchableOpacity>*/}

      {/* Comments */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        style={styles.commentsList}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => (
          <View
            style={[
              styles.commentRow,
              item.mine && { flexDirection: "row-reverse" },
            ]}
          >
            <Image
              source={{ uri: item.user.avatar }}
              style={[
                styles.commentAvatar,
                item.mine && {
                  borderColor: Colors.purple,
                  marginLeft: 10,
                  marginRight: 0,
                },
              ]}
            />
            <View
              style={[
                styles.commentBubble,
                item.mine && {
                  backgroundColor: Colors.purple,
                  opacity: 0.85,
                  alignItems: "flex-end",
                },
              ]}
            >
              <Text
                style={[styles.commentUser, item.mine && { color: "#fff" }]}
              >
                {item.user.name}
              </Text>
              <Text
                style={[styles.commentText, item.mine && { color: "#fff" }]}
              >
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Floating hearts */}
      <View style={styles.heartsContainer}>
        <Text style={styles.heart}>❤️</Text>
        <Text style={[styles.heart, { left: 30, top: 30, fontSize: 18 }]}>
          ❤️
        </Text>
        <Text style={[styles.heart, { left: 60, top: 10, fontSize: 16 }]}>
          ❤️
        </Text>
      </View>

      {/* Comment Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Write a Comment..."
          placeholderTextColor={Colors.gray}
        />
        <TouchableOpacity style={styles.sendBtn}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width,
    height,
    justifyContent: "flex-end",
  },
  topBarFull: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 10,
    backgroundColor: "rgba(24,31,42,0.55)",
  },
  topBarTextContainer: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "center",
  },
  userName: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  time: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 2,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.purple,
    marginLeft: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  shareBtn: {
    alignSelf: "flex-start",
    marginTop: 24,
    marginLeft: 18,
    backgroundColor: Colors.purple,
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 22,
    elevation: 2,
  },
  shareBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  commentsList: {
    maxHeight: height * 0.8,
    marginTop: 24,
    marginHorizontal: 0,
    marginBottom: 0,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 18,
    marginBottom: 14,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  commentBubble: {
    backgroundColor: "rgba(24,31,42,0.85)",
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 14,
    maxWidth: width * 0.7,
  },
  commentUser: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 2,
  },
  commentText: {
    color: "#fff",
    fontSize: 13,
  },
  heartsContainer: {
    position: "absolute",
    right: 24,
    bottom: 110,
    zIndex: 10,
  },
  heart: {
    position: "absolute",
    color: Colors.purple,
    fontSize: 22,
    opacity: 0.8,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(24,31,42,0.95)",
    borderRadius: 22,
    margin: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  sendBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  eventTitleBar: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    paddingTop: 38,
    paddingBottom: 12,
    alignItems: "center",
    backgroundColor: "rgba(24,31,42,0.55)",
    zIndex: 20,
  },
  eventTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  eventTime: {
    color: Colors.gray,
    fontSize: 13,
    marginTop: 2,
  },
});
export default CurrentEventChat;
