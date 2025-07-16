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
  TextInput,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  Colors,
  SocketEvents,
  eventBus,
  EventStatus,
  MAX_FILE_SIZE_MB,
} from "../../../resources/utils/global";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CustomModal, Storage } from "../../../resources/utils";
import { Ionicons } from "@expo/vector-icons";
import { Events } from "../../../resources/services";
import Constants from "expo-constants";
import { Modal } from "react-native";
import { socket } from "../../../resources/providers/socket";
import { useLocation } from "../../../resources/providers/location";

const { width } = Dimensions.get("window");
const server = Constants.expoConfig?.extra?.SERVER;

const mainEventPic =
  "https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80";

const CurrentEvent: React.FC = () => {
  const router = useRouter();
  const getLocation: any = useLocation();

  const { event_id } = useLocalSearchParams();

  const [user, setUser] = useState<any>(null);
  const [currentEvent, setCurrentEvent] = useState<any>(null);
  const [viewers, setViewers] = useState<any>(null);
  const [viewAllVisible, setViewAllVisible] = useState(false);
  const [countComments, setCountComments] = useState<number>(0);
  const [likes, setLikes] = useState(currentEvent?.likes || 0);
  const [status, setStatus] = useState<any>();

  const [postModalVisible, setPostModalVisible] = useState(false);
  const [postText, setPostText] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [locationAttached, setLocationAttached] = useState(false);
  const [showFileSizeError, setShowFileSizeError] = useState(false);

  useEffect(() => {
    const event = event_id ? JSON.parse(event_id as string) : null;

    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const eventData = await Events.getEvent({ event_id: event });
      setCurrentEvent(eventData?.place);
      setStatus(eventData?.place?.status);

      setLikes(eventData?.place?.likes);

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

  useEffect(() => {
    eventBus.on(SocketEvents.EVENTS.NEW_LIKE, (data: any) => {
      setLikes(data?.comment?.likes);
    });

    return () => {
      eventBus.off(SocketEvents.EVENTS.NEW_LIKE);
    };
  }, []);

  const handleAttachLocation = () => {
    setSelectedLocation({
      latitude: getLocation.coords.latitude,
      longitude: getLocation.coords.longitude,
    });
    setLocationAttached(true);
  };

  const handleTakePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selected = result.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(selected.uri);
      let fileSizeMB = 0;
      if (fileInfo.exists && fileInfo.size) {
        fileSizeMB = fileInfo.size / (1024 * 1024);
      }

      if (fileSizeMB > MAX_FILE_SIZE_MB) {
        setShowFileSizeError(true);
        return;
      }

      if (
        selected.mimeType?.startsWith("image/") ||
        selected.mimeType?.startsWith("video/")
      ) {
        const base64 = await FileSystem.readAsStringAsync(selected.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setSelectedMedia({
          fileName: selected.fileName,
          mimeType: selected.mimeType,
          base64, // send base64 string
        });
      } else {
        Alert.alert("Only images are allowed.");
      }
    }
  };

  const handleLike = () => {
    socket?.emit(SocketEvents.EVENTS.NEW_LIKE, {
      event_id: currentEvent?.id,
      user_id: user?.user?.id,
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  return (
    <View style={{ flex: 1 }}>
      <CustomModal
        visible={showFileSizeError}
        title="File Too Large"
        message="The selected file exceeds the 16MB limit."
        onClose={() => setShowFileSizeError(false)}
        timeout={3000}
      />
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
            <View style={styles.statItemWithBg}>
              <Ionicons
                name="heart"
                size={17}
                color="#fff"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.statText}>{formatNumber(likes)}</Text>
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
      <View style={styles.fabNavContainer}>
        <TouchableOpacity
          style={styles.fabNavItem}
          onPress={handleLike}
          activeOpacity={0.8}
          disabled={status === EventStatus.CLOSED}
        >
          <Ionicons name="heart" size={30} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fabNavCenter}
          onPress={() => setPostModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={34} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fabNavItem}
          onPress={() =>
            router.push({
              pathname: "src/event/current-event-chat",
              params: { current_event: JSON.stringify(currentEvent) },
            })
          }
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/** New post related to the event */}
      <Modal
        visible={postModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPostModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.sendPostModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Send new post</Text>
              <TouchableOpacity onPress={() => setPostModalVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.purple} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.sendPostInput}
              placeholder="What's happening?"
              placeholderTextColor={Colors.gray}
              value={postText}
              onChangeText={setPostText}
              multiline
              maxLength={180}
            />
            <Text style={{ color: Colors.gray, marginBottom: 8 }}>
              {postText.length} / 180 Characters
            </Text>
            <View style={styles.sendPostOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.sendPostOptionBtn,
                  locationAttached && styles.sendPostOptionBtnDisabled,
                ]}
                onPress={handleAttachLocation}
                disabled={locationAttached}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={[
                      styles.sendPostOptionBtnText,
                      locationAttached && styles.sendPostOptionBtnTextDisabled,
                    ]}
                  >
                    Attach Location
                  </Text>
                  {locationAttached && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sendPostOptionBtn}
                onPress={handleTakePicture}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.sendPostOptionBtnText}>Take Picture</Text>
                  {selectedMedia && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  )}
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.sendPostActionsRow}>
              <TouchableOpacity
                onPress={() => setPostModalVisible(false)}
                style={styles.sendPostCancelBtn}
              >
                <Text style={styles.sendPostCancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {}} style={styles.sendPostBtn}>
                <Text style={styles.sendPostBtnText}>SEND POST</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sendPostOptionBtnDisabled: {
    backgroundColor: Colors.gray,
    borderColor: Colors.gray,
  },
  sendPostOptionBtnTextDisabled: {
    color: "#fff",
    opacity: 0.7,
  },
  sendPostOptionBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  sendPostOptionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  sendPostModalContent: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginTop: "auto",
    marginBottom: "auto",
    minWidth: 320,
    maxWidth: 400,
  },
  sendPostInput: {
    backgroundColor: Colors.blue_dark_2,
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    marginBottom: 8,
  },
  sendPostOptionsRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 16,
    gap: 18,
  },
  sendPostOption: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 18,
    textDecorationLine: "underline",
  },
  sendPostActionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  sendPostBtn: {
    backgroundColor: Colors.purple,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  sendPostBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  sendPostCancelBtn: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: "center",
  },
  sendPostCancelText: {
    color: Colors.gray,
    fontWeight: "bold",
    fontSize: 16,
  },
  fabNavContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: "row",
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 40,
    height: 70,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    elevation: 8,
    shadowColor: "#000",
    zIndex: 20,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
  },
  fabNavItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  fabNavCenter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.purple,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -28,
    elevation: 10,
    shadowColor: Colors.purple,
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
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
