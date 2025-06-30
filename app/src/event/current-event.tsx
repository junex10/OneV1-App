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
import { Colors, SocketEvents } from "../../../resources/utils/global";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Storage } from "../../../resources/utils";
import { Ionicons } from "@expo/vector-icons";
import { Events } from "../../../resources/services";
import Constants from "expo-constants";
import { Modal } from "react-native";
import moment from "moment";
import { socket } from "../../../resources/providers/socket";

const { width } = Dimensions.get("window");
const server = Constants.expoConfig?.extra?.SERVER;

const mainEventPic =
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80";

const CurrentEvent: React.FC = () => {
  const router = useRouter();
  const { event_id } = useLocalSearchParams();

  const [user, setUser] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [viewers, setViewers] = useState<any>(null);
  const [viewAllVisible, setViewAllVisible] = useState(false);
  const [countComments, setCountComments] = useState<number>(0);
  const [likes, setLikes] = useState(currentEvent?.likes || 0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const event = event_id ? JSON.parse(event_id as string) : null;

    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const eventData = await Events.getEvent({ event_id: event });
      setCurrentEvent(eventData?.place);

      const viewersData = await Events.getViewers({
        event_id: event,
        user_id: getUser.user.id,
      });
      setViewers(viewersData.viewers);

      const commentData = await Events.getComments({
        event_id: event,
        count_comments: true, // We will bring the comments, only the count
      });
      setCountComments(commentData?.comments);

      socket?.emit(SocketEvents.EVENTS.USER_JOINING, {
        user_id: getUser.user.id,
        event_id: event,
      });
    })();

    return () => {
      socket?.off(SocketEvents.EVENTS.USER_JOINING);
    };
  }, []);

  const handleLike = () => {
    if (!liked) {
      setLikes(likes + 1);
      setLiked(true);
      // Optionally, call your API to persist the like
      // await Events.likeEvent({ event_id: currentEvent.id, user_id: user.user.id });
    } else {
      setLikes(likes - 1);
      setLiked(false);
      // Optionally, call your API to remove the like
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Main Event Picture with Close Button Overlay */}
        <View style={{ position: "relative" }}>
          <Image source={{ uri: mainEventPic }} style={styles.mainEventImage} />
          {/* Overlay for dark background */}
          <View style={styles.mainEventImageOverlay} />
          {/* Title centered over the image */}
          <View style={styles.mainEventTitleContainer}>
            <Text style={styles.mainEventTitle} numberOfLines={1}>
              {currentEvent?.title}
            </Text>
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
              <Text style={styles.statText}>
                {viewers ? viewers.length : 0}
              </Text>
            </View>
            <View style={styles.statItemWithBg}>
              <Ionicons
                name="chatbubble-ellipses"
                size={17}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.statText}>{countComments}</Text>
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
          <TouchableOpacity onPress={() => setViewAllVisible(true)}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={viewers}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingBottom: 8 }}
          renderItem={({ item }) => (
            <View style={styles.storyItem}>
              <View style={styles.storyAvatarBorder}>
                <Image
                  source={{
                    uri: item?.user?.photo
                      ? `${server}storage/${item?.user?.photo}`
                      : `${server}img/random_location.jpg`,
                  }}
                  style={styles.storyAvatar}
                />
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {item.name}
              </Text>
            </View>
          )}
        />

        {/* View All Modal */}
        <Modal
          visible={viewAllVisible}
          animationType="slide"
          onRequestClose={() => setViewAllVisible(false)}
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Joined Users ({viewers ? viewers.length : 0})
                </Text>
                <TouchableOpacity onPress={() => setViewAllVisible(false)}>
                  <Ionicons name="close" size={28} color={Colors.purple} />
                </TouchableOpacity>
              </View>
              <FlatList
                data={viewers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.modalUserRow}>
                    <Image
                      source={{
                        uri: item?.user?.photo
                          ? `${server}storage/${item?.user?.photo}`
                          : `${server}img/random_location.jpg`,
                      }}
                      style={styles.storyAvatar}
                    />
                    <Text style={styles.modalUserName}>{item.name}</Text>
                  </View>
                )}
                contentContainerStyle={{ paddingBottom: 24 }}
              />
            </View>
          </View>
        </Modal>
      </ScrollView>
      <View style={styles.bottomActions}>
        <TouchableOpacity
          onPress={handleLike}
          style={styles.likeButton}
          activeOpacity={0.8}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={34}
            color={liked ? Colors.purple : "#fff"}
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 22 }}>
            {likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.commentsButton}
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "src/event/current-event-chat",
              params: {
                current_event: JSON.stringify(currentEvent),
              },
            })
          }
        >
          <Ionicons
            name="chatbubble-ellipses"
            size={26}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 19 }}>
            Comments
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  likeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.purple,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginRight: 10,
    elevation: 3,
  },
  commentsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.purple,
    borderRadius: 30,
    paddingVertical: 12,
    paddingHorizontal: 28,
    elevation: 3,
  },
  bottomActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.blue_dark_2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    zIndex: 10,
  },
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
    color: Colors.purple,
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
    fontSize: 26,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.blue_dark,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 20,
  },
  modalUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modalUserName: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 14,
  },
});

export default CurrentEvent;
