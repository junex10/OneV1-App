import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  TextInput,
  Alert,
} from "react-native";
import { Colors } from "./../../../resources/utils/global";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Storage } from "../../../resources/utils";
import { Events } from "../../../resources/services";
import Constants from "expo-constants";
import { useLocalSearchParams } from "expo-router";
import { FriendService } from "./../../../resources/services";

const PROFILE_PIC_SIZE = 80;
const { width, height } = Dimensions.get("window");

let DEFAULT_PIC: string;
const FriendProfile: React.FC = () => {
  const server = Constants.expoConfig?.extra?.SERVER;
  const router = useRouter();
  const { friend } = useLocalSearchParams<any>(); //

  const [subscribed, setSubscribe] = useState<boolean | null>(null);
  const [blocked, setBlocked] = useState<boolean | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any>(0);

  const checkSubscription = async (friendId: number) => {
    const currentUser = await Storage.get("user");

    const checkSubscription = await FriendService.checkFriendSubscription({
      user_id: currentUser?.user?.id,
      friend_id: friendId,
    });

    setSubscribe(checkSubscription?.friends?.result);
  };

  useEffect(() => {
    const getFriend = friend ? JSON.parse(friend as string) : null;
    checkSubscription(getFriend.id);

    (async () => {
      setUser({
        user: {
          ...getFriend,
          photo: `${server}storage/${getFriend.photo}`,
        },
      });
      setSubscribers(getFriend?.person?.subscribers);
      DEFAULT_PIC = `${server}storage/${getFriend.photo}`;
      const eventsData = await Events.getEventsByUser({
        user_id: getFriend.id,
      });
      if (eventsData.places) {
        setEvents(eventsData.places.rows);
      }
    })();
  }, [subscribed]);

  const subscribeFriend = async () => {
    try {
      const currentUser = await Storage.get("user");
      const data = await FriendService.setFriend({
        sender_id: currentUser.user.id,
        receiver_id: user.user?.id,
      });
      setSubscribe((prev) => !prev);

      // We update the number of subscribers

      setTimeout(() => {
        setSubscribers((prev: any) => Number(data?.places?.subscribers));
      }, 500);
    } catch (e) {
      Alert.prompt("Error has occurred");
    }
  };

  const formatSubscribers = (num: number) => {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + "M";
    if (num >= 1_000)
      return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + "K";
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.backBtn}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>
      <View style={styles.header}>
        <>
          <Image
            source={{
              uri: user?.user?.photo,
            }}
            style={styles.photo}
          />
          <View style={styles.info}>
            <Text style={styles.username}>{user?.user?.person?.username}</Text>
            <Text style={styles.email}>{user?.user?.email}</Text>
            <View style={styles.addressRow}></View>
            <Text style={styles.subscribers}>
              {`${formatSubscribers(subscribers)} `} subscribers
            </Text>
          </View>
        </>
      </View>
      <TouchableOpacity
        style={[
          styles.subscribeBtn,
          {
            backgroundColor: subscribed ? Colors.gray : Colors.purple,
          },
        ]}
        onPress={subscribeFriend}
      >
        <View style={styles.subscribeContent}>
          <Text style={styles.subscribeText}>
            {subscribed ? "Subscribed" : "Subscribe"}
          </Text>
          {subscribed && (
            <>
              <Ionicons
                name="notifications-outline"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
              <Ionicons
                name="checkmark-outline"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.tabs}>
        <Text style={[styles.tabText, styles.tabTextActive]}>Events</Text>
      </View>
      {/* First two events side by side */}
      <View style={styles.eventsRow}>
        {events.slice(0, 2).map((item) => (
          <TouchableOpacity
            style={[
              styles.eventCardHalf,
              {
                //backgroundColor: Colors.purple, -> Add here the current event
              },
            ]}
            key={item.id}
            onPress={() => {
              router.push({
                pathname: "/src/event/current-event",
                params: {
                  event_id: JSON.stringify(item.id),
                },
              });
            }}
          >
            <Image
              source={{
                uri: item.main_pic
                  ? `${server}/storage/${item.main_pic}`
                  : `${server}/img/random_location.jpg`,
              }}
              style={styles.eventImage}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.event_type?.name}</Text>
              <Text style={styles.eventDesc}>{item.content}</Text>
              {item.address ? (
                <View style={styles.eventRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={Colors.purple}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.eventAddress} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      {events.length === 0 && (
        <Text
          style={{
            color: "#bfc8d6",
            textAlign: "center",
            marginTop: 32,
            fontSize: 16,
          }}
        >
          No events to show yet.
        </Text>
      )}

      {/* The rest as a vertical list */}
      <FlatList
        data={events.slice(2)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.eventCardFull}
            onPress={() => {
              router.push({
                pathname: "/src/event/current-event",
                params: {
                  event_id: JSON.stringify(item.id),
                },
              });
            }}
          >
            <Image
              source={{
                uri: item.main_pic
                  ? `${server}/storage/${item.main_pic}`
                  : `${server}/img/random_location.jpg`,
              }}
              style={styles.eventImage}
            />
            <View style={styles.eventInfo}>
              <Text style={styles.eventTitle}>{item.event_type?.name}</Text>
              <Text style={styles.eventDesc}>{item.content}</Text>
              {item.address ? (
                <View style={styles.eventRow}>
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={Colors.purple}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.eventAddress}>{item.address}</Text>
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.eventsListVertical}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
const PIC_SIZE = 160;
const styles = StyleSheet.create({
  picContainer: {
    width: PIC_SIZE,
    height: PIC_SIZE,
    borderRadius: PIC_SIZE / 2,
    backgroundColor: Colors.blue_dark,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Colors.purple,
    marginBottom: 16,
    alignSelf: "center",
    position: "relative",
  },
  pic: {
    width: PIC_SIZE,
    height: PIC_SIZE,
    borderRadius: PIC_SIZE / 2,
    resizeMode: "cover",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  cameraIcon: {
    fontSize: 20,
    color: Colors.purple,
  },
  saveBtn: {
    position: "absolute",
    bottom: 40,
    left: 32,
    right: 32,
    backgroundColor: Colors.purple,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  saveBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.5,
  },
  fieldEdit: {
    top: 60,
  },
  editContainer: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingTop: 48,
  },
  editHint: {
    color: "#bfc3c9",
    fontSize: 13,
    textAlign: "center",
    marginTop: 18,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  editFieldRow: {
    backgroundColor: Colors.blue_dark_2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue_dark,
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  editFieldValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "500",
  },
  eventsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  eventCardHalf: {
    width: (width - 24 * 2 - 12) / 2, // 2 cards with 12px gap
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginRight: 12,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventCardFull: {
    width: width - 48,
    alignSelf: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginBottom: 16,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventsListVertical: {
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
    paddingTop: 48,
    paddingHorizontal: 0,
  },
  backBtn: {
    position: "absolute",
    top: 48,
    left: 24,
    backgroundColor: Colors.purple,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    zIndex: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 12,
    alignSelf: "center",
  },
  photo: {
    width: PROFILE_PIC_SIZE,
    height: PROFILE_PIC_SIZE,
    borderRadius: PROFILE_PIC_SIZE / 2,
    borderWidth: 3,
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
    marginRight: 18,
  },
  info: {
    justifyContent: "center",
  },
  username: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 2,
  },
  email: {
    color: Colors.purple,
    fontSize: 15,
    fontWeight: "500",
  },
  subscribers: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 2,
    opacity: 0.7,
  },
  subscribeBtn: {
    flexDirection: "row",
    alignSelf: "center",
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 36,
    marginBottom: 18,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 8,
    marginTop: 8,
  },
  tab: {
    marginHorizontal: 18,
    alignItems: "center",
  },
  tabText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    opacity: 0.7,
  },
  tabTextActive: {
    color: Colors.purple,
    opacity: 1,
  },
  tabUnderline: {
    marginTop: 3,
    height: 3,
    width: 32,
    backgroundColor: Colors.purple,
    borderRadius: 2,
  },
  eventsList: {
    paddingLeft: 24,
    paddingVertical: 12,
  },
  eventCard: {
    width: width * 0.6,
    height: 300,
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginRight: 18,
    padding: 0,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  eventImage: {
    width: "100%",
    height: 110,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventInfo: {
    padding: 12,
  },
  eventTitle: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  eventDesc: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.85,
    marginBottom: 4,
  },
  eventRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  eventAddress: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
  eventUsername: {
    color: Colors.purple,
    fontSize: 13,
    marginLeft: 2,
    opacity: 0.9,
  },
  fieldWrapper: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: Colors.purple,
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  fieldValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  address: {
    color: "#fff",
    fontSize: 13,
    opacity: 0.8,
  },
});

export default FriendProfile;
