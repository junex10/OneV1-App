import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "./../../../resources/utils/global";
import { useRouter } from "expo-router";
import { Notifications } from "../../../resources/services";
import { Storage } from "../../../resources/utils";
import moment from "moment";

const NOTIFICATIONS_STATUS = {
  READED: 1,
  UNREADED: 0,
};

const NotificationsScreen: React.FC = () => {
  const router = useRouter();

  const [notifications, setNotifications] = useState<any>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const getUser = await Storage.get("user");

      const notifications = await Notifications.getNotifications({
        user_id: getUser?.user?.id,
      });

      setNotifications(notifications?.notifications);
    };

    fetchNotifications();
  }, []);

  const renderItem = ({ item }: any) => {
    const isNew = item.status !== NOTIFICATIONS_STATUS.READED;
    return (
      <View
        style={[styles.notificationCard, isNew && styles.newNotificationCard]}
      >
        <View style={styles.notificationHeader}>
          <Text
            style={[
              styles.notificationTitle,
              isNew && styles.newNotificationTitle,
            ]}
          >
            {item.title}
          </Text>
          {isNew && (
            <Ionicons
              name="alert-circle"
              size={20}
              color={Colors.purple}
              style={{ marginLeft: 6 }}
            />
          )}
        </View>
        <Text style={styles.notificationTime}>
          {moment(item.created_at).fromNow()}
        </Text>
        <Text style={styles.notificationDescription}>{item.message}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color={Colors.purple} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.blue_dark,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: Colors.blue_dark_2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.blue_dark,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.purple,
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  notificationCard: {
    backgroundColor: Colors.blue_dark_2,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6, // Added for Android and more prominent shadow
  },
  newNotificationCard: {
    borderWidth: 1.5,
    borderColor: Colors.purple,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  newNotificationTitle: {
    color: Colors.purple,
  },
  notificationTime: {
    color: Colors.gray,
    fontSize: 13,
    marginBottom: 6,
  },
  notificationDescription: {
    color: Colors.gray,
    fontSize: 15,
  },
});

export default NotificationsScreen;
