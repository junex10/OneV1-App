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
import { Colors } from "../../../resources/utils/global";
import { Storage } from "../../../resources/utils";
import { Events } from "../../../resources/services";
import Constants from "expo-constants";
import moment from "moment";

const server = Constants.expoConfig?.extra?.SERVER;

const CurrentEventList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState<any>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const data = await Events.getAllMyEvents({ user_id: getUser.user.id });
      setEvents(data.events);
    })();
  }, []);

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
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }: any) => (
          <View style={styles.card}>
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
              <Text style={styles.location}>{item.location}</Text>
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
                <>
                  <TouchableOpacity style={styles.joinBtn}>
                    <Text style={styles.joinText}>+ Join</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.notInterestedBtn}>
                    <Text style={styles.notInterestedText}>
                      — Not Interested
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.joinedBtn}>
                  <Text style={styles.joinedText}>+ Joined</Text>
                </View>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={{ padding: 18 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
