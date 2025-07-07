import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  TextInput,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../resources/utils";
import { useRouter } from "expo-router";
import { FriendService } from "../../../resources/services";
import { Storage } from "./../../../resources/utils";
import Constants from "expo-constants";

const FRIEND_PIC_SIZE = 54;
const server = Constants.expoConfig?.extra?.SERVER;

const FriendsList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [friends, setFriends] = useState<any[] | null>(null);
  const [filteredFriends, setFilteredFriends] = useState<any[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchFriends = useCallback(async () => {
    const getUser = await Storage.get("user");
    setUser(getUser);

    const data = await FriendService.getFriends({
      user_id: getUser?.user?.id,
    });
    setFriends(data?.friends?.friends);
    setFilteredFriends(data?.friends?.friends);
  }, []);

  useEffect(() => {
    (async () => {
      const getUser = await Storage.get("user");
      setUser(getUser);

      const data = await FriendService.getFriends({
        user_id: getUser?.user?.id,
      });
      setFriends(data?.friends?.friends);
      setFilteredFriends(data?.friends?.friends);
    })();
  }, []);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  useEffect(() => {
    if (!friends) return;
    const q = search.trim().toLowerCase();
    if (!q) {
      setFilteredFriends(friends);
    } else {
      setFilteredFriends(
        friends.filter((item) =>
          item?.person?.username?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, friends]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const handleAddFriend = async (friend_id: number) => {
    if (user) {
      await FriendService.setFriend({
        sender_id: user.user?.id,
        receiver_id: friend_id,
      });
      // Update local state to reflect the new friend
      setFilteredFriends((prev) =>
        prev
          ? prev.map((item) =>
              item.id === friend_id ? { ...item, isFriend: true } : item
            )
          : prev
      );
      setFriends((prev) =>
        prev
          ? prev.map((item) =>
              item.id === friend_id ? { ...item, isFriend: true } : item
            )
          : prev
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          style={styles.chatListBtn}
          onPress={() => router.push("/src/chat/chat-list")}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons
          name="search"
          size={20}
          color="#bfc3c9"
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor="#bfc3c9"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Friends List */}
      <Text style={styles.sectionTitle}>Find Friends</Text>
      <FlatList
        data={filteredFriends || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Image
              source={{
                uri: item?.photo
                  ? `${server}storage/${item?.photo}`
                  : `${server}img/random_location.jpg`,
              }}
              style={styles.pic}
            />
            <View style={styles.info}>
              <Text style={styles.username}>{item?.person?.username}</Text>
              {item.isFriend && <Text style={styles.addedText}>Added</Text>}
            </View>
            {/* Add button (only if not friend) */}
            {!item.isFriend && (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => handleAddFriend(item.id)}
              >
                <Ionicons name="person-add" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add</Text>
              </TouchableOpacity>
            )}
            {/* Arrow to chat */}
            <TouchableOpacity
              style={styles.arrowBtn}
              onPress={() =>
                router.push({
                  pathname: "src/chat/chat",
                  params: {
                    friend: JSON.stringify(item),
                  },
                })
              }
            >
              <Ionicons
                name="arrow-forward-outline"
                size={28}
                color={Colors.purple}
                style={styles.addedIcon}
              />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.purple]}
            tintColor={Colors.purple}
            progressBackgroundColor={Colors.blue_dark}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  chatListBtn: {
    marginLeft: "auto",
    backgroundColor: Colors.purple,
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark_2,
  },
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
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 18,
    marginHorizontal: 18,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
  },
  sectionTitle: {
    color: Colors.purple,
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 24,
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  listContainer: {
    paddingBottom: 24,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.blue_dark,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  pic: {
    width: FRIEND_PIC_SIZE,
    height: FRIEND_PIC_SIZE,
    borderRadius: FRIEND_PIC_SIZE / 2,
    marginRight: 14,
    borderWidth: 2,
    borderColor: Colors.purple,
    backgroundColor: "#fff1fa",
  },
  info: {
    flex: 1,
    justifyContent: "center",
  },
  username: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  handle: {
    color: "#bfc3c9",
    fontSize: 14,
    marginTop: 2,
  },
  addedIcon: {
    marginLeft: 8,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.purple,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginLeft: 8,
    marginRight: 0,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  arrowBtn: {
    marginLeft: 8,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  addedText: {
    color: Colors.purple,
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 2,
  },
});

export default FriendsList;
