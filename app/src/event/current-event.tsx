import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Colors } from "../../../resources/utils/global";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Storage } from "../../../resources/utils";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Dummy data
const stories = [
  {
    id: "1",
    name: "Thomas",
    profile_pic: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Mike",
    profile_pic: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: "3",
    name: "Kevin",
    profile_pic: "https://randomuser.me/api/portraits/men/12.jpg",
  },
  {
    id: "4",
    name: "Victor",
    profile_pic: "https://randomuser.me/api/portraits/men/76.jpg",
  },
  {
    id: "5",
    name: "Mildred",
    profile_pic: "https://randomuser.me/api/portraits/men/85.jpg",
  },
];

const feed = {
  user: {
    name: "Christina Kennedy",
    profile_pic: "https://randomuser.me/api/portraits/women/65.jpg",
  },
  time: "2 hours ago",
  text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s",
  likes: 1158,
  comments: 500,
  joined: [
    {
      id: "1",
      profile_pic: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: "2",
      profile_pic: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      id: "3",
      profile_pic: "https://randomuser.me/api/portraits/women/65.jpg",
    },
  ],
};

const events = [
  {
    id: "1",
    title: "Live on radio",
    image:
      "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80",
    location: "1000 J Freedom Trail",
  },
  {
    id: "2",
    title: "Music Event",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    location: "1000 J Front Summer",
  },
  {
    id: "3",
    title: "Happy Night",
    image:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    location: "500 Vampt St",
  },
];

const mainEventPic =
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80";

const CurrentEvent: React.FC = () => {
  const router = useRouter();
  const { current_event } = useLocalSearchParams();

  const [user, setUser] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);

  useEffect(() => {
    const settingEvent = current_event
      ? JSON.parse(current_event as string)
      : null;
    setCurrentEvent(settingEvent);
    console.log(settingEvent, " HERE ");

    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Main Event Picture with Close Button Overlay */}
      <View style={{ position: "relative" }}>
        <Image source={{ uri: mainEventPic }} style={styles.mainEventImage} />
        {/* Overlay for dark background */}
        <View style={styles.mainEventImageOverlay} />
        {/* Title centered over the image */}
        <View style={styles.mainEventTitleContainer}>
          <Text style={styles.mainEventTitle}>Party</Text>
        </View>
        {/* Stats row in the bottom right corner */}
        <View style={styles.mainEventStatsBottomRight}>
          <View style={styles.statItemWithBg}>
            <Ionicons
              name="eye"
              size={18}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statText}>1,158</Text>
          </View>
          <View style={styles.statItemWithBg}>
            <Ionicons
              name="chatbubble-ellipses"
              size={17}
              color="#fff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.statText}>500</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.closeBtnOverlay}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stories */}
      <View style={styles.storiesHeaderRow}>
        <Text style={styles.storiesTitle}>Viewers</Text>
        <TouchableOpacity>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={stories}
        horizontal
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingLeft: 16, paddingBottom: 8 }}
        renderItem={({ item }) => (
          <View style={styles.storyItem}>
            <View style={styles.storyAvatarBorder}>
              <Image
                source={{ uri: item.profile_pic }}
                style={styles.storyAvatar}
              />
            </View>
            <Text style={styles.storyName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        )}
      />

      {/* Feed Card */}
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "src/event/current-event-chat",
            params: {
              current_event: JSON.stringify(currentEvent),
            },
          })
        }
      >
        <View style={styles.feedCard}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={{ uri: feed.user.profile_pic }}
              style={styles.feedAvatar}
            />
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.feedUser}>{feed.user.name}</Text>
              <Text style={styles.feedTime}>{feed.time}</Text>
            </View>
          </View>
          <Text style={styles.feedText}>{feed.text}</Text>
          <View style={styles.feedStatsRow}>
            <View style={styles.feedJoinedRow}>
              {feed.joined.map((u, idx) => (
                <Image
                  key={u.id}
                  source={{ uri: u.profile_pic }}
                  style={[
                    styles.feedJoinedAvatar,
                    idx !== 0 && { marginLeft: -12 },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  mainEventImage: {
    width: "100%",
    height: 210,
    resizeMode: "cover",
    marginBottom: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
  },
  addBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.purple,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  storiesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 12,
  },
  storiesTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  viewAll: {
    color: Colors.purple,
    fontWeight: "600",
    fontSize: 14,
  },
  storyItem: {
    alignItems: "center",
    marginRight: 18,
    width: 60,
  },
  storyAvatarBorder: {
    borderWidth: 2,
    borderColor: Colors.purple,
    borderRadius: 32,
    padding: 2,
    marginBottom: 4,
  },
  storyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.blue_dark,
  },
  storyName: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    width: 56,
  },
  feedCard: {
    backgroundColor: Colors.blue_dark,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 18,
    marginBottom: 18,
    padding: 18,
    elevation: 2,
  },
  feedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 2,
  },
  feedUser: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  feedTime: {
    color: Colors.gray,
    fontSize: 12,
    marginTop: 2,
  },
  feedText: {
    color: Colors.gray,
    fontSize: 14,
    marginTop: 14,
    marginBottom: 18,
  },
  feedStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  feedJoinedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  feedJoinedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.blue_dark_2,
    backgroundColor: Colors.blue_dark,
  },
  eventsTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 16,
    marginBottom: 10,
  },
  eventCard: {
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginRight: 16,
    width: width * 0.42,
    paddingBottom: 12,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 90,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  mainEventTitle: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 28,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 18,
    overflow: "hidden",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    backgroundColor: "rgba(24,31,42,0.32)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  statText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  statItemWithBg: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  mainEventImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 210,
    backgroundColor: "rgba(24,31,42,0.45)",
    zIndex: 2,
  },
  // Make sure mainEventTitleContainer and mainEventStatsBottomRight have zIndex > 2
  mainEventTitleContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: 210,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  mainEventStatsBottomRight: {
    position: "absolute",
    bottom: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 3,
    gap: 10,
  },
  closeBtnOverlay: {
    position: "absolute",
    top: 18,
    left: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.purple,
    zIndex: 4,
  },
});

export default CurrentEvent;
