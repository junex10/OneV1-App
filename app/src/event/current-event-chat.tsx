import React, { useEffect, useRef, useState } from "react";
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
  Animated,
} from "react-native";
import {
  Colors,
  SocketEvents,
  EventStatus,
} from "../../../resources/utils/global";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Storage, eventBus } from "../../../resources/utils";
import Constants from "expo-constants";
import { Events } from "../../../resources/services";
import { socket } from "../../../resources/providers/socket";
import moment from "moment";

const { width, height } = Dimensions.get("window");
const server = Constants.expoConfig?.extra?.SERVER;

const CurrentEventChat: React.FC = () => {
  const router = useRouter();
  const { current_event } = useLocalSearchParams();
  const flatListRef = React.useRef<FlatList>(null);

  const [elapsed, setElapsed] = useState("00:00:00");
  const [user, setUser] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [comments, setComments] = useState<any>();
  const [backgroundPic, setBackgroundPic] = useState<any>();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<any>();

  const [popupVisible, setPopupVisible] = useState(false); // Popup new message notification
  const [popupData, setPopupData] = useState<{
    title: string;
    message: string;
  } | null>(null); // Popup new message notification

  // Animation value for popup opacity and translateY
  const popupAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const eventForm = current_event
      ? JSON.parse(current_event as string)
      : null;
    setCurrentEvent(eventForm);

    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      setBackgroundPic(eventForm?.event_type?.default_pic);
      setStatus(eventForm?.status);

      const getComments = await Events.getComments({ event_id: eventForm?.id });
      setComments(getComments?.comments);
    })();
  }, []);

  useEffect(() => {
    const onNewComment = (receiver: any) => {
      if (receiver?.comment) {
        setComments((prev: any[]) => [...(prev || []), receiver.comment]);
      }
    };
    eventBus.on(SocketEvents.EVENTS.NEW_COMMENT, onNewComment);
    return () => {
      eventBus.off(SocketEvents.EVENTS.NEW_COMMENT, onNewComment);
    };
  }, []);

  useEffect(() => {
    if (!currentEvent?.starting_event) return;

    // If event is finished or closed, show total duration and do not start timer
    if (status === EventStatus.FINISHED || status === EventStatus.CLOSED) {
      if (currentEvent?.expiration_time && currentEvent?.starting_event) {
        const start = moment(currentEvent.starting_event);
        const end = moment(currentEvent.expiration_time);
        const duration = moment.duration(end.diff(start));
        const h = String(Math.floor(duration.asHours())).padStart(2, "0");
        const m = String(duration.minutes()).padStart(2, "0");
        const s = String(duration.seconds()).padStart(2, "0");
        setElapsed(`${h}:${m}:${s}`);
      }
      return;
    } else {
      const updateElapsed = () => {
        const start = moment(currentEvent.starting_event);
        const now = moment();
        const duration = moment.duration(now.diff(start));
        const h = String(Math.floor(duration.asHours())).padStart(2, "0");
        const m = String(duration.minutes()).padStart(2, "0");
        const s = String(duration.seconds()).padStart(2, "0");
        setElapsed(`${h}:${m}:${s}`);
      };

      updateElapsed();
      const interval = setInterval(updateElapsed, 1000);
      return () => clearInterval(interval);
    }
  }, [currentEvent?.starting_event, status]);

  useEffect(() => {
    if (flatListRef.current && comments?.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [comments]);

  useEffect(() => {
    // We get new notification so we update the count

    const handleNewNotificationMessage = (data: any) => {
      handleNewMessagePopup(data); // We pop up notification container
    };

    // Show popup with animation -- New message notification popup
    const handleNewMessagePopup = (data: any) => {
      setPopupData({
        title: data?.title || "New Message",
        message: data?.message || "",
      });
      setPopupVisible(true);
      popupAnim.setValue(1);
      setTimeout(() => {
        Animated.timing(popupAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setPopupVisible(false));
      }, 3500);
    };

    eventBus.on(
      SocketEvents.NOTIFICATIONS.NEW_MESSAGE,
      handleNewNotificationMessage
    );

    return () => {
      eventBus.off(
        SocketEvents.NOTIFICATIONS.NEW_MESSAGE,
        handleNewNotificationMessage
      );
    };
  }, []);

  // Hide popup immediately on press with animation -- new notification container
  const handlePopupPress = () => {
    Animated.timing(popupAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setPopupVisible(false));
  };

  const handleSend = () => {
    if (!input.trim()) return;
    socket?.emit(SocketEvents.EVENTS.NEW_COMMENT, {
      event_id: currentEvent?.id,
      user_id: user?.user?.id,
      comment: input,
    });
    setInput("");
  };

  return (
    <ImageBackground source={{ uri: server + backgroundPic }} style={styles.bg}>
      {/**  We adding pop up notification */}
      {popupVisible && popupData && (
        <Animated.View
          style={[
            styles.topPopupContainer,
            {
              opacity: popupAnim,
              transform: [
                {
                  translateY: popupAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-40, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={handlePopupPress}>
            <View style={styles.topPopupInner}>
              <Text style={styles.topPopupTitle}>{popupData.title}</Text>
              <Text style={styles.topPopupMessage} numberOfLines={2}>
                {popupData.message}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Top Bar with avatar, name, timer, close */}
      <View
        style={[
          styles.topBarFull,
          status === EventStatus.CLOSED && { bottom: 60 },
        ]}
      >
        <Image
          source={{
            uri: currentEvent?.user?.photo
              ? `${server}storage/${currentEvent?.user?.photo}`
              : `${server}img/random_location.jpg`,
          }}
          style={styles.avatar}
        />
        <View style={styles.topBarTextContainer}>
          <Text style={styles.userName}>
            {currentEvent?.user?.person?.username}
          </Text>
          <Text style={[styles.time, { minWidth: 70, textAlign: "left" }]}>
            {elapsed}
          </Text>
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
        ref={flatListRef}
        data={comments}
        keyExtractor={(item, index) => `comment-${index}`}
        style={styles.commentsList}
        contentContainerStyle={{ paddingBottom: 60 }}
        renderItem={({ item }) => {
          const isMine = item.user?.id === user?.user?.id;
          return (
            <View
              style={[
                styles.commentRow,
                isMine && { flexDirection: "row-reverse" },
              ]}
            >
              <Image
                source={{
                  uri: item?.user?.photo
                    ? `${server}storage/${item?.user?.photo}`
                    : `${server}img/random_location.jpg`,
                }}
                style={[
                  styles.commentAvatar,
                  isMine && {
                    borderColor: Colors.purple,
                    marginLeft: 10,
                    marginRight: 0,
                  },
                ]}
              />
              <View
                style={[
                  styles.commentBubble,
                  isMine && {
                    backgroundColor: Colors.purple,
                    opacity: 0.85,
                    alignItems: "flex-end",
                  },
                ]}
              >
                <Text style={[styles.commentUser, isMine && { color: "#fff" }]}>
                  {item?.user?.person?.username}
                </Text>
                <Text style={[styles.commentText, isMine && { color: "#fff" }]}>
                  {item?.comment}
                </Text>
              </View>
            </View>
          );
        }}
      />
      {/* Comment Input */}
      {status !== EventStatus.CLOSED ? (
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Write a Comment..."
            placeholderTextColor={Colors.gray}
            onChangeText={setInput}
            value={input}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ height: 32 }} /> // Spacer for visual balance
      )}
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
  topPopupContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 36,
    paddingHorizontal: 16,
  },
  topPopupInner: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 8,
  },
  topPopupTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: Colors.purple,
    marginBottom: 4,
  },
  topPopupMessage: {
    color: Colors.gray,
    fontSize: 14,
  },
});
export default CurrentEventChat;
