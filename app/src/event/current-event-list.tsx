import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Colors,
  SocketEvents,
  eventBus,
} from "../../../resources/utils/global";
import { Storage } from "../../../resources/utils";
import { Events } from "../../../resources/services";
import { socket } from "../../../resources/providers/socket";
import Constants from "expo-constants";
import moment from "moment";
import { useRouter } from "expo-router";

const server = Constants.expoConfig?.extra?.SERVER;

const CurrentEventList: React.FC = () => {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any>([]);
  const [user, setUser] = useState<any>(null);
  const [filteredEvents, setFilteredEvents] = useState<any>([]);

  useEffect(() => {
    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const data = await Events.getAllMyEvents({ user_id: getUser.user.id });
      setEvents(data.events);
      setFilteredEvents(data.events);
    })();
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredEvents(events);
      return;
    }
    const lower = search.toLowerCase();
    setFilteredEvents(
      events.filter(
        (item: any) =>
          item.title?.toLowerCase().includes(lower) ||
          item.content?.toLowerCase().includes(lower) ||
          item.address?.toLowerCase().includes(lower)
      )
    );
  }, [search, events]);

  useEffect(() => {
    eventBus.on(SocketEvents.EVENTS.USER_JOINING, (data) => {
      if (data) {
        setEvents((prevEvents: any[]) =>
          prevEvents.map((event) =>
            event.id === data.data.event_id ? { ...event, joined: true } : event
          )
        );
      }
    });
    eventBus.on(SocketEvents.EVENTS.USER_LEFT, (data) => {
      if (data) {
        setEvents((prevEvents: any[]) =>
          prevEvents.map((event) =>
            event.id === data.data.event_id
              ? { ...event, joined: false }
              : event
          )
        );
      }
    });
    return () => {
      eventBus.off(SocketEvents.EVENTS.USER_JOINING);
      eventBus.off(SocketEvents.EVENTS.USER_LEFT);
    };
  }, []);

  const joinEvent = (event_id: number) => {
    socket?.emit(SocketEvents.EVENTS.USER_JOINING, {
      user_id: user?.user.id,
      event_id,
    });
  };

  const leftEvent = (event_id: number) => {
    socket?.emit(SocketEvents.EVENTS.USER_LEFT, {
      user_id: user?.user.id,
      event_id,
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <Ionicons
          name="search"
          size={18}
          color={Colors.gray}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {filteredEvents.length === 0 && (
        <View style={{ alignItems: "center", marginTop: 48 }}>
          <Text
            style={{ color: Colors.gray, fontSize: 17, textAlign: "center" }}
          >
            No events found.
          </Text>
        </View>
      )}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => {
              router.push({
                pathname: "/src/event/current-event",
                params: {
                  event_id: JSON.stringify(item.id),
                },
              });
            }}
          >
            <View style={styles.headerRow}>
              <Text style={styles.title}>{item.title}</Text>
              <Image
                source={{
                  uri: item?.user?.photo
                    ? `${server}storage/${item?.user?.photo}`
                    : `${server}img/random_location.jpg`,
                }}
                style={styles.avatar}
              />
            </View>
            <Text style={styles.desc}>{item.content}</Text>
            <View style={styles.infoRow}>
              <Ionicons
                name="location-outline"
                size={16}
                color={Colors.gray}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.location}>{item.address}</Text>
            </View>
            <View style={styles.dateTimeRow}>
              <Ionicons
                name="calendar-outline"
                size={15}
                color={Colors.gray}
                style={{ marginRight: 4 }}
              />
              <Text style={styles.date}>
                {moment(item?.starting_event, [
                  "MM/DD/YYYY",
                  moment.ISO_8601,
                ]).format("MM/DD/YYYY")}
              </Text>
              <Ionicons
                name="time-outline"
                size={15}
                color={Colors.gray}
                style={{ marginLeft: 16, marginRight: 4 }}
              />
              <Text style={styles.time}>
                {moment(item?.starting_event, [
                  "HH:mm",
                  moment.ISO_8601,
                ]).format("HH:mm a")}
              </Text>
            </View>
            <View style={styles.actionsRow}>
              {!item.joined ? (
                <TouchableOpacity
                  style={styles.joinBtn}
                  onPress={() => joinEvent(item.id)}
                >
                  <Text style={styles.joinText}>+ Join</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.joinedBtn}
                  onPress={() => leftEvent(item.id)}
                >
                  <Text style={styles.joinedText}>+ Joined</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ padding: 18 }}
      />
      <TouchableOpacity
        style={styles.comeBackBtn}
        onPress={() => router.back()}
        activeOpacity={0.8}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  comeBackBtn: {
    position: "absolute",
    left: 24,
    bottom: 32,
    backgroundColor: Colors.purple,
    borderRadius: 24,
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    margin: 18,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 4,
  },
  card: {
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    flex: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  desc: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  location: {
    color: Colors.gray,
    fontSize: 13,
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  date: {
    color: Colors.gray,
    fontSize: 13,
  },
  time: {
    color: Colors.gray,
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  joinBtn: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: Colors.green,
    marginRight: 12,
  },
  joinText: {
    color: Colors.green,
    fontWeight: "bold",
    fontSize: 15,
  },
  notInterestedBtn: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  notInterestedText: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 15,
  },
  joinedBtn: {
    backgroundColor: "transparent",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: Colors.green,
  },
  joinedText: {
    color: Colors.green,
    fontWeight: "bold",
    fontSize: 15,
  },
});

export default CurrentEventList;
